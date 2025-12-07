const {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");
const fs = require("fs");

module.exports = {
  name: "log",
  description: "Récupéré les logs du bot",
  category: "admin",
  permissions: PermissionFlagsBits.Administrator,
  ownerOnly: true,
  run: (client, message, args) => {},
  options: [
    {
      name: "date",
      description: "Log Date",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  runSlash: (client, interaction) => {
    const DateChoosed = interaction.options.getString("date");
    let date = new Date(DateChoosed || Date.now())
      .toISOString()
      .replace(/:/g, "-")
      .replace(/\..+/, "")
      .split("T")[0];
    interaction.reply({
      content: `Logs du ${date} :\n\`\`\`json\n${fs.readFileSync(`./logs/${date}.log`, "utf-8")}\n\`\`\``,
      flags: MessageFlags.Ephemeral,
    });
  },
};
