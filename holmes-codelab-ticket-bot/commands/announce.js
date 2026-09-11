const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription("Envoie une annonce (embed) dans un salon")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption((opt) =>
      opt
        .setName('salon')
        .setDescription("Le salon où l'annonce sera envoyée")
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(true)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel('salon');

    const modal = new ModalBuilder()
      .setCustomId(`hc_announce_modal_${channel.id}`)
      .setTitle("Créer une annonce");

    const titleInput = new TextInputBuilder()
      .setCustomId('announce_title')
      .setLabel('Titre de l\'annonce')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Ex: Mise à jour du serveur')
      .setMaxLength(256)
      .setRequired(true);

    const contentInput = new TextInputBuilder()
      .setCustomId('announce_content')
      .setLabel("Contenu de l'annonce")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder("Écris ton annonce ici...")
      .setMaxLength(4000)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(titleInput),
      new ActionRowBuilder().addComponents(contentInput)
    );

    await interaction.showModal(modal);
  },
};
