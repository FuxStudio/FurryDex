const { Client, Collection, Partials, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const process = require('node:process');
const yaml = require('js-yaml');
const client = new Client({
	intents: [
		//GatewayIntentBits.NON_PRIVILEGED,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
	partials: [Partials.User, Partials.Channel, Partials.GuildMember, Partials.Message],
});
const Logger = require('./utils/Logger.js');
const winston = require('winston');
require('winston-daily-rotate-file');
var logger = new winston.Logger({
	transports: [
		new winston.transports.DailyRotateFile({
			filename: `./logs/%DATE%.log`,
			datePattern: 'YYYY-MM-DD',
			zippedArchive: true,
			maxSize: '20m',
			maxFiles: '31d',
		}),
	],
});
client.logger = logger;

try {
	client.config = yaml.load(fs.readFileSync('./config/config.yaml', 'utf8'));
} catch (e) {
	return console.error('Config file does not exist !', e);
}
const debug = client.config.dev.debug;

const { isXMinutesPassed } = require('./utils/functions/spawn');
const { cp } = require('node:fs');

['commands', 'buttons', 'selects', 'modals'].forEach((x) => (client[x] = new Collection()));
['EventUtil', 'ButtonUtil', 'ModalUtil', 'SelectMenuUtil'].forEach((handler) => {
	require(`./utils/handlers/${handler}`)(client);
});
client.locales = {};

require('./utils/functions/translations.js')().then(() => {
	client.locales = JSON.parse(fs.readFileSync('./src/build_locales.json'));
	require(`./utils/handlers/CommandUtil.js`)(client);
});

if (!debug) {
	process.on('exit', (code) => {
		if (code === 0) return logger.log('info', `Process exited successfully.`);
		logger.log('error', `Process exited with code: ${code}`);
		Logger.error(client, `Bot stopped with code: ${code}`);
	});
	process.on('uncaughtException', (err, origin) => {
		logger.log('error', `Uncaught Exception: ${err}\nOrigin: ${String(origin)}`);
		Logger.error(client, `${'uncaughtException'.toUpperCase()}: ${err}\nOrigin: ${String(origin)}`);
	});
	process.on('unhandledRejection', (reason, promise) => {
		logger.log('error', `Unhandled Rejection at: ${Promise.resolve(promise)}\nReason: ${reason}`);
		Logger.error(client, `${'unhandledRejection'.toUpperCase()}: at ${Promise.resolve(promise)}\nReason: ${reason}`);
	});
	process.on('warning', (...args) => {
		logger.log('warn', ...args);
		Logger.warn(...args);
	});
	client.rest.on('rateLimited', (rateLimited) => {
		logger.log('warn', `Rate limited: ${JSON.stringify(rateLimited)}`);
		Logger.warn(client, `${'rateLimited'.toUpperCase()}: ${rateLimited}`);
	});
	client.rest.on('invalidRequestWarning', (invalidRequestWarningData) => {
		logger.log('warn', `Invalid request warning: ${JSON.stringify(invalidRequestWarningData)}`);
		Logger.warn(client, `${'invalidRequestWarning'.toUpperCase()}: ${invalidRequestWarningData}`);
	});
	client.on('warn', (info) => {
		logger.log('warn', info);
		Logger.warn(client, `${'warn'.toUpperCase()}: ${info}`);
	});
	client.on('error', (info) => {
		logger.log('error', info);
		Logger.error(client, `${'error'.toUpperCase()}: ${info}`);
	});
	client.on('shardDisconnect', (event, id) => {
		logger.log('error', `Shard disconnected: ID ${id}, Event: ${JSON.stringify(event)}`);
		Logger.shard(client, `${'shardDisconnect'.toUpperCase()} - ID: ${id}: ${event}`);
	});
	client.on('shardError', (event, id) => {
		logger.log('error', `Shard error: ID ${id}, Event: ${JSON.stringify(event)}`);
		Logger.error(client, `${'shardError'.toUpperCase()} - ID: ${id}: ${event}`);
	});
	client.on('shardReady', (event, id) => {
		logger.log('info', `Shard ready: ID ${id}, Event: ${JSON.stringify(event)}`);
		Logger.shard(client, `${'shardReady'.toUpperCase()} - ID: ${id}: ${event}`);
	});
	client.on('shardReconnecting', (id) => {
		logger.log('info', `Shard reconnecting: ID ${id}`);
		Logger.shard(client, `${'shardReconnecting'.toUpperCase()} - ID: ${id}`);
	});
	client.on('shardResume', (id, event) => {
		logger.log('info', `Shard resumed: ID ${id}, Event: ${JSON.stringify(event)}`);
		Logger.shard(client, `${'shardResume'.toUpperCase()} - ID: ${id}: ${event}`);
	});
}

client.knex = require('knex')(client.config.database);

client.login(client.config.bot.token);

// --------- COG & SPAWN ----------

client.on('messageCreate', (message) => {
	if (message.author.id == client.user.id) return;
	client.logger.log('info', `/ Message received... Processing card spawning process...`);
	if (message.channel.isDMBased()) return client.logger.log('info', `\ DM channel detected. Ignoring message.`);
	if (client.config.bot.disable.bot) if (message.guild.members.cache.hasAny(...client.config.bot.disable.bot)) return client.logger.log('info', `\ Blacklisted bot in the guild. Ignoring message.`);
	if (message.author.bot) return client.logger.log('info', `\ Message from a bot detected. Ignoring message.`);
	client.logger.log('info', `| Message passed firsts checks. Proceeding to check if card spawning is allowed...`);

	isXMinutesPassed(message, client).then((result) => {
		require('./utils/functions/anticheat.js').anticheat_message(client, message, message.author.id, result ? 1 : 0);
	});
});

let callAmount = 0;
process.on('SIGINT', function () {
	if (callAmount < 1) {
		Logger.succes(client, '✅ - Desactivation du bot ...', 'Veuillez patientez');
		client.logger.log('info', `Bot stopped by SIGINT signal.`);
		client.destroy();
		setTimeout(() => process.exit(0), 1000);
	}

	callAmount++;
});
