const Command = require("../../structures/Command");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const Discord = require("discord.js");

module.exports = class Slowmode extends Command {
	constructor(client) {
		super(client, {
			name: "slowmode",
			description: client.cmdConfig.slowmode.description,
			usage: client.cmdConfig.slowmode.usage,
			permissions: client.cmdConfig.slowmode.permissions,
      aliases: client.cmdConfig.slowmode.aliases,
			category: "moderation",
			listed: client.cmdConfig.slowmode.enabled,
      slash: true,
      options: [{
        name: 'seconds',
        type: Discord.ApplicationCommandOptionType.Number,
        description: 'Slowmode Seconds',
        required: true,
      }]
		});
	}
  
  async run(message, args) {
    let seconds = args[0];
    if(!seconds || isNaN(seconds)) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.slowmode.usage)] });

    message.channel.setRateLimitPerUser(seconds);

    message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.moderation.titles.slowmode, this.client.language.moderation.slowmode.replace("<channel>", message.channel).replace("<seconds>", seconds), this.client.embeds.success_color)] });
  }
  async slashRun(interaction, args) {
    let seconds = interaction.options.getInteger("seconds");

    interaction.channel.setRateLimitPerUser(seconds);

    interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.reply, this.client.language.moderation.titles.slowmode, this.client.language.moderation.slowmode.replace("<channel>", message.channel).replace("<seconds>", seconds), this.client.embeds.success_color)], ephemeral: this.client.cmdConfig.slowmode.ephemeral });
  }
};
