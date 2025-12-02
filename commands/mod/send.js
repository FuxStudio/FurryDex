const {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  name: "send",
  description: "Send a message",
  category: "mod",
  permissions: PermissionFlagsBits.ManageMessages,
  run: (client, message, args) => {},
  options: [
    {
      name: "channel",
      description: "Channel where the message will be send",
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
    {
      name: "message",
      description: "Message to send",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  runSlash: (client, interaction) => {
    const channel = interaction.options.getChannel("channel");
    const message = interaction.options.getString("message");

    channel.send(message);
  },
};
