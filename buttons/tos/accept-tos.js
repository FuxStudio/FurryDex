const { MessageFlags } = require("discord.js");

module.exports = {
  name: "accept-tos",
  run: async (client, interaction) => {
    client
      .knex("users")
      .update({ ToS: 1 })
      .where({ id: interaction.user.id })
      .catch(err => {
        console.error(err);
      })
      .then(() => {
        interaction.reply({
          content: "✅ Thank you. Enjoy the bot !",
          flags: MessageFlags.Ephemeral,
        });
      });
  },
};
