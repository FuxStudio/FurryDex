const { glob } = require("glob");
const Logger = require("../Logger.js");

module.exports = async client => {
  (await glob(`./buttons/*/*.js`)).map(async btnFile => {
    const btn = require(`${process.cwd()}/${btnFile}`);
    if (!btn.name)
      return Logger.warn(
        client,
        `\n-----\nERROR: btn: No Name\nFile: ${btnFile}\n-----\n`
      );
    client.buttons.set(btn.name, btn);
  });
};
