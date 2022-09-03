const Command = require("../../structures/Command");
const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = class Unmute extends Command {
	constructor(client) {
		super(client, {
			name: "unmute",
			description: client.cmdConfig.unmute.description,
			usage: client.cmdConfig.unmute.usage,
			permissions: client.cmdConfig.unmute.permissions,
      aliases: client.cmdConfig.unmute.aliases,
			category: "moderation",
			listed: client.cmdConfig.unmute.enabled,
      slash: true,
      options: [{
        name: 'user',
        type: Discord.ApplicationCommandOptionType.User,
        description: 'User to UnMute',
        required: true,
      }]
		});
	}
  
  async run(message, args) {
    let config = this.client.config;
    let member = message.mentions.members.first();
  
    if (!member.isCommunicationDisabled())
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.moderation.not_muted, this.client.embeds.error_color)] });
      
    await member.timeout(null);
    
    message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.moderation.titles.unmute, this.client.language.moderation.unmuted
      .replace("<user>", `<@${member.id}>`)
      .replace("<staff>", message.author), this.client.embeds.success_color)] });
    
    this.client.utils.logs(this.client, message.guild, this.client.language.moderation.titles.unmute, [{
        name: "User",
        desc: member.user
      },{
        name: this.client.language.titles.logs.fields.staff,
        desc: message.author
      }], member.user, "UNMUTE");
  }

  async slashRun(interaction, args) {
    let config = this.client.config;
    let member = interaction.options.getUser("user");
    member = interaction.guild.members.cache.get(member.id);
  
    if (!member.isCommunicationDisabled())
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.moderation.not_muted, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.unmute.ephemeral });
      
    await member.timeout(null)

    interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.moderation.titles.unmute, this.client.language.moderation.unmuted
      .replace("<user>", `<@${member.id}>`)
      .replace("<staff>", interaction.user), this.client.embeds.success_color)], ephemeral: this.client.cmdConfig.unmute.ephemeral });
    this.client.utils.logs(this.client, interaction.guild, this.client.language.moderation.titles.unmute, [{
        name: this.client.language.titles.logs.fields.user,
        desc: member.user
      },{
        name: this.client.language.titles.logs.fields.staff,
        desc: interaction.user
      }], member.user, "UNMUTE");
  }
};
