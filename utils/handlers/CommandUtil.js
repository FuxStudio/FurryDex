const { PermissionFlagsBits, ApplicationCommandType, InteractionContextType } = require('discord.js');
const { glob } = require('glob');
const Logger = require('../Logger.js');
const process = require('process');

module.exports = async (client) => {
	(await glob(`./commands/*/*.js`)).map(async (cmdFile) => {
		const cmd = require(`${process.cwd()}/${cmdFile}`);
		if (!cmd.name) return Logger.warn(null, `Nom Non Definie\nFichier: ${cmdFile}`);
		if (cmd.name == 'furry' && client.config.bot.base_command) cmd.name = client.config.bot.base_command;
		if (!cmd.description) return Logger.warn(null, `Description Non Definie\nFichier: ${cmdFile}`);
		if (!cmd.contexts) cmd.contexts = [InteractionContextType.Guild];
		if (!cmd.category) return Logger.warn(null, `Catégorie Non Definie\nFichier: ${cmdFile}`);

		if (cmd.permissions != null) cmd.default_member_permissions = cmd.permissions;

		try {
			() => {
				if (client.locales == {}) return;
				let locales = client.locales['commands'][cmd.name];
				if (!locales) return Logger.warn(null, `Aucune traduction pour ${cmd.name}`);
				cmd.nameLocalizations = locales.name ?? {};
				cmd.descriptionLocalizations = locales.description ?? {};
				if (cmd.options && locales.options) {
					cmd.options.forEach((option, index) => {
						option.nameLocalizations = locales.options[option.name]?.name ?? {};
						option.descriptionLocalizations = locales.options[option.name]?.description ?? {};
						if (option.choices && locales.options[option.name]?.choices) {
							suboption.choices.forEach((optionchoices, indexchoices) => {
								optionchoices.nameLocalizations = locales.options[option.name].choices[optionchoices.name] ?? {};
							});
						}
						if (option.options && locales.options[option.name]?.options) {
							option.options.forEach((suboption, subindex) => {
								suboption.nameLocalizations = locales.options[option.name].options[suboption.name]?.name ?? {};
								suboption.descriptionLocalizations = locales.options[option.name].options[suboption.name]?.description ?? {};
								if (suboption.choices && locales.options[option.name].options[suboption.name].choices) {
									suboption.choices.forEach((suboptionchoices, subindexchoices) => {
										suboptionchoices.nameLocalizations = locales.options[option.name].options[suboption.name].choices[suboptionchoices.name] ?? {};
									});
								}
							});
						}
					});
				}
			};
		} catch (err) {
			Logger.warn(null, 'TRANSLATION ERROR on ' + cmd.name);
			console.error(err);
		}

		client.commands.set(cmd.name, cmd);
		Logger.command(null, `Chargé: ${cmd.name}`);
	});
};

const permissionList = [
	'CREATE_INSTANT_INVITE',
	'KICK_MEMBERS',
	'BAN_MEMBERS',
	'ADMINISTRATOR',
	'MANAGE_CHANNELS',
	'MANAGE_GUILD',
	'ADD_REACTIONS',
	'VIEW_AUDIT_LOG',
	'PRIORITY_SPEAKER',
	'STREAM',
	'VIEW_CHANNEL',
	'SEND_MESSAGES',
	'SEND_TTS_MESSAGES',
	'MANAGE_MESSAGES',
	'EMBED_LINKS',
	'ATTACH_FILES',
	'READ_MESSAGE_HISTORY',
	'MENTION_EVERYONE',
	'USE_EXTERNAL_EMOJIS',
	'VIEW_GUILD_INSIGHTS',
	'CONNECT',
	'SPEAK',
	'MUTE_MEMBERS',
	'DEAFEN_MEMBERS',
	'MOVE_MEMBERS',
	'USE_VAD',
	'CHANGE_NICKNAME',
	'MANAGE_NICKNAMES',
	'MANAGE_ROLES',
	'MANAGE_WEBHOOKS',
	'MANAGE_EMOJIS_AND_STICKERS',
	'USE_APPLICATION_COMMANDS',
	'REQUEST_TO_SPEAK',
	'MANAGE_EVENTS',
	'MANAGE_THREADS',
	'USE_PUBLIC_THREADS',
	'CREATE_PUBLIC_THREADS',
	'USE_PRIVATE_THREADS',
	'CREATE_PRIVATE_THREADS',
	'USE_EXTERNAL_STICKERS',
	'SEND_MESSAGES_IN_THREADS',
	'START_EMBEDDED_ACTIVITIES',
	'MODERATE_MEMBERS',
];

const permissionArray = {
	CREATE_INSTANT_INVITE: {
		BigInt: PermissionFlagsBits.CreateInstantInvite,
	},
	KICK_MEMBERS: {
		BigInt: PermissionFlagsBits.KickMembers,
	},
	BAN_MEMBERS: {
		BigInt: PermissionFlagsBits.BanMembers,
	},
	ADMINISTRATOR: {
		BigInt: PermissionFlagsBits.Administrator,
	},
	MANAGE_CHANNELS: {
		BigInt: PermissionFlagsBits.ManageChannels,
	},
	MANAGE_GUILD: {
		BigInt: PermissionFlagsBits.ManageGuild,
	},
	ADD_REACTIONS: {
		BigInt: PermissionFlagsBits.AddReactions,
	},
	VIEW_AUDIT_LOG: {
		BigInt: PermissionFlagsBits.ViewAuditLog,
	},
	PRIORITY_SPEAKER: {
		BigInt: PermissionFlagsBits.PrioritySpeaker,
	},
	STREAM: {
		BigInt: PermissionFlagsBits.Stream,
	},
	VIEW_CHANNEL: {
		BigInt: PermissionFlagsBits.ViewChannel,
	},
	SEND_MESSAGES: {
		BigInt: PermissionFlagsBits.SendMessages,
	},
	SEND_TTS_MESSAGES: {
		BigInt: PermissionFlagsBits.SendTTSMessages,
	},
	MANAGE_MESSAGES: {
		BigInt: PermissionFlagsBits.ManageMessages,
	},
	EMBED_LINKS: {
		BigInt: PermissionFlagsBits.EmbedLinks,
	},
	ATTACH_FILES: {
		BigInt: PermissionFlagsBits.AttachFiles,
	},
	READ_MESSAGE_HISTORY: {
		BigInt: PermissionFlagsBits.ReadMessageHistory,
	},
	MENTION_EVERYONE: {
		BigInt: PermissionFlagsBits.MentionEveryone,
	},
	USE_EXTERNAL_EMOJIS: {
		BigInt: PermissionFlagsBits.UseExternalEmojis,
	},
	VIEW_GUILD_INSIGHTS: {
		BigInt: PermissionFlagsBits.ViewGuildInsights,
	},
	CONNECT: {
		BigInt: PermissionFlagsBits.Connect,
	},
	SPEAK: {
		BigInt: PermissionFlagsBits.Speak,
	},
	MUTE_MEMBERS: {
		BigInt: PermissionFlagsBits.MuteMembers,
	},
	DEAFEN_MEMBERS: {
		BigInt: PermissionFlagsBits.DeafenMembers,
	},
	MOVE_MEMBERS: {
		BigInt: PermissionFlagsBits.MoveMembers,
	},
	USE_VAD: {
		BigInt: PermissionFlagsBits.UseVAD,
	},
	CHANGE_NICKNAME: {
		BigInt: PermissionFlagsBits.ChangeNickname,
	},
	MANAGE_NICKNAMES: {
		BigInt: PermissionFlagsBits.ManageNicknames,
	},
	MANAGE_ROLES: {
		BigInt: PermissionFlagsBits.ManageRoles,
	},
	MANAGE_WEBHOOKS: {
		BigInt: PermissionFlagsBits.ManageWebhooks,
	},
	MANAGE_EMOJIS_AND_STICKERS: {
		BigInt: PermissionFlagsBits.ManageEmojisAndStickers,
	},
	USE_APPLICATION_COMMANDS: {
		BigInt: PermissionFlagsBits.UseApplicationCommands,
	},
	REQUEST_TO_SPEAK: {
		BigInt: PermissionFlagsBits.RequestToSpeak,
	},
	MANAGE_EVENTS: {
		BigInt: PermissionFlagsBits.ManageEvents,
	},
	MANAGE_THREADS: {
		BigInt: PermissionFlagsBits.ManageThreads,
	},
	USE_PUBLIC_THREADS: {
		BigInt: null,
	},
	CREATE_PUBLIC_THREADS: {
		BigInt: PermissionFlagsBits.CreatePublicThreads,
	},
	USE_PRIVATE_THREADS: {
		BigInt: null,
	},
	CREATE_PRIVATE_THREADS: {
		BigInt: PermissionFlagsBits.CreatePrivateThreads,
	},
	USE_EXTERNAL_STICKERS: {
		BigInt: PermissionFlagsBits.UseExternalStickers,
	},
	SEND_MESSAGES_IN_THREADS: {
		BigInt: PermissionFlagsBits.SendMessagesInThreads,
	},
	START_EMBEDDED_ACTIVITIES: {
		BigInt: PermissionFlagsBits.START_EMBEDDED_ACTIVITIES,
	},
	MODERATE_MEMBERS: {
		BigInt: PermissionFlagsBits.ModerateMembers,
	},
};
