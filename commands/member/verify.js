const Command = require("../../structures/Command");

module.exports = class Verify extends Command {
	constructor(client) {
		super(client, {
			name: "verify",
			description: client.cmdConfig.verify.description,
			usage: client.cmdConfig.verify.usage,
			permissions: client.cmdConfig.verify.permissions,
      aliases: client.cmdConfig.verify.aliases,
			category: "member",
			listed: client.cmdConfig.verify.enabled,
		});
	}

  async run(message, args) {
    let findChannel = this.client.utils.findChannel(message.guild, this.client.config.plugins.verification.channel);
    if(message.channel.id != findChannel?.id) return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.utility.verify_channel, this.client.embeds.error_color)] });;
    this.client.emit("guildMemberAdd", message.member);
  }

  async slashRun(interaction, args) { }
};
