const { EmbedBuilder } = require('discord.js');
const Logger = require('../Logger.js');

function anticheat_start(client) {
	setTimeout(() => {
		anticheat_update(client);
		setInterval(async () => {
			anticheat_update(client);
		}, 1 * 60 * 1000);
	}, 1000);
}

async function anticheat_update(client) {
	let anticheat_messages = await client
		.knex('anti-cheat_messages')
		.select('*')
		.catch((err) => console.error(err));
	anticheat_messages.forEach((x) => {
		let date = new Date(x.dateTime);
		date.setHours(date.getHours() + x.expire);

		if (date <= new Date()) {
			client
				.knex('anti-cheat_messages')
				.delete()
				.where({ message_id: x.message_id })
				.catch((err) => console.error(err));
		}
	});

	let users = await client.knex('users').catch((err) => console.error(err));
	let guilds = await client.knex('guilds').catch((err) => console.error(err));

	users.forEach(async (user) => {
		let messages = await client
			.knex('anti-cheat_messages')
			.select('*')
			.where({ user_id: user.id })
			.catch((err) => console.error(err));
		let spawn = await client
			.knex('anti-cheat_messages')
			.select('*')
			.where({ userCard: user.id })
			.catch((err) => console.error(err));

		if (messages.length <= 7) return; // Pas assez de messages pour calculer le pourcentage
		let pourcent = ([...messages.map((x) => x.have_spawn_card / 2 + (x.userCard == x.user_id ? 3 + 1 / 2 : 0)), ...spawn.map((x) => 1)]?.reduce((a, b) => a + b, 0) / messages.length) * 100;
		pourcent = pourcent > 100 ? 100 : pourcent < 0 ? 0 : pourcent;
		if (!pourcent) return;

		let before = user.anticheat;
		let after = pourcent;

		if (before < 50 && after >= 50)
			client
				.knex('users')
				.update({ ToS: 0 })
				.where({ id: user.id })
				.catch((err) => console.error(err));

		client
			.knex('users')
			.update({ anticheat: pourcent, can_spawn: pourcent < 65 ? 1 : pourcent >= 75 ? 0 : undefined })
			.where({ id: user.id })
			.catch((err) => console.error(err));
	});

	guilds.forEach(async (guild) => {
		let messages = await client
			.knex('anti-cheat_messages')
			.select('*')
			.where({ guild: guild.id })
			.catch((err) => console.error(err));
		if (!messages.length) return;

		if (messages.length <= 7) return; // Pas assez de messages pour calculer le pourcentage
		let pourcent = ([...messages.map((x) => x.have_spawn_card)]?.reduce((a, b) => a + b, 0) / messages.length) * 100;
		pourcent = pourcent > 100 ? 100 : pourcent < 0 ? 0 : pourcent;
		if (!pourcent) return;
		let cpm = [...messages.map((x) => x.have_spawn_card)].reduce((a, b) => a + b, 0) / messages.length;

		client
			.knex('guilds')
			.update({ anticheat: pourcent, can_spawn: pourcent < 65 ? 1 : pourcent >= 75 ? 0 : undefined, 'card/message': cpm })
			.where({ id: guild.id })
			.catch((err) => console.error(err));
	});
}

function anticheat_message(client, message, user_id, have_spawn_card = 0, expire = 720) {
	client
		.knex('anti-cheat_messages')
		.insert({ message_id: message.id, user_id, have_spawn_card, expire, guild: message.guild.id })
		.catch((err) => console.error(err));
}

module.exports = { anticheat_start, anticheat_update, anticheat_message };
