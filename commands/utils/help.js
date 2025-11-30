const { EmbedBuilder, ApplicationCommandOptionType, MessageFlags, InteractionContextType } = require('discord.js');
const { readdirSync } = require('fs');
const commandFolder = readdirSync('./commands');
const prefix = '/';

const categoryName = {
  admin: {
    default: '🟥 Administrator',
    fr: '🟥 Administration',
  },
  furries: {
    default: '🐺 Furries',
    fr: '🐺 Furries',
  },
  mod: {
    default: '🔰 Moderator',
    fr: '🔰 Modération',
  },
  utils: {
    default: '🟢 Utils',
    fr: '🟢 Utilitaire',
  },
};

module.exports = {
  name: 'help',
  category: 'utils',
  usage: 'help <command>',
  examples: ['help ping', 'help furries'],
  description: 'Need help ?',
  permissions: null,
  contexts: [InteractionContextType.PrivateChannel, InteractionContextType.Guild, InteractionContextType.BotDM],
  run: (client, message, args) => {},
  options: [
    {
      name: 'command',
      description: 'Write the name of your command',
      type: ApplicationCommandOptionType.String,
      require: false,
    },
  ],
  runSlash: (client, interaction) => {
    const cmdName = interaction.options.getString('command');
    if (!cmdName) {
      const noArgsEmbed = new EmbedBuilder().setColor('#f54ea7').setDescription('List of commands of the bot. Use `/help <commands>` For see more commands information');

      for (const category of commandFolder) {
        noArgsEmbed.addFields([
          {
            name: `${
              categoryName[category] ? `${categoryName[category][interaction.locale] ? categoryName[category][interaction.locale] : categoryName[category]['default']}` : `🔸 ${category.replace(/(^\w|\s\w)/g, (firstLetter) => firstLetter.toUpperCase())}`
            }`,
            value: `\`${client.commands
              .filter((cmd) => cmd.category == category.toLowerCase())
              .filter((cmd) => cmd.ownerOnly != true)
              .map((cmd) => cmd.name)
              .join(', ')}\``,
          },
        ]);
      }
      return interaction.reply({ embeds: [noArgsEmbed], flags: MessageFlags.Ephemeral });
    }

    const cmd = client.commands.get(cmdName);
    if (!cmd) return interaction.reply("This commands dosn't exist!");

    return interaction.reply(
      `\n\`\`\`makefile\n[Help: Command -> ${cmd.name}] ${cmd.ownerOnly ? "⚠️ Command reserved to bot's owner ⚠️" : cmd.staffOnly ? "🔰 Command reserved to bot's staff 🔰" : ''}\n\n${cmd.description}\n${
        cmd.usage ? `\nUsage: ${prefix}${cmd.usage}${cmd.examples ? `Examples: ${prefix}${cmd.examples.join(` | ${prefix}`)}` : ``}\n` : ''
      }\n- - -\n\n${prefix} = prefix used by the bot (/commands is also possible)\n{} = sub-command(s) possible | [] = required option(s) | <> = optional(s) option(s)\nDo not includes thes caracter -> {}, [] and <> in your commands\n\`\`\``
    );
  },
};

//`🔸 ${category.replace(/(^\w|\s\w)/g, (firstLetter) => firstLetter.toUpperCase())}`,
//`\`${client.commands
//  .filter((cmd) => cmd.category == category.toLowerCase())
//  .map((cmd) => cmd.name)
//  .join(", ")}\``
