const { MessageFlags } = require('discord.js');
const idGenerator = function () {
	return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
module.exports = {
	name: 'catch',
	async run(client, interaction) {
		const guess = interaction.fields.getTextInputValue('guess').toLowerCase();
		const locales = client.locales.modals.catch;
		let serverConfig = await client
			.knex('guilds')
			.first('*')
			.where({ id: interaction.guild.id })
			.catch((err) => console.error(err));
		if (serverConfig.last_Card == null) {
			let message = locales.already[serverConfig.locale] ?? locales.already['en-US'];
			interaction.reply(message.replace('%@player%', `<@${interaction.user.id}>`));
			return;
		}

		let card = await client
			.knex('cards')
			.first('*')
			.where({ id: serverConfig.last_Card })
			.catch((err) => console.error(err));

		if (card.possible_name.includes(guess)) {
			let live = Math.round(Math.floor(Math.random() * (25 - -25)) + -25);
			let attacks = Math.round(Math.floor(Math.random() * (25 - -25)) + -25);
			let glitchCard = Math.random() > 0.999;
			let hasGlitchCard = await client
				.knex('user_cards')
				.first('*')
				.where({ user_id: interaction.user.id, card_id: 19 })
				.catch((err) => console.error(err));
			if (glitchCard && !hasGlitchCard) {
				live = 0;
				attacks = 0;
				serverConfig.last_Card = 19;
			}
			let ID = idGenerator();
			let user = await client
				.knex('users')
				.first('*')
				.where({ id: interaction.user.id })
				.catch((err) => console.error(err));

			if (!user) {
				client
					.knex('users')
					.insert({ user_id: interaction.user.id })
					.catch((err) => console.error(err));
			}
			client
				.knex('user_cards')
				.insert({
					id: ID,
					user_id: interaction.user.id,
					card_id: serverConfig.last_Card,
					guild: interaction.guild.id,
					date: new Date().toISOString(),
					live: `${live < 0 ? live : `+${live}`}`,
					attacks: `${attacks < 0 ? attacks : `+${attacks}`}`,
				})
				.catch((err) => console.error(err));
			let message = locales.congrat[serverConfig.locale] ?? locales.congrat['en-US'];
			interaction.reply(
				message
					.replace('%cardEmoji%', card.emoji)
					.replace('%cardName%', card.name)
					.replace('%cardId%', `${ID}, ${live < 0 ? live : `+${live}`}%/${attacks < 0 ? attacks : `+${attacks}`}%`)
					.replace('%@player%', `<@${interaction.user.id}>`)
			);
			require('../../utils/functions/DiscordLogger').writePlayer(client, interaction.user.id, {
				tag: 'SUCCES',
				color: 'GREEN',
				description: 'Card catch',
				info: [
					{ name: 'Card', value: `${card.name} (${card.id})` },
					{ name: 'ID', value: ID },
					{ name: 'Guild', value: `${interaction.guild.name} (${interaction.guild.id})` },
					{ name: 'Live', value: `${live < 0 ? live : `+${live}`}` },
					{ name: 'Attacks', value: `${attacks < 0 ? attacks : `+${attacks}`}` },
				],
				content: 'Catch',
			});
			require('../../utils/functions/DiscordLogger').writeServer(client, interaction.guild.id, {
				tag: 'SUCCES',
				color: 'GREEN',
				description: 'Card catch',
				info: [
					{ name: 'Card', value: `${card.name} (${card.id})` },
					{ name: 'ID', value: ID },
					{ name: 'User', value: `${interaction.user.displayName} (${interaction.user.id})` },
					{ name: 'Live', value: `${live < 0 ? live : `+${live}`}` },
					{ name: 'Attacks', value: `${attacks < 0 ? attacks : `+${attacks}`}` },
				],
				content: 'Catch',
			});
			client
				.knex('guilds')
				.update({ last_Card: null })
				.where({ id: interaction.guild.id })
				.catch((err) => console.error(err));
			let msg = interaction.message;
			const newCatchContainer = msg.components[0];
			newCatchContainer.components[4].components[0].data.disabled = true;

			client
				.knex('anti-cheat_messages')
				.update({ userCard: interaction.user.id })
				.where({ spawnMessage: interaction.message.id })
				.catch((err) => console.error(err));
			msg.edit({ components: [newCatchContainer], flags: MessageFlags.IsComponentsV2 });
		} else {
			let nonono = locales.no[serverConfig.locale] ?? locales.no['en-US'];
			interaction.reply(nonono.replace('%guess%', guess).replace('%@player%', `<@${interaction.user.id}>`));
			return;
		}
	},
};
