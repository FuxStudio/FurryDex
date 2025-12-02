const {
  ApplicationCommandOptionType,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  InteractionContextType,
} = require("discord.js");
const { cardContainer } = require("../../utils/functions/card");

module.exports = {
  name: "furry",
  description: "base furry command",
  category: "furry",
  fullyTranslated: true,
  permissions: null,
  contexts: [
    InteractionContextType.PrivateChannel,
    InteractionContextType.Guild,
    InteractionContextType.BotDM,
  ],
  run: (client, message, args) => {},
  options: [
    {
      name: "list",
      description: "Send a deck of all your/user card.",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "user",
          description: "The user you want to see all cards.",
          required: false,
          type: ApplicationCommandOptionType.User,
        },
      ],
    },
    {
      name: "completion",
      description: "Show your current completion/progress of Furry Cards.",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "user",
          description: "The user you want to see their progress.",
          required: false,
          type: ApplicationCommandOptionType.User,
        },
        {
          name: "category",
          description: "Get a completion from a specific category of card.",
          required: false,
          type: ApplicationCommandOptionType.String,
          choices: [
            { name: "Normal", value: "1" },
            { name: "Classic", value: "2" },
            { name: "Special", value: "3" },
            { name: "Furry Dex", value: "4" },
            { name: "Furry Dex Special", value: "5" },
            { name: "Director", value: "6" },
            { name: "Tiktok", value: "7" },
            { name: "Instagram", value: "8" },
            { name: "Celebration", value: "9" },
            { name: "Youtuber", value: "10" },
            { name: "Twitch", value: "11" },
            { name: "Musician", value: "12" },
          ],
        },
      ],
    },
    //{
    //	name: 'last',
    //	description: 'Display info of your or another users last caught card.',
    //	type: ApplicationCommandOptionType.Subcommand,
    //},
    {
      name: "give",
      description: "Give a card to a user.",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "give-to",
          description: "The user you want to give a card to.",
          required: true,
          type: ApplicationCommandOptionType.User,
        },
      ],
    },
    {
      name: "count",
      description: "Count how many card you have.",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "user",
          description: "The user you want to count cards.",
          required: false,
          type: ApplicationCommandOptionType.User,
        },
      ],
    },
    //{
    //	name: 'info',
    //	//nameLocalizations: locales.options[5].name,
    //	description: 'Display info from a specific card.',
    //	//descriptionLocalizations: locales.options[5].description,
    //	type: ApplicationCommandOptionType.Subcommand,
    //},
    //{
    //	name: 'favorite',
    //	//nameLocalizations: locales.options[6].name,
    //	description: 'Set a card to favorite.',
    //	//descriptionLocalizations: locales.options[6].description,
    //	type: ApplicationCommandOptionType.Subcommand,
    //},
  ],
  runSlash: async (client, interaction) => {
    await interaction.deferReply();
    const locales = client.locales.commands.furry;
    const subcommand = interaction.options.getSubcommand();
    let user = interaction.options.getUser("user") ?? interaction.user;
    let user_cards = await client
      .knex("user_cards")
      .select("*")
      .where({ user_id: user.id })
      .catch(err => {
        console.error(err);
      });
    let allCards = await client
      .knex("cards")
      .select("*")
      .catch(err => {
        console.error(err);
      });

    let userData = await client
      .knex("users")
      .first("*")
      .where({ id: interaction.user.id })
      .catch(err => {
        console.error(err);
      });

    if (!userData) {
      client
        .knex("users")
        .insert({ id: interaction.user.id })
        .catch(err => console.error(err));
      userData = await client
        .knex("users")
        .first("*")
        .where({ id: interaction.user.id })
        .catch(err => {
          console.error(err);
        });
    }

    if (userData.ToS != 1) {
      let embed = new EmbedBuilder()
        .setTitle("Wait, wait, wait !")
        .setDescription(
          `Sorry, but you need to accept the ToS for continue !\n\nLegal Documents (ToS & Privacy policy): https://FurryDex.github.io/legal/ \nBy clicking on "Accept", you accept the ToS`
        )
        .setColor("Green");

      const buttonRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`accept-tos`)
          .setLabel("Accept")
          .setStyle(ButtonStyle.Primary)
      );

      interaction.editReply({
        embeds: [embed],
        components: [buttonRow],
        flags: MessageFlags.Ephemeral,
      });

      return;
    }

    if (subcommand == "list") {
      if (user_cards.length == 0)
        return interaction.editReply({
          content:
            locales.run["no-furry"][interaction.locale] ??
            locales.run["no-furry"]["en-US"],
          flags: MessageFlags.Ephemeral,
        });
      AllOptions = [];
      user_cards.forEach(async (card, key) => {
        let date = new Date(card.date);
        let cd = num => num.toString().padStart(2, 0);
        let description =
          locales.run.list[interaction.locale] ?? locales.run.list["en-US"];
        let card_info = await client
          .knex("cards")
          .first("*")
          .where({ id: card.card_id })
          .catch(err => {
            console.error(err);
          });
        AllOptions.push({
          label: `(#${card.id}) ${card_info.name}`,
          value: `${card.id}`,
          emoji: `${card_info.emoji}`,
          description: description
            .replace("%attacks%", card.attacks)
            .replace("%live%", card.live)
            .replace(
              "%date%",
              `${cd(date.getDate())}/${cd(date.getMonth())}/${cd(date.getFullYear())} ${cd(date.getHours())}H${cd(date.getMinutes())}`
            ),
        });
        if (user_cards.length == key + 1) {
          sendMenu(
            AllOptions,
            interaction,
            async params => {
              return await interaction.editReply(params);
            },
            0,
            25,
            "cards",
            async response => {
              cardContainer(client, response.values[0], response.locale).then(
                container => {
                  response
                    .update({
                      embeds: null,
                      components: [container],
                      content: null,
                      flags: [
                        MessageFlags.IsComponentsV2,
                        MessageFlags.SuppressNotifications,
                      ],
                    })
                    .catch(err => {
                      console.error(err, response.values[0]);
                    });
                }
              );
            }
          );
        }
      });
    } else if (subcommand == "completion") {
      let category = interaction.options.getString("category") ?? "";
      if (category) {
        allCards = await client
          .knex("cards")
          .select("*")
          .where({ category })
          .catch(err => {
            console.error(err);
          });
        if (allCards.length == 0) {
          const embed = new EmbedBuilder()
            .setTitle(`Furry Dex Completion`)
            .setDescription(`There no card in this category`)
            .setColor("#FF9700")
            .setTimestamp();
          interaction.editReply({ embeds: [embed] });
        }
      } else category = undefined;
      let havedCards = await require("../../utils/functions/card").getUserCards(
        client,
        user.id,
        category
      );
      let notHavedCards =
        await require("../../utils/functions/card").getMissingCards(
          client,
          user.id,
          category
        );

      const embed = new EmbedBuilder()
        .setTitle(`Furry Dex Completion`)
        .setDescription(
          `Dex of <@${user.id}>\nFurries Dex progression: *${Math.round((havedCards.length / allCards.length) * 100)}%*\n\n__**Owned Furries Cards**__\n${havedCards.map(card => `${card.emoji}`).join(" ")}\n\n__**Missing Furries Cards**__\n${notHavedCards
            .map(card => card.emoji)
            .join(" ")}`
        )
        .setColor("#FF9700")
        .setTimestamp();
      interaction.editReply({ embeds: [embed] });
    } else if (subcommand == "count") {
      if (user_cards.length == 0)
        return interaction.editReply({
          content:
            locales.run["no-furry"][interaction.locale] ??
            locales.run["no-furry"]["en-US"],
          flags: MessageFlags.Ephemeral,
        });
      return interaction.editReply({
        content: `The deck got \`%number%\` cards`.replace(
          "%number%",
          user_cards.length
        ),
      });
    } else if (subcommand == "give") {
      if (user_cards.length == 0)
        return interaction.editReply({
          content:
            locales.run["no-furry"][interaction.locale] ??
            locales.run["no-furry"]["en-US"],
          flags: MessageFlags.Ephemeral,
        });
      let giveTo = interaction.options.getUser("give-to");
      AllOptions = [];
      user_cards.forEach(async (card, key) => {
        let date = new Date(card.date);
        let cd = num => num.toString().padStart(2, 0);
        let description =
          locales.run.list[interaction.locale] ?? locales.run.list["en-US"];
        let card_info = await client
          .knex("cards")
          .first("*")
          .where({ id: card.card_id })
          .catch(err => {
            console.error(err);
          });
        AllOptions.push({
          label: `(#${card.id}) ${card_info.name}`,
          value: `${card.id}`,
          emoji: `${card_info.emoji}`,
          description: description
            .replace("%attacks%", card.attacks)
            .replace("%live%", card.live)
            .replace(
              "%date%",
              `${cd(date.getDate())}/${cd(date.getMonth())}/${cd(date.getFullYear())} ${cd(date.getHours())}H${cd(date.getMinutes())}`
            ),
        });
        if (user_cards.length == key + 1) {
          sendMenu(
            AllOptions,
            interaction,
            async params => {
              return await interaction.editReply(params);
            },
            0,
            25,
            "giveTo",
            async response => {
              let user = await client
                .knex("users")
                .first("*")
                .where({ id: giveTo.id })
                .catch(err => console.error(err));

              if (!user) {
                client
                  .knex("users")
                  .insert({ user_id: giveTo.id })
                  .catch(err => console.error(err));
              }

              let card = await client
                .knex("user_cards")
                .first("*")
                .where({ user_id: response.user.id, id: response.values[0] })
                .catch(err => console.error(err));

              if (!card)
                return response.reply("You are not the owner of the card");

              let date = new Date();
              client
                .knex("user_cards")
                .update({
                  user_id: giveTo.id,
                  gived: response.user.id,
                  giveDate: date.toISOString(),
                })
                .where({ user_id: response.user.id, id: response.values[0] })
                .catch(err => console.error(err));

              let cardO = await client
                .knex("cards")
                .first("*")
                .where({ id: card.card_id })
                .catch(err => console.error(err));

              let message = "%cardEmoji% `%cardName%` (`#%cardId%`)";
              response.reply(
                `card ${message
                  .replace("%cardEmoji%", cardO.emoji)
                  .replace("%cardName%", cardO.name)
                  .replace(
                    "%cardId%",
                    `${card.id}, ${card.live < 0 ? card.live : `+${card.live}`}%/${card.attacks < 0 ? card.attacks : `+${card.attacks}`}%`
                  )
                  .replace(
                    "%@player%",
                    `<@${response.user.id}>`
                  )} from <@${response.user.id}> to <@${giveTo.id}> was give succefully`
              );
            }
          );
        }
      });
    } else {
      return interaction.editReply({
        content: "Sorry, this *command* is disable. Er0r: 403",
        ephemeral: true,
      });
    }
  },
};

/**
 *
 * @callback callback
 * @param {Object}  options - List of options for the menu
 * @param {BaseInteraction, Message}  interaction - The interaction
 * @param {Boolean} isMessage - Is message ? (default false)
 * @param {Number} page - The page (default 0)
 * @param {Number} chunkSize - The chunk size (default 25, max 25)
 * @param {String} customId - The customId
 * @param {callback} callback - The callback
 * @param {String} content - The content of the interaction / message
 * @returns {Promise<SelectMenuInteraction>}
 * @example
 * sendMenu(options, interaction, message, page, chunkSize, customId, callback);
 * @example
 * sendMenu(options, interaction, false, 0, 25, 'cards', callback);
 *
 */

async function sendMenu(
  options,
  interaction,
  update_command,
  page = 0,
  chunkSize = 25,
  customId,
  callback,
  content = "Select a card: "
) {
  const chunkedOptions = chunkArray(options, chunkSize);
  const currentOptions = chunkedOptions[page];

  const row = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(customId)
      .addOptions(currentOptions)
  );
  if (!row) return;
  let rows = [row];

  if (chunkedOptions.length == 0)
    return interaction.editReply({
      content: "No options to select",
      flags: MessageFlags.Ephemeral,
    });

  if (chunkedOptions.length > 1) {
    const buttonRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`${customId}--prev`)
        .setLabel("«")
        .setStyle(page == 0 ? ButtonStyle.Danger : ButtonStyle.Primary)
        .setDisabled(page == 0),
      new ButtonBuilder()
        .setCustomId(`${customId}--nothing`)
        .setLabel(`${Number(page) + 1}`)
        .setStyle(ButtonStyle.Success)
        .setDisabled(chunkedOptions.length == 1),
      new ButtonBuilder()
        .setCustomId(`${customId}--next`)
        .setLabel("»")
        .setStyle(
          page == chunkedOptions.length - 1
            ? ButtonStyle.Danger
            : ButtonStyle.Primary
        )
        .setDisabled(page == chunkedOptions.length - 1)
    );
    rows.push(buttonRow);
  }

  let message = await (update_command ?? interaction.editReply)({
    content,
    components: rows,
  }).catch(err => {
    console.error(err, currentOptions);
  });

  const response = await message
    .awaitMessageComponent()
    .catch(err => require("../../utils/Logger").error(client, err));
  do {
    if (!response.customId) return;
    if (response.customId == `${customId}--prev`) {
      return await sendMenu(
        options,
        interaction,
        async params => {
          response.update(params);
          return response.message;
        },
        page - 1,
        chunkSize,
        customId,
        callback,
        content
      );
    } else if (response.customId == `${customId}--nothing`) {
      return await sendMenu(
        options,
        interaction,
        async () => {
          response.reply({
            content: `Eh! I have a secret told you!\n\n||There is no point in pressing a button in this range||`,
            flags: MessageFlags.Ephemeral,
          });
          return response.message;
        },
        page,
        chunkSize,
        customId,
        callback,
        content
      );
    } else if (response.customId == `${customId}--next`) {
      return await sendMenu(
        options,
        interaction,
        async params => {
          response.update(params);
          return response.message;
        },
        page + 1,
        chunkSize,
        customId,
        callback,
        content
      );
    } else if (response.customId == customId) {
      callback(response);
      return response;
    }
  } while (true);
}
function chunkArray(array, chunkSize = 25) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}
