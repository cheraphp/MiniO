const Command = require("../../structures/Command");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const Discord = require("discord.js")

module.exports = class Kick extends Command {
	constructor(client) {
		super(client, {
			name: "kick",
			description: client.cmdConfig.kick.description,
			usage: client.cmdConfig.kick.usage,
			permissions: client.cmdConfig.kick.permissions,
      aliases: client.cmdConfig.kick.aliases,
			category: "moderation",
			listed: client.cmdConfig.kick.enabled,
      slash: true,
      options: [{
        name: 'user',
        type: Discord.ApplicationCommandOptionType.User,
        description: 'User to Kick',
        required: true,
      },{
        name: 'reason',
        type: Discord.ApplicationCommandOptionType.String,
        description: 'Kick Reason',
        required: false,
      }]
		});
	}
  
  async run(message, args) {
    let member = message.mentions.members.first();
    if(!member) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.kick.usage)] });
    if (member.permissions.has("ManageMessages") && !message.member.permissions.has("Administrator")) 
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.cannot_staff, this.client.embeds.error_color)] });
    
    if (message.author.id == member.id)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.cannot_self, this.client.embeds.error_color)] });

    if (!member.kickable)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.higher_perm, this.client.embeds.error_color)] });

    let reason = args.slice(1).join(" ");
    if (!args[1]) reason = this.client.language.moderation.no_reason;

    await member.kick(reason);

    let kickEmbed = this.client.embedBuilder(this.client, message.author, this.client.language.moderation.titles.kick, this.client.language.moderation.kicked.replace("<user>", member)
      .replace("<staff>", message.author)
      .replace("<reason>", reason), this.client.embeds.success_color);

    message.channel.send({ embeds: [kickEmbed] });

    this.client.utils.pushInf(message, member.id, this.client.language.moderation.history.format
      .replace("<date>", new Date().toLocaleString())
      .replace("<user>", member.user)
      .replace("<reason>", reason)
      .replace("<duration>", "N/A")
      .replace("<punishment>", this.client.language.moderation.history.kicked)
      .replace("<staff>", message.author));

    this.client.utils.logs(this.client, message.guild, this.client.language.moderation.titles.kick, [{
      name: this.client.language.titles.logs.fields.user,
      desc: member.user
    },{
      name: this.client.language.titles.logs.fields.staff,
      desc: message.author
    },{
      name: this.client.language.titles.logs.fields.reason,
      desc: reason
    },{
      name: this.client.language.titles.logs.fields.duration,
      desc: "N/A"
    }], member.user, "KICK");
  }
  async slashRun(interaction, args) {
    let member = interaction.options.getUser("user");
    member = interaction.guild.members.cache.get(member.id);
    if (member.permissions.has("KICK_MEMBERS")) return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.cannot_staff, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.kick.ephemeral });

    if (interaction.user.id == member.id)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.cannot_self, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.kick.ephemeral });

    if (!member.kickable)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.higher_perm, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.kick.ephemeral });

    let reason = interaction.options.getStirng("reason");
    if (!reason) reason = this.client.language.moderation.no_reason;

    await member.kick(reason);

    let kickEmbed = this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.kick, this.client.language.moderation.kicked.replace("<user>", member)
      .replace("<staff>", interaction.user)
      .replace("<reason>", reason), this.client.embeds.success_color);

    interaction.reply({ embeds: [kickEmbed], ephemeral: this.client.cmdConfig.kick.ephemeral });

    this.client.utils.pushInf(interaction, member.id, this.client.language.moderation.history.format
      .replace("<date>", new Date().toLocaleString())
      .replace("<user>", member.user)
      .replace("<reason>", reason)
      .replace("<duration>", "N/A")
      .replace("<punishment>", this.client.language.moderation.history.kicked)
      .replace("<staff>", interaction.user));

    this.client.utils.logs(this.client, interaction.guild, this.client.language.moderation.titles.kick, [{
      name: this.client.language.titles.logs.fields.user,
      desc: member.user
    },{
      name: this.client.language.titles.logs.fields.staff,
      desc: interaction.user
    },{
      name: this.client.language.titles.logs.fields.reason,
      desc: reason
    },{
      name: this.client.language.titles.logs.fields.duration,
      desc: "Permanent"
    }], member.user, "KICK");
  }
};
