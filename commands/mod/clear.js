const {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  name: "clear",
  description: "delete a wanted number message",
  category: "mod",
  permissions: PermissionFlagsBits.ManageMessages,
  run: (client, message, args) => {},
  options: [
    {
      name: "message",
      description: "number of message you want to delete (1 - 99)",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
  ],
  runSlash: (client, interaction) => {
    const message = interaction.options.getInteger("message");

    if (message >= 1 && message <= 99) {
      interaction.channel.bulkDelete(message).catch(err => console.error(err));
      interaction
        .reply("Tout est dans l'odre !")
        .then(msg => {
          setTimeout(() => {
            msg.delete();
          }, 5000);
        })
        .catch(err => console.error(err));
    } else
      interaction.reply("Error, Usage: `/clear {Number of message (1-99)}`");
  },
};
