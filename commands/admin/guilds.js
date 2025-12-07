const { PermissionFlagsBits, MessageFlags } = require("discord.js");

module.exports = {
  name: "guilds",
  description: "send all guild",
  category: "admin",
  permissions: PermissionFlagsBits.Administrator,
  ownerOnly: true,
  run: (client, message, args) => {},
  runSlash: (client, interaction) => {
    interaction.reply({
      content: `Guilds: ${client.guilds.cache.map((guild, index) => `\n> [${index}] ${guild.name} (${guild.memberCount})`).join("")}`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
