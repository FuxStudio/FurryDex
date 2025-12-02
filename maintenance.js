const yaml = require("js-yaml");
const fs = require("fs");
let config = {};

try {
  const doc = yaml.load(fs.readFileSync("./config/config.yaml", "utf8"));
  config = doc;
} catch (e) {
  console.log(e);
}

const {
  Client,
  GatewayIntentBits,
  Partials,
  ActivityType,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.AutoModerationExecution,
    GatewayIntentBits.DirectMessagePolls,
    GatewayIntentBits.GuildMessagePolls,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [
    Partials.User,
    Partials.Channel,
    Partials.GuildMember,
    Partials.Message,
    Partials.Reaction,
    Partials.GuildScheduledEvent,
    Partials.ThreadMember,
  ],
});

client.login(config.bot.token);
knex = require("knex")(config.database);

client.on("ready", () => {
  console.log("Bot is ready");

  client.user.setPresence({
    activities: [{ name: "MAINTENANCE :/", type: ActivityType.Custom }],
    status: "dnd",
  });

  TEST();
});

async function TEST() {
  guild = client.guilds.cache.get("1235970684556021890");

  let userId = "643835326485233716";
  console.log(
    await knex("user_cards")
      .select("*")
      .where({ user_id: userId })
      .distinct("card_id")
      .catch(err => {
        console.error(err);
      })
  );
}
