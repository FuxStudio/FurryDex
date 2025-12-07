module.exports = {
  name: "leaderboard",
  async run(client, interaction) {
    await interaction.deferReply();
    client
      .knex("guilds")
      .update({ leaderboard: JSON.stringify(interaction.values) || "[]" })
      .where({ id: interaction.guild.id })
      .catch(err => console.log(err));
    interaction.editReply({
      content: "The different leaderboards to show have been edited",
    });
  },
};
