require('dotenv').config();
const fs = require('fs');
const path = require('path');
const {
  Client,
  GatewayIntentBits,
  Collection,
  Events,
} = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { handleCreateTicket, handleCloseTicket } = require('./ticketHandler');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((f) => f.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, (c) => {
  console.log(`✅ Connecté en tant que ${c.user.tag}`);
  console.log('👑 Full programmed by Mr H for Holmes Codelab (https://eagle-holmes.netlify.app/)');
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction);
    } else if (interaction.isButton()) {
      if (interaction.customId === 'hc_create_ticket') {
        await handleCreateTicket(interaction);
      } else if (interaction.customId === 'hc_close_ticket') {
        await handleCloseTicket(interaction);
      }
    } else if (interaction.isModalSubmit()) {
      if (interaction.customId.startsWith('hc_announce_modal_')) {
        const channelId = interaction.customId.replace('hc_announce_modal_', '');
        const channel = interaction.guild.channels.cache.get(channelId);

        if (!channel) {
          return interaction.reply({
            content: "❌ Le salon choisi n'existe plus.",
            ephemeral: true,
          });
        }

        const title = interaction.fields.getTextInputValue('announce_title');
        const content = interaction.fields.getTextInputValue('announce_content');

        const embed = new EmbedBuilder()
          .setColor(0xd4af37)
          .setTitle(`📢 ${title}`)
          .setDescription(content)
          .setFooter({ text: `Annoncé par ${interaction.user.tag}` })
          .setTimestamp();

        await channel.send({ embeds: [embed] });

        await interaction.reply({
          content: `✅ Annonce envoyée dans ${channel}.`,
          ephemeral: true,
        });
      }
    }
  } catch (err) {
    console.error(err);
    if (interaction.isRepliable()) {
      const payload = { content: '❌ Une erreur est survenue.', ephemeral: true };
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp(payload).catch(() => {});
      } else {
        await interaction.reply(payload).catch(() => {});
      }
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
