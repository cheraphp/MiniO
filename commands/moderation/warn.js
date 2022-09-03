const Command = require("../../structures/Command");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const Discord = require("discord.js");

module.exports = class Warn extends Command {
	constructor(client) {
		super(client, {
			name: "warn",
			description: client.cmdConfig.warn.description,
			usage: client.cmdConfig.warn.usage,
			permissions: client.cmdConfig.warn.permissions,
      aliases: client.cmdConfig.warn.aliases,
			category: "moderation",
			listed: client.cmdConfig.warn.enabled,
      slash: true,
      options: [{
        name: 'user',
        type: Discord.ApplicationCommandOptionType.User,
        description: 'User to Warn',
        required: true,
      },{
        name: 'reason',
        type: Discord.ApplicationCommandOptionType.String,
        description: 'Warn Reason',
        required: false,
      }]
		});
	}
  
  async run(message, args) {
    let member = message.mentions.members.first();
    if(!member) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.warn.usage)] });
    let reason = args.slice(1).join(" ");
    
    if ((member.permissions.has("KICK_MEMBERS") || member.permissions.has("ManageMessages")) && !message.member.permissions.has("Administrator")) 
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, `That Member have same or higher permissions than me.`, this.client.embeds.error_color)] });
  
    if (message.author.id == member.id)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, `You cannot warn yourself.`, this.client.embeds.error_color)] });
  
    if(!reason) reason = this.client.language.moderation.no_reason
  
    let warns = await db.get(`warns_${message.guild.id}_${member.id}`);

    await db.add(`warns_${message.guild.id}_${member.id}`, 1);
  
    let warnEmbed = this.client.embedBuilder(this.client, message.author, this.client.language.moderation.titles.warn, this.client.language.moderation.warned.replace("<user>", member)
      .replace("<staff>", message.author)
      .replace("<warns>", Number(warns + 1))
      .replace("<reason>", reason), this.client.embeds.success_color);
  
    message.channel.send({ embeds: [warnEmbed] });

    this.client.utils.pushInf(message, member.id, this.client.language.moderation.history.format
      .replace("<date>", new Date().toLocaleString())
      .replace("<user>", member.user)
      .replace("<reason>", reason)
      .replace("<duration>", "N/A")
      .replace("<punishment>", this.client.language.moderation.history.warned)
      .replace("<staff>", message.author));

    this.client.utils.logs(this.client, message.guild, this.client.language.moderation.titles.warn, [{
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
      desc: "Permanent"
    },{
      name: this.client.language.titles.logs.fields.warns,
      desc: `${Number(warns + 1)}`
    }], member.user, "WARN");
  } 
  async slashRun(interaction, args) {
    let member = interaction.options.getMember("user");
    let reason = interaction.options.getString("reason");
    
    if ((member.permissions.has("KICK_MEMBERS") || member.permissions.has("ManageMessages")) && !interaction.member.permissions.has("Administrator")) 
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, `That Member have same or higher permissions than me.`, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.warn.ephemeral });
  
    if (interaction.user.id == member.id)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, `You cannot warn yourself.`, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.warn.ephemeral });

    if(!reason) reason = this.client.language.moderation.no_reason

    let warns = await db.get(`warns_${interaction.guild.id}_${member.id}`);
  
    await db.add(`warns_${interaction.guild.id}_${member.id}`, 1);

    let warnEmbed = this.client.embedBuilder(this.client, interaction.user, this.client.language.moderation.titles.warn, this.client.language.moderation.warned.replace("<user>", member)
      .replace("<staff>", interaction.user)
      .replace("<warns>", Number(warns + 1))
      .replace("<reason>", reason), this.client.embeds.success_color);

    interaction.reply({ embeds: [warnEmbed], ephemeral: this.client.cmdConfig.warn.ephemeral });

    this.client.utils.pushInf(interaction, member.id, this.client.language.moderation.history.format
      .replace("<date>", new Date().toLocaleString())
      .replace("<user>", member.user)
      .replace("<reason>", reason)
      .replace("<duration>", "N/A")
      .replace("<punishment>", this.client.language.moderation.history.warned)
      .replace("<staff>", interaction.user));

    this.client.utils.logs(this.client, interaction.guild, this.client.language.moderation.titles.warn, [{
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
    },{
      name: this.client.language.titles.logs.fields.warns,
      desc: `${Number(warns + 1)}`
    }], member.user, "WARN");
  }
};
