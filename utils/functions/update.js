function update_data(client) {
  update(client);
  setInterval(async () => {
    update(client);
  }, 60 * 60 * 1000);
}

async function upgrade_data(client) {
  const user_cards = await client.knex('user_cards').catch((err) => console.error(err));
  user_cards.forEach((card) => {
    if (typeof card.date == 'number') {
      let date = new Date(card.date);
      client
        .knex('user_cards')
        .update({ date: date.toISOString() })
        .where({ id: card.id })
        .catch((err) => console.error(err));
    }
  });
}

async function update(client) {
  const users = await client.knex('users');
  users.forEach(async (user) => {
    const user_cards = await client
      .knex('user_cards')
      .where({ user_id: user.id })
      .catch((err) => console.error(err));

    const totalCards = await client
      .knex('cards')
      .countDistinct('id as count')
      .first()
      .catch((err) => console.error(err));
    const userCards = await client
      .knex('user_cards')
      .where({ user_id: user.id })
      .countDistinct('card_id as count')
      .first()
      .catch((err) => console.error(err));
    client
      .knex('users')
      .update({ card_number: user_cards.length, card_completion: (userCards.count / totalCards.count) * 100 })
      .where({ id: user.id })
      .catch((err) => console.error(err));
  });
}

module.exports = { update_data, upgrade_data };
