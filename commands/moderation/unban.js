const Command = require("../../structures/Command");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const Discord = require("discord.js");

module.exports = class Unban extends Command {
	constructor(client) {
		super(client, {
			name: "unban",
			description: client.cmdConfig.unban.description,
			usage: client.cmdConfig.unban.usage,
			permissions: client.cmdConfig.unban.permissions,
      aliases: client.cmdConfig.unban.aliases,
			category: "moderation",
			listed: client.cmdConfig.unban.enabled,
      slash: true,
      options: [{
        name: 'userid',
        type: Discord.ApplicationCommandOptionType.String,
        description: 'ID of User to UnBan',
        required: true,
      }]
		});
	}
  
  async run(message, args) {
    const user = args[0];
    if(!user || isNaN(user)) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.unban.usage)] });
    message.guild.members.unban(user).then(() => {
      message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.moderation.titles.unban, this.client.language.moderation.unbanned
        .replace("<user>", `<@${user}>`)
        .replace("<staff>", message.author), this.client.embeds.success_color)] });

      this.client.utils.logs(this.client, message.guild, this.client.language.moderation.titles.unban, [{
        name: this.client.language.titles.logs.fields.user,
        desc: `<@${user}>`
      },{
        name: this.client.language.titles.logs.fields.staff,
        desc: message.author
      }], message.author, "UNBAN");
    })
    .catch(err => {
      console.log(err)
      message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.moderation.not_banned, this.client.embeds.error_color)] });
    });
  }

  async slashRun(interaction, args) {
    const user = interaction.options.getString("userid")
    if(!user || isNaN(user)) return interaction.reply({ embeds: [this.client.utils.validUsage(this.client, interaction, this.client.cmdConfig.unban.usage)], ephemeral: this.client.cmdConfig.unban.ephemeral });
    interaction.guild.members.unban(user).then(() => {
      interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.moderation.titles.unban, this.client.language.moderation.unbanned
        .replace("<user>", `<@${user}>`)
        .replace("<staff>", interaction.user), this.client.embeds.success_color)], ephemeral: this.client.cmdConfig.unban.ephemeral });
      this.client.utils.logs(this.client, interaction.guild, this.client.language.moderation.titles.unban, [{
        name: "User",
        desc: `<@${user}>`
      },{
        name: this.client.language.titles.logs.fields.staff,
        desc: interaction.user
      }], interaction.user, "UNBAN");
    })
    .catch(err => {
	  console.log(err)
      interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.moderation.not_banned, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.unban.ephemeral });
    });
  }
};
