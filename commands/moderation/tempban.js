const Command = require("../../structures/Command");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const ms = require("ms");
const Discord = require("discord.js");

module.exports = class Ban extends Command {
	constructor(client) {
		super(client, {
			name: "tempban",
			description: client.cmdConfig.tempban.description,
			usage: client.cmdConfig.tempban.usage,
			permissions: client.cmdConfig.tempban.permissions,
      aliases: client.cmdConfig.tempban.aliases,
			category: "moderation",
			listed: client.cmdConfig.tempban.enabled,
      slash: true,
      options: [{
        name: 'user',
        type: Discord.ApplicationCommandOptionType.User,
        description: 'User to Ban',
        required: true,
      },{
        name: 'duration',
        type: Discord.ApplicationCommandOptionType.String,
        description: 'Duration of Ban',
        required: true,
      },{
        name: 'reason',
        type: Discord.ApplicationCommandOptionType.String,
        description: 'Ban Reason',
        required: false,
      }]
		});
	}

  async run(message, args) {
    let config = this.client.config;
    let member = message.mentions.members.first();
    if(!member) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.tempban.usage)] });
    if (member.permissions.has("ManageMessages") && !message.member.permissions.has("Administrator")) 
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.cannot_staff, this.client.embeds.error_color)] });
    
    if (message.author.id == member.id)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.cannot_self, this.client.embeds.error_color)] });
  
    if (!member.bannable) return message.channel.sendmessage.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.higher_perm, this.client.embeds.error_color)] });
    let time = args[1];
    let reason = args.slice(2).join(" ");
    if (!reason) reason = this.client.language.moderation.no_reason;
  
    await db.set(`tempban_${message.guild.id}_${member.id}`, {
      endsAt: Date.now() + ms(time)
    });
  
    setTimeout(() => message.guild.bans.remove(member), ms(time));
  
    let tempEmbed = this.client.embedBuilder(this.client, message.author, this.client.language.moderation.titles.tempban, this.client.language.moderation.tempban.replace("<user>", member)
      .replace("<staff>", message.author)
      .replace("<duration>", this.client.utils.formatTime(ms(time)))
      .replace("<reason>", reason), this.client.embeds.success_color);

    message.channel.send({ embeds: [tempEmbed] });

    this.client.utils.pushInf(message, member.id, this.client.language.moderation.history.format
      .replace("<date>", new Date().toLocaleString())
      .replace("<user>", member.user)
      .replace("<reason>", reason)
      .replace("<duration>", this.client.utils.formatTime(ms(time)))
      .replace("<punishment>", this.client.language.moderation.history.temp + " " + this.client.language.moderation.history.banned)
      .replace("<staff>", message.author));

    this.client.utils.logs(this.client, message.guild, this.client.language.moderation.titles.tempban, [{
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
      desc: time
    }], member.user, "TEMP_BAN");
  }

  async slashRun(interaction, args) {
    let config = this.client.config;
    let member = interaction.options.getUser("user");
    member = interaction.guild.members.cache.get(member.id);
    if (member.permissions.has("ManageMessages") && !interaction.member.permissions.has("Administrator")) 
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.cannot_staff, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.tempban.ephemeral });
    
    if (interaction.user.id == member.id)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.cannot_self, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.tempban.ephemeral });

    if (!member.bannable) return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.higher_perm, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.tempban.ephemeral });
    let reason = interaction.options.getString("reason");
    if (!reason) reason = this.client.language.moderation.no_reason;

    let time = interaction.options.getString("duration");

    await db.set(`tempban_${interaction.guild.id}_${member.id}`, {
      endsAt: Date.now() + ms(time)
    });

    member.ban(reason);

    setTimeout(() => message.guild.bans.remove(member), ms(time));

    let tempEmbed = this.client.embedBuilder(this.client, interaction.user, this.client.language.moderation.titles.tempban, this.client.language.moderation.tempban.replace("<user>", member)
      .replace("<staff>", interaction.user)
      .replace("<duration>", this.client.utils.formatTime(ms(time)))
      .replace("<reason>", reason), this.client.embeds.success_color);

    interaction.reply({ embeds: [tempEmbed], ephemeral: this.client.cmdConfig.tempban.ephemeral });

    this.client.utils.pushInf(interaction, member.id, this.client.language.moderation.history.format
      .replace("<date>", new Date().toLocaleString())
      .replace("<user>", member.user)
      .replace("<reason>", reason)
      .replace("<duration>", this.client.utils.formatTime(ms(time)))
      .replace("<punishment>", this.client.language.moderation.history.temp + " " + this.client.language.moderation.history.banned)
      .replace("<staff>", interaction.user));

    this.client.utils.logs(this.client, interaction.guild, this.client.language.moderation.titles.tempban, [{
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
      desc: time
    }], member.user, "TEMP_BAN");
  }
};
