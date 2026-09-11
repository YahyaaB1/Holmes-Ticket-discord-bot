const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
} = require('discord.js');
const { setGuildConfig } = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Configure le système de tickets')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addRoleOption((opt) =>
      opt
        .setName('role_admin')
        .setDescription('Le rôle staff/admin qui gère les tickets')
        .setRequired(true)
    )
    .addChannelOption((opt) =>
      opt
        .setName('categorie_open')
        .setDescription('Catégorie où seront créés les tickets ouverts')
        .addChannelTypes(ChannelType.GuildCategory)
        .setRequired(true)
    )
    .addChannelOption((opt) =>
      opt
        .setName('categorie_closed')
        .setDescription('Catégorie où seront déplacés les tickets fermés')
        .addChannelTypes(ChannelType.GuildCategory)
        .setRequired(true)
    )
    .addChannelOption((opt) =>
      opt
        .setName('logs')
        .setDescription('Salon où seront envoyés les logs des tickets')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  async execute(interaction) {
    const roleAdmin = interaction.options.getRole('role_admin');
    const categoryOpen = interaction.options.getChannel('categorie_open');
    const categoryClosed = interaction.options.getChannel('categorie_closed');
    const logsChannel = interaction.options.getChannel('logs');

    setGuildConfig(interaction.guild.id, {
      adminRoleId: roleAdmin.id,
      openCategoryId: categoryOpen.id,
      closedCategoryId: categoryClosed.id,
      logsChannelId: logsChannel.id,
    });

    const embed = new EmbedBuilder()
      .setColor(0xd4af37)
      .setTitle('👑 Configuration enregistrée')
      .setDescription('Le système de tickets a été configuré avec succès.')
      .addFields(
        { name: 'Rôle Admin', value: `<@&${roleAdmin.id}>`, inline: true },
        { name: 'Catégorie (ouverts)', value: `${categoryOpen.name}`, inline: true },
        { name: 'Catégorie (fermés)', value: `${categoryClosed.name}`, inline: true },
        { name: 'Salon logs', value: `<#${logsChannel.id}>`, inline: true }
      )
      .setFooter({ text: 'Utilise /panel pour envoyer le panneau de tickets. | Bot créé par Holmes — https://eagle-holmes.netlify.app/' });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
