const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { getGuildConfig } = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('panel')
    .setDescription('Envoie le panneau de création de tickets dans ce salon')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const cfg = getGuildConfig(interaction.guild.id);
    if (!cfg) {
      return interaction.reply({
        content: "❌ Configure d'abord le système avec `/setup` avant d'envoyer le panneau.",
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setColor(0xd4af37)
      .setTitle('👑 TICKET PANEL')
      .setDescription(
        '✦ **À propos du système de ticket** ✦\n' +
          'Le système de ticket te permet de contacter l\'équipe du serveur pour obtenir de l\'aide rapidement et efficacement.'
      )
      .addFields(
        { name: '🎫 Facile', value: "Crée un ticket en quelques secondes.", inline: true },
        { name: '⚡ Rapide', value: "Notre équipe te répondra dans les plus brefs délais.", inline: true },
        { name: '🛡️ Sécurisé', value: "Tes tickets sont privés et seuls les staff peuvent les voir.", inline: true },
        { name: '✅ Organisé', value: "Garde une trace de tous tes tickets et leurs états.", inline: true }
      )
      .setFooter({ text: 'Full programmed by Mr H for Holmes Codelab' })
      .setURL('https://eagle-holmes.netlify.app/');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('hc_create_ticket')
        .setLabel('Créer un nouveau ticket')
        .setEmoji('🎫')
        .setStyle(ButtonStyle.Success)
    );

    await interaction.channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: '✅ Panneau envoyé.', ephemeral: true });
  },
};
