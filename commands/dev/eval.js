const Command = require("../../structures/Command");
const Discord = require("discord.js");

module.exports = class Eval extends Command {
	constructor(client) {
		super(client, {
			name: "eval",
			description: client.cmdConfig.eval.description,
			usage: client.cmdConfig.eval.usage,
			permissions: client.cmdConfig.eval.permissions,
      aliases: client.cmdConfig.eval.aliases,
			category: "dev",
			listed: false,
		});
	}
  
  async run(message, args) {
    var allowedToUse = false;
  
    this.client.config.general.eval.forEach(id => {
      if(message.author.id == id) allowedToUse = true;
    });
  
    if (allowedToUse) {
      if(this.client.config.general.eval.length == 0) return;
      const hastebin = require('hastebin-gen');
      const embed = new Discord.EmbedBuilder()
        .setAuthor({ name: "Eval", iconURL: this.client.user.displayAvatarURL() })
        .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();
      const code = args.join(' ');

      String.prototype.replaceAll = function (search, replacement) {
        return this.replace(RegExp(search, 'gi'), replacement);
      };
      this.client.clean = text => {
        if (typeof text !== 'string') {
            text = require('util')
                .inspect(text, { depth: 0 });
        }
        text = text
            .replace(/`/g, '`' + String.fromCharCode(8203))
            .replace(/@/g, '@' + String.fromCharCode(8203))
            .replaceAll(this.client.token, 'N/A')
        return text;
    };
      try {
        if(!args[0]) return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, 
          `Error`, "You haven't entered Code to run.", this.client.embeds.error_color)] });
        const evaled = this.client.clean(eval(code));
        embed.addFields([{ name: '📥︲Input', value: `\`\`\`xl\n${code}\n\`\`\`` }]);
        embed.setColor('Yellow');
        if (evaled.length < 800) {
          embed.addFields([{ name: '📤︲Output', value: `\`\`\`xl\n${evaled}\n\`\`\`` }]);
        } else {
          await hastebin(evaled, { extension: "js", url: "https://hastebin.com"}).then(r => {
              embed.addFields([{ name: '📤︲Output', value: `\`\`\`xl\n${r}\n\`\`\`` }])
            });
          }
        message.channel.send({ embeds: [embed] });
      } catch (err) {
          embed.addFields([{ name: '📥︲Input', value: `\`\`\`\n${code}\n\`\`\`` }]);
          embed.setColor('Red');
          embed.addFields([{ name: '📤︲Error', value: `\`\`\`xl\n${err}\n\`\`\`` }]);
          message.channel.send({ embeds: [embed] });
      }
    }
  }
}
function clean(text) {
  return text
    .replace(/`/g, "`" + String.fromCharCode(8203))
    .replace(/@/g, "@" + String.fromCharCode(8203));
};
