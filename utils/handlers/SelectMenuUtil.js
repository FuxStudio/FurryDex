const { glob } = require('glob');
const Logger = require('../Logger.js');

module.exports = async (client) => {
	(await glob(`./selects/*/*.js`)).map(async (smFile) => {
		const sm = require(`${process.cwd()}/${smFile}`);
		if (!sm.name) return Logger.warn(client, `Nom Non Definie\nFile: ${smFile}`);
		client.selects.set(sm.name, sm);
	});
};
