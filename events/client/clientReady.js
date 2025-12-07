const Logger = require("../../utils/Logger");

let activity = "count my card ...";

module.exports = {
  name: "clientReady",
  once: true,
  async execute(client) {
    Logger.client(client, "Je suis prêt !");

    client.user.setPresence({
      activities: [{ name: activity }],
    });

    client.guilds.cache.forEach(guild => {
      client
        .knex("guilds")
        .update({ last_card: null })
        .where({ id: guild.id })
        .catch(err => {});
    });

    client.application.commands
      .set(client.commands.map(cmd => cmd))
      .catch(err => {
        if (err) {
          Logger.warn(
            client,
            "Le nombre de commandes envoyé est superieur au SpeedLimit de Discord",
            err
          );
        }
      });

    Logger.succes(client, "Bot démaré avec succès !");
    try {
      client.logger.log(
        "info",
        `Bot started with ${client.guilds.cache.size} guilds and ${client.users.cache.size} users.`
      );
    } catch (e) {
      client.logger.log("info", `Bot started`);
    }

    require("../../utils/functions/leaderboard").leaderboard_start(client);
    require("../../utils/functions/anticheat").anticheat_start(client);
    require("../../utils/functions/update").upgrade_data(client);
    require("../../utils/functions/update").update_data(client);
  },
};
