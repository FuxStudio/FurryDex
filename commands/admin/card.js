const {
  ApplicationCommandOptionType,
  MessageFlags,
  InteractionContextType,
} = require("discord.js");

module.exports = {
  name: "card",
  description: "card",
  category: "admin",
  staffOnly: true,
  contexts: [
    InteractionContextType.PrivateChannel,
    InteractionContextType.Guild,
    InteractionContextType.BotDM,
  ],
  run: (client, message, args) => {},
  options: [
    {
      name: "by-id",
      description: "Get all card infomartion via his card ID.",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "card-id",
          description: "The card ID you want to see.",
          required: true,
          type: ApplicationCommandOptionType.Number,
        },
      ],
    },
    {
      name: "by-user-card-id",
      description: "Get all card infomartion via a user card ID.",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "user-card-id",
          description: "The card ID you want to see.",
          required: true,
          type: ApplicationCommandOptionType.String,
        },
      ],
    },
  ],
  runSlash: async (client, interaction) => {
    await interaction.deferReply({ falgs: MessageFlags.Ephemeral });
    const subcommand = interaction.options.getSubcommand();

    if (subcommand == "by-id") {
      const cardId = interaction.options.getNumber("card-id");
      const card = await client.knex("cards").where({ id: cardId }).first();
      if (!card) return interaction.editReply("No card found with this ID.");
      return interaction.editReply(
        `Card:\n\`\`\`json\n${JSON.stringify(card, null, 2)}\n\`\`\``
      );
    }
    if (subcommand == "by-user-card-id") {
      const userCardId = interaction.options.getString("user-card-id");
      const user_cards = await client
        .knex("user_cards")
        .where({ id: userCardId })
        .first();
      if (!user_cards)
        return interaction.editReply("No card found with this ID.");
      const card = await client
        .knex("cards")
        .where({ id: user_cards.card_id })
        .first();
      return interaction.editReply(
        `User card:\n\`\`\`json\n${JSON.stringify(user_cards, null, 2)}\n\`\`\`\nCard:\n\`\`\`json\n${JSON.stringify(card, null, 2)}\n\`\`\``
      );
    }
  },
};
