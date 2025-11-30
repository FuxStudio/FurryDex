const { glob } = require('glob');
const Logger = require('../Logger.js');

module.exports = async (client) => {
  (await glob(`./modals/*/*.js`)).map(async (modalFile) => {
    const modal = require(`${process.cwd()}/${modalFile}`);

    if (!modal.name) return Logger.warn(client, `Nom non défini\nFile: ${modalFile}`);
    client.modals.set(modal.name, modal);
  });
};
