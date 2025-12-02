const { EmbedBuilder, InteractionContextType } = require("discord.js");

module.exports = {
  name: "ping",
  category: "utils",
  fullyTranslated: true,
  description: "Ping-Pong❗ 🏓 | Send the latence of the bot",
  ownerOnly: false,
  usage: "ping",
  examples: ["ping"],
  permissions: null,
  contexts: [
    InteractionContextType.PrivateChannel,
    InteractionContextType.Guild,
    InteractionContextType.BotDM,
  ],
  run: (client, message, args) => {
    message.reply("Pong❗ 🏓");
  },
  runSlash: async (client, interaction) => {
    const tryPong = await interaction.reply({
      content: "Ping send. Wait for pong ...",
      fetchReply: true,
    });

    const embed = new EmbedBuilder()
      .setTitle("Pong❗ 🏓")
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        {
          name: "API latency",
          value: `\`\`\`${client.ws.ping} ms\`\`\``,
          inline: true,
        },
        {
          name: "Bot latency",
          value: `\`\`\`${tryPong.createdTimestamp - interaction.createdTimestamp} ms\`\`\``,
          inline: true,
        }
      )
      .setTimestamp()
      .setFooter({
        text: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL(),
      });

    interaction.editReply({ content: " ", embeds: [embed] });
  },
};
