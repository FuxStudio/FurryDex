const { InteractionContextType } = require('discord.js');
module.exports = {
  name: 'cards',
  description: 'base cards command',
  category: 'cards',
  fullyTranslated: true,
  permissions: null,
  contexts: [InteractionContextType.BotDM, InteractionContextType.Guild],
  run: (client, message, args) => {},
  runSlash: async (client, interaction) => {
    interaction.reply(`Card creation is not ready yet. Please join the Discord server for create your card. (Check BIO)`);
  },
};
