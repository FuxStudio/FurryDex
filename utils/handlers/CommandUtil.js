const { InteractionContextType } = require("discord.js");
const { glob } = require("glob");
const Logger = require("../Logger.js");
const process = require("process");

module.exports = async client => {
  (await glob(`./commands/*/*.js`)).map(async cmdFile => {
    const cmd = require(`${process.cwd()}/${cmdFile}`);
    if (!cmd.name)
      return Logger.warn(null, `Nom Non Definie\nFichier: ${cmdFile}`);
    if (cmd.name == "furry" && client.config.bot.base_command)
      cmd.name = client.config.bot.base_command;
    if (!cmd.description)
      return Logger.warn(null, `Description Non Definie\nFichier: ${cmdFile}`);
    if (!cmd.contexts) cmd.contexts = [InteractionContextType.Guild];
    if (!cmd.category)
      return Logger.warn(null, `Catégorie Non Definie\nFichier: ${cmdFile}`);

    if (cmd.permissions != null)
      cmd.default_member_permissions = cmd.permissions;

    try {
      (() => {
        if (client.locales == {}) return;
        let locales = client.locales["commands"][cmd.name];
        if (!locales)
          return Logger.warn(null, `Aucune traduction pour ${cmd.name}`);
        cmd.nameLocalizations = locales.name ?? {};
        cmd.descriptionLocalizations = locales.description ?? {};
        if (cmd.options && locales.options) {
          cmd.options.forEach((option, index) => {
            option.nameLocalizations = locales.options[option.name]?.name ?? {};
            option.descriptionLocalizations =
              locales.options[option.name]?.description ?? {};
            if (option.choices && locales.options[option.name]?.choices) {
              option.choices.forEach((optionchoices, indexchoices) => {
                optionchoices.nameLocalizations =
                  locales.options[option.name].choices[optionchoices.name] ??
                  {};
              });
            }
            if (option.options && locales.options[option.name]?.options) {
              option.options.forEach((suboption, subindex) => {
                suboption.nameLocalizations =
                  locales.options[option.name].options[suboption.name]?.name ??
                  {};
                suboption.descriptionLocalizations =
                  locales.options[option.name].options[suboption.name]
                    ?.description ?? {};
                if (
                  suboption.choices &&
                  locales.options[option.name].options[suboption.name].choices
                ) {
                  suboption.choices.forEach(
                    (suboptionchoices, subindexchoices) => {
                      suboptionchoices.nameLocalizations =
                        locales.options[option.name].options[suboption.name]
                          .choices[suboptionchoices.name] ?? {};
                    }
                  );
                }
              });
            }
          });
        }
      })();
    } catch (err) {
      Logger.warn(null, "TRANSLATION ERROR on " + cmd.name);
      console.error(err);
    }

    client.commands.set(cmd.name, cmd);
    Logger.command(null, `Chargé: ${cmd.name}`);
  });
};
