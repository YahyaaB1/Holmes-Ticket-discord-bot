const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
} = require('discord.js');
const { getGuildConfig, nextTicketNumber } = require('./config');

async function handleCreateTicket(interaction) {
  const cfg = getGuildConfig(interaction.guild.id);
  if (!cfg) {
    return interaction.reply({
      content: "❌ Le système de tickets n'est pas encore configuré (`/setup`).",
      ephemeral: true,
    });
  }

  // Check if user already has an open ticket
  const existing = interaction.guild.channels.cache.find(
    (c) => c.topic === `ticket-owner:${interaction.user.id}` && c.parentId === cfg.openCategoryId
  );
  if (existing) {
    return interaction.reply({
      content: `❌ Tu as déjà un ticket ouvert : <#${existing.id}>`,
      ephemeral: true,
    });
  }

  const number = nextTicketNumber(interaction.guild.id);
  const channelName = `ticket-${number.toString().padStart(4, '0')}`;

  const permissionOverwrites = [
    {
      id: interaction.guild.roles.everyone.id,
      deny: [PermissionFlagsBits.ViewChannel],
    },
    {
      id: interaction.user.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
      ],
    },
    {
      id: cfg.adminRoleId,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
      ],
    },
  ];

  const ticketChannel = await interaction.guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: cfg.openCategoryId,
    topic: `ticket-owner:${interaction.user.id}`,
    permissionOverwrites,
  });

  const embed = new EmbedBuilder()
    .setColor(0xd4af37)
    .setTitle(`🎫 Ticket #${number.toString().padStart(4, '0')}`)
    .setDescription(
      `Bienvenue ${interaction.user}, un membre du staff va te répondre bientôt.\n\nDécris ton problème ou ta demande ci-dessous.`
    )
    .setFooter({ text: 'Full programmed by Mr H for Holmes Codelab — eagle-holmes.netlify.app' });

  const closeRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('hc_close_ticket')
      .setLabel('Fermer le ticket')
      .setEmoji('🔒')
      .setStyle(ButtonStyle.Danger)
  );

  await ticketChannel.send({
    content: `${interaction.user} <@&${cfg.adminRoleId}>`,
    embeds: [embed],
    components: [closeRow],
  });

  await interaction.reply({
    content: `✅ Ton ticket a été créé : ${ticketChannel}`,
    ephemeral: true,
  });

  if (cfg.logsChannelId) {
    const logsChannel = interaction.guild.channels.cache.get(cfg.logsChannelId);
    if (logsChannel) {
      const logEmbed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle('🎫 Ticket ouvert')
        .addFields(
          { name: 'Ticket', value: `${ticketChannel}`, inline: true },
          { name: 'Utilisateur', value: `${interaction.user}`, inline: true }
        )
        .setTimestamp();
      logsChannel.send({ embeds: [logEmbed] }).catch(() => {});
    }
  }
}

async function handleCloseTicket(interaction) {
  const cfg = getGuildConfig(interaction.guild.id);
  if (!cfg) {
    return interaction.reply({ content: '❌ Système non configuré.', ephemeral: true });
  }

  const channel = interaction.channel;

  await interaction.reply({ content: '🔒 Fermeture du ticket dans 3 secondes...' });

  // Fetch messages for a basic transcript
  let transcriptText = `Transcript du ticket ${channel.name}\n\n`;
  try {
    const messages = await channel.messages.fetch({ limit: 100 });
    const sorted = Array.from(messages.values()).reverse();
    for (const msg of sorted) {
      transcriptText += `[${msg.createdAt.toISOString()}] ${msg.author.tag}: ${msg.content}\n`;
    }
  } catch {
    transcriptText += '(impossible de récupérer les messages)';
  }

  // Move to closed category and lock it
  try {
    await channel.setParent(cfg.closedCategoryId, { lockPermissions: false });
    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone.id, {
      ViewChannel: false,
    });
    // Remove send permission for the ticket owner if present in topic
    const ownerMatch = channel.topic && channel.topic.match(/ticket-owner:(\d+)/);
    if (ownerMatch) {
      await channel.permissionOverwrites.edit(ownerMatch[1], {
        SendMessages: false,
      }).catch(() => {});
    }
  } catch (e) {
    console.error('Erreur en déplaçant le ticket:', e);
  }

  if (cfg.logsChannelId) {
    const logsChannel = interaction.guild.channels.cache.get(cfg.logsChannelId);
    if (logsChannel) {
      const buffer = Buffer.from(transcriptText, 'utf-8');
      const logEmbed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle('🔒 Ticket fermé')
        .addFields(
          { name: 'Ticket', value: `${channel.name}`, inline: true },
          { name: 'Fermé par', value: `${interaction.user}`, inline: true }
        )
        .setTimestamp();
      logsChannel
        .send({
          embeds: [logEmbed],
          files: [{ attachment: buffer, name: `${channel.name}-transcript.txt` }],
        })
        .catch(() => {});
    }
  }

  setTimeout(() => {
    channel.send('✅ Ce ticket est maintenant fermé et archivé.').catch(() => {});
  }, 1000);
}

module.exports = { handleCreateTicket, handleCloseTicket };
