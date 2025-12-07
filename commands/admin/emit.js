const {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");

module.exports = {
  name: "emit",
  description: "Emettre un evenement",
  category: "admin",
  permissions: PermissionFlagsBits.Administrator,
  ownerOnly: true,
  run: (client, message, args) => {},
  options: [
    {
      name: "event",
      description: "Choose the event to emit",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        {
          name: "guildMemberAdd",
          value: "guildMemberAdd",
        },
        {
          name: "guildMemberRemove",
          value: "guildMemberRemove",
        },
      ],
    },
  ],
  runSlash: (client, interaction) => {
    const eventChoices = interaction.options.getString("event");

    if (eventChoices == "guildMemberAdd") {
      client.emit("guildMemberAdd", interaction.member);
      interaction.reply({
        content: "Event Emis !",
        flags: MessageFlags.Ephemeral,
      });
    }
    if (eventChoices == "guildMemberRemove") {
      client.emit("guildMemberRemove", interaction.member);
      interaction.reply({
        content: "Event Emis !",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
