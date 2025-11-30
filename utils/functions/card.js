const { EmbedBuilder, time, TimestampStyles, ContainerBuilder, AttachmentBuilder, MessageFlags } = require('discord.js');
const Logger = require('../Logger');
const { text } = require('express');

async function cardContainer(client, cardId, locale) {
  const locales = client.locales.utils.function.cards;
  let cardF = {};
  let originalCardF = {};
  await card(client, cardId).then((card) => {
    cardF = card;
  });
  await originalCard(client, cardF.card_id).then((card) => {
    originalCardF = card;
  });
  //let creator = client.users.fetch(originalCardF.author);
  let species = [];
  await JSON.parse(originalCardF.species).forEach(async (species_id) => {
    species.push(client.locales.utils.cards.species[species_id][locale] ?? client.locales.utils.cards.species[species_id]['en-US']);
  });

  let temp_type = client.locales.utils.cards.category[originalCardF.category][locale] ?? client.locales.utils.cards.category[originalCardF.category]['en-US'];
  let type = temp_type.charAt(0).toUpperCase() + temp_type.slice(1);

  let color = require('../colors.json').find((color) => color.name == originalCardF.color)?.rgb ?? 'RGB(0, 0, 0)';

  if (color == 'RGB(0, 0, 0)') {
    Logger.warn('Color Error at card ' + cardF.card_id);
  }

  color = color
    .replace('RGB(', '')
    .split(',')
    .map((x) => parseInt(x.trim()));

  let date = new Date(cardF.date);

  let image = originalCardF.card;
  let name = originalCardF.name;

  let furrcard = await client
    .knex('furrcard')
    .first('*')
    .where({ fd_id: originalCardF.id })
    .catch((err) => {
      console.error(err);
    });
  if (furrcard) {
    let response = await fetch(`https://${furrcard.user}.furrcard.com/.well-known/fursona.json`);
    let data = await response.json();
    let sona = data.sonas[furrcard.sona_id];
    name = sona.name ?? name;
    if (furrcard.use_image) {
      image = sona.avatar ?? image;
    }
  }

  const parsedAuthorId = JSON.parse(originalCardF.authorId);
  let firstText = `👑 • ${locales.container.author[locale] ?? locales.container.author['en-US']}: ${formatArrayToText(
    (typeof parsedAuthorId == 'number' ? [parsedAuthorId.toString()] : parsedAuthorId).map((x) => `<@${x}>`)
  )}\n🆔 • ${locales.container.id[locale] ?? locales.container.id['en-US']}: \`#${cardF.id}\`\n🪪 • ${locales.container.name[locale] ?? locales.container.name['en-US']}: \`${name}\`\n📅 • ${
    locales.container.time[locale] ?? locales.container.time['en-US']
  }: ${time(date, TimestampStyles.LongDateTime)} (${time(date, TimestampStyles.RelativeTime)})\n🔧 • ${locales.container.type[locale] ?? locales.container.type['en-US']}: \`${type}\`\n🐺 • ${
    locales.container.species[locale] ?? locales.container.species['en-US']
  }: \`${formatArrayToText(species)}\`${
    originalCardF.birthday
      ? `\n✨ • ${locales.container.birthday[locale] ?? locales.container.birthday['en-US']}: ${time(new Date(originalCardF.birthday), TimestampStyles.ShortDateTime)} (${time(new Date(originalCardF.birthday), TimestampStyles.RelativeTime)})`
      : ''
  }${originalCardF.gender ? `\n👤 • ${locales.container.gender[locale] ?? locales.container.gender['en-US']}: \`${originalCardF.gender}\` ${originalCardF.sexuality ? `\`(${originalCardF.sexuality})\`` : ''}` : ''}`;

  let secondText = `❤️ • ${locales.container.live[locale] ?? locales.container.live['en-US']}: \`${
    cardF.live < 0 ? originalCardF.live - (originalCardF.live * Math.abs(cardF.live)) / 100 : originalCardF.live + (originalCardF.live * cardF.live) / 100
  }%\` (\`${cardF.live}\%\`)\n⚔️ • ${locales.container.attacks[locale] ?? locales.container.attacks['en-US']}: \`${
    cardF.attacks < 0 ? originalCardF.attacks - (originalCardF.attacks * Math.abs(cardF.attacks)) / 100 : originalCardF.attacks + (originalCardF.attacks * cardF.attacks) / 100
  }%\` (\`${cardF.attacks}\%\`)${
    cardF.gived != 0
      ? `\n❇️ • ${locales.container.giveBy[locale] ?? locales.container.giveBy['en-US']}: <@${cardF.gived}> the ${time(new Date(cardF.giveDate), TimestampStyles.LongDateTime)} (${time(new Date(cardF.giveDate), TimestampStyles.RelativeTime)})`
      : ''
  }`;

  const cardContainer = new ContainerBuilder()
    .setAccentColor(color)
    .addTextDisplayComponents((textDisplay) => textDisplay.setContent(`# ${name}\n${firstText}`))
    .addSeparatorComponents((separator) => separator)
    .addTextDisplayComponents((textDisplay) => textDisplay.setContent(secondText))
    .addSeparatorComponents((separator) => separator)
    .addMediaGalleryComponents((mediaGallery) => mediaGallery.addItems((mediaGalleryItem) => mediaGalleryItem.setURL(image).setSpoiler(Boolean(originalCardF.nsfw) ?? false)));

  if (furrcard) {
    cardContainer.addTextDisplayComponents((textDisplay) => textDisplay.setContent(`-# <:furrcard:1391396091026477096> Card from [FurrCard](https://${furrcard.user}.furrcard.com/)`));
  }

  return cardContainer;
}

// Fonction pour récupérer les cartes possédées par un utilisateur
async function getUserCards(client, userId) {
  return await client
    .knex('cards')
    .whereIn('id', function () {
      this.select('card_id').from('user_cards').where({ user_id: userId });
    })
    .select('*')
    .catch((err) => {
      console.error(err);
    });
}

// Fonction pour récupérer les cartes que l'utilisateur n'a pas
async function getMissingCards(client, userId, category = '') {
  return await client
    .knex('cards')
    .whereNotIn('id', function () {
      this.select('card_id').from('user_cards').where({ user_id: userId });
    })
    .select('*')
    .catch((err) => {
      console.error(err);
    });
}

async function originalCard(client, cardId) {
  return await client
    .knex('cards')
    .first('*')
    .where({ id: cardId })
    .catch((err) => {
      console.error(err);
    });
}

async function card(client, cardId) {
  return await client
    .knex('user_cards')
    .first('*')
    .where({ id: cardId })
    .catch((err) => {
      console.error(err);
    });
}

function formatArrayToText(array) {
  if (array.length === 0) return '';

  // Met la première lettre de chaque mot en majuscule
  const capitalizedArray = array.map((word) => word.charAt(0).toUpperCase() + word.slice(1));

  // Gère le format de la chaîne de texte finale
  if (capitalizedArray.length === 1) {
    return capitalizedArray[0];
  } else {
    const lastItem = capitalizedArray.pop();
    return capitalizedArray.join(', ') + ' and ' + lastItem;
  }
}

module.exports = { card, cardContainer, originalCard, getMissingCards, getUserCards };
