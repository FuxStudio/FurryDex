const yaml = require("js-yaml");
const fs = require("fs");

let config;
try {
  config = yaml.load(fs.readFileSync("./config/config.yaml", "utf8"));
} catch (e) {
  return console.error("Config file does not exist !", e);
}

if (config.bot.shard) {
  const { ShardingManager } = require("discord.js");

  try {
    const manager = new ShardingManager("./bot.js", {
      token: config.bot.token,
    });

    manager.on("shardCreate", shard =>
      require("./utils/Logger").shard(
        null,
        `Lancement de la shard #${shard.id}`
      )
    );

    manager.spawn();

    setInterval(
      () => {
        if (manager.totalShards - manager.shards.size !== 0) {
          manager.spawn({ amount: manager.totalShards - manager.shards.size });
        }
      },
      1000 * 60 * 60 * 24
    ); // every day
  } catch (error) {
    return require("./utils/Logger").error(
      null,
      "Error au lancement de shard !",
      error
    );
  }
} else {
  require("./bot.js");
}
