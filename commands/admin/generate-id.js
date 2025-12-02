const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "generate-id",
  description: "Generate an ID for card",
  category: "admin",
  permissions: PermissionFlagsBits.Administrator,
  ownerOnly: true,
  run: (client, message, args) => {},
  runSlash: (client, interaction) => {
    const uid = function () {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };

    interaction.reply(`${uid()}\n${new Date().toISOString()}`);
  },
};
