const { StringSelectMenuBuilder, PermissionFlagsBits, MessageFlags, ContainerBuilder, ButtonStyle, ButtonBuilder, ChannelSelectMenuBuilder, ChannelFlags, ChannelType } = require('discord.js');
const leaderboard = require('../../selects/mod/leaderboard');

module.exports = {
	name: 'config',
	description: 'base config command',
	permissions: PermissionFlagsBits.Administrator,
	category: 'admin',
	fullyTranslated: true,
	run: (client, message, args) => {},
	runSlash: async (client, interaction) => {
		const locales = client.locales.commands.config.run;
		let container = new ContainerBuilder();
		let channel = null;
		async function updateContainer() {
			let serverConfig = await client
				.knex('guilds')
				.first('*')
				.where({ id: interaction.guild.id })
				.catch((err) => console.error(err));
			if (!serverConfig) {
				await client.knex('guilds').insert({
					id: interaction.guild.id,
				});
				serverConfig = await client
					.knex('guilds')
					.first('*')
					.where({ id: interaction.guild.id })
					.catch((err) => console.error(err));
			}

			channel = await interaction.guild.channels.cache.get(serverConfig.spawn_channel);

			container = new ContainerBuilder()
				.setAccentColor([80, 200, 120])
				.addTextDisplayComponents((textDisplay) => textDisplay.setContent(`# ${locales.title[interaction.locale] ?? locales.title['en-US']}`))
				.addSeparatorComponents((separator) => separator)
				//enable
				.addSectionComponents((section) =>
					section
						.addTextDisplayComponents((textDisplay) =>
							textDisplay.setContent(
								`## ${locales.enable.title[interaction.locale] ?? locales.enable.title['en-US']}\n${locales.enable.description[interaction.locale] ?? locales.enable.description['en-US']}${
									!channel ? `\n**${locales.enable.note[interaction.locale] ?? locales.enable.note['en-US']}` : ''
								}`
							)
						)
						.setButtonAccessory((button) =>
							button
								.setCustomId(serverConfig.enabled == 1 ? 'disable' : 'enable')
								.setLabel(serverConfig.enabled == 1 ? locales.enable.button.disable[interaction.locale] ?? locales.enable.button.disable['en-US'] : locales.enable.button.enable[interaction.locale] ?? locales.enable.button.enable['en-US'])
								.setStyle(serverConfig.enabled == 1 ? ButtonStyle.Danger : ButtonStyle.Success)
								.setDisabled(channel ? false : true)
						)
				)
				.addSeparatorComponents((separator) => separator)
				//channel
				.addTextDisplayComponents((textDisplay) => textDisplay.setContent(`## ${locales.channel.title[interaction.locale] ?? locales.channel.title['en-US']}\n${locales.channel.description[interaction.locale] ?? locales.channel.description['en-US']}`))
				.addActionRowComponents((actionRow) =>
					actionRow.addComponents(
						new ChannelSelectMenuBuilder()
							.setCustomId('channel')
							.setPlaceholder(locales.channel.placeholder[interaction.locale] ?? locales.channel.placeholder['en-US'])
							.setDisabled(false)
							.setMinValues(1)
							.setMaxValues(1)
							.setDefaultChannels([serverConfig.spawn_channel])
							.setChannelTypes([ChannelType.GuildText])
					)
				)
				.addSeparatorComponents((separator) => separator)
				//locale
				.addSectionComponents((section) =>
					section
						.addTextDisplayComponents((textDisplay) => textDisplay.setContent(`## ${locales.locale.title[interaction.locale] ?? locales.locale.title['en-US']}\n${locales.locale.description[interaction.locale] ?? locales.locale.description['en-US']}`))
						.setButtonAccessory((button) => button.setCustomId('actual-locale').setLabel(`${serverConfig.locale}`.toUpperCase()).setEmoji({ name: '🌐' }).setStyle(ButtonStyle.Secondary).setDisabled(false))
				)
				.addActionRowComponents((actionRow) =>
					actionRow.addComponents(
						new StringSelectMenuBuilder()
							.setCustomId('locale')
							.setPlaceholder(locales.locale.placeholder[interaction.locale] ?? locales.locale.placeholder['en-US'])
							.setDisabled(false)
							.setMinValues(1)
							.setMaxValues(1)
							.setOptions(localeOptions(locales, serverConfig.locale, interaction.locale))
					)
				)
				.addActionRowComponents((actionRow) =>
					actionRow.addComponents(
						new ButtonBuilder()
							.setCustomId('auto-locale')
							.setLabel(`${locales.locale.button[interaction.locale] ?? locales.locale.button['en-US']} [${`${interaction.guild.preferredLocale ? interaction.guild.preferredLocale : interaction.locale}`.toUpperCase()}]`)
							.setStyle(ButtonStyle.Primary)
					)
				);
			//.addSeparatorComponents((separator) => separator);
			//leaderboard_channel
			return true;
		}

		await updateContainer();

		let msg = await interaction.reply({ components: [container], flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2] });
		let loop = true;
		while (loop) {
			let response = await msg.awaitMessageComponent().catch();

			if (!response) return (loop = false);
			if (!response.customId) return;
			if (response.customId == 'enable') {
				if (channel) {
					await client
						.knex('guilds')
						.update({ enabled: true })
						.where({ id: interaction.guild.id })
						.catch((err) => console.error(err));
				} else {
					//disable bot
					await client
						.knex('guilds')
						.update({ enabled: false })
						.where({ id: interaction.guild.id })
						.catch((err) => console.error(err));
				}
			} else if (response.customId == 'disable') {
				await client
					.knex('guilds')
					.update({ enabled: false })
					.where({ id: interaction.guild.id })
					.catch((err) => console.error(err));
			} else if (response.customId == 'channel') {
				await client
					.knex('guilds')
					.update({ spawn_channel: response.values[0] })
					.where({ id: interaction.guild.id })
					.catch((err) => console.error(err));
			} else if (response.customId == 'auto-locale') {
				await client
					.knex('guilds')
					.update({ locale: interaction.guild.preferredLocale ? interaction.guild.preferredLocale : interaction.locale })
					.where({ id: interaction.guild.id })
					.catch((err) => console.error(err));
			} else if (response.customId == 'locale') {
				await client
					.knex('guilds')
					.update({ locale: response.values[0] })
					.where({ id: interaction.guild.id })
					.catch((err) => console.error(err));
			}

			await updateContainer();
			msg = await response.update({ components: [container] }).catch((err) => console.error(err));
		}

		/*
		if (subcommand == 'leaderboard_channel') {
			await client
				.knex('guilds')
				.update({ leaderboard_channel: interaction.options.getChannel('channel').id })
				.where({ id: interaction.guild.id })
				.catch((err) => console.error(err));
			let message = locales.run.changedLeaderChan[interaction.locale] ?? locales.run.changedLeaderChan["en-US"];
			interaction.editReply(message.replace('%channel%', interaction.options.getChannel('channel').name));
		}
		if (subcommand == 'leaderboard') {
			let option = JSON.parse(
				(await client
					.knex('guilds')
					.update({ leaderboard: JSON.stringify(interaction.values) })
					.where({ id: interaction.guild.id })
					.catch((err) => console.log(err))) ?? '[]'
			);
			const row = new ActionRowBuilder().addComponents(
				new StringSelectMenuBuilder()
					.setCustomId('leaderboard')
					.setPlaceholder('Select different leaderboards to show')
					.addOptions([
						{ label: `1. Cards completion Leaderboard`, value: `1`, default: option.includes('1') },
						{ label: `2. Cards Leaderboard`, value: `2`, default: option.includes('2') },
						{ label: `3. Global Cards completion Leaderboard`, value: `3`, default: option.includes('3') },
						{ label: `4. Global Cards Leaderboard`, value: `4`, default: option.includes('4') },
						{ label: `5. Server Cards Completion Leaderboard`, value: `5`, default: option.includes('5') },
					])
					.setMaxValues(5)
					.setMinValues(0)
			);

			await interaction.editReply({ content: 'Please select different leaderboards to show:', components: [row], flags: MessageFlags.Ephemeral });
		}

		if (subcommand == 'leaderboard_edit') {
			let channel = await interaction.guild.channels.cache.get(serverConfig.leaderboard_edit);
			if (!channel) {
				client
					.knex('guilds')
					.update({ leaderboard_edit: interaction.options.getString('enable') == 'true' ? true : false })
					.where({ id: interaction.guild.id })
					.catch((err) => console.error(err));
			} else {
				return interaction.editReply('Cannot enable leaderboard if the channel is not set, use `/config leaderboard_channel <channel>`');
			}
			let message = locales.run.changedLeaderEna[interaction.locale] ?? locales.run.changedLeaderEna["en-US"];
			interaction.editReply(message.replace('%enable%', interaction.options.getString('enable') == 'true' ? 'Enable' : 'Disable'));
		}
			*/
	},
};

function localeOptions(locales, serverLocale, interactionLocale) {
	let lang = locales.locale.list;
	let flag = {
		de: '🇩🇪',
		'en-US': '🇺🇸',
		es: '🇪🇸',
		fr: '🇫🇷',
		it: '🇮🇹',
		du: '🇳🇱',
		no: '🇳🇴',
		pl: '🇵🇱',
		'pt-BR': '🇧🇷',
		ro: '🇷🇴',
		fi: '🇫🇮',
		'sv-SE': '🇸🇪',
		bg: '🇧🇬',
		ru: '🇷🇺',
		uk: '🇺🇦',
		'zh-CN': '🇨🇳',
		ja: '🇯🇵',
		ko: '🇰🇷',
	};
	return Array.from(Object.keys(lang)).map((key) => {
		return {
			label: lang[key][interactionLocale] ?? lang[key]['en-US'],
			value: key,
			emoji: { name: flag[key] ? flag[key] : '🌐' },
			default: key == serverLocale,
		};
	});
}
