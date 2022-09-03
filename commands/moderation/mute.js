const Command = require("../../structures/Command");
const Discord = require("discord.js");
const ms = require("ms");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = class Mute extends Command {
	constructor(client) {
		super(client, {
			name: "mute",
			description: client.cmdConfig.mute.description,
			usage: client.cmdConfig.mute.usage,
			permissions: client.cmdConfig.mute.permissions,
			aliases: client.cmdConfig.mute.aliases, 
			category: "moderation",
			listed: client.cmdConfig.mute.enabled,
      slash: true,
      options: [{
        name: 'user',
        type: Discord.ApplicationCommandOptionType.User,
        description: 'User to Mute',
        required: true,
      },{
        name: 'duration',
        type: Discord.ApplicationCommandOptionType.String,
        description: 'Mute Duration',
        required: true,
      },{
        name: 'reason',
        type: Discord.ApplicationCommandOptionType.String,
        description: 'Mute Reason',
        required: false,
      }]
		});
	}

  async run(message, args) {
    let config = this.client.config;
    let member = message.mentions.members.first();
    if(!member) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.mute.usage)] });
    
    if (message.member === member)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.cannot_self, this.client.embeds.error_color)] });
    
    if (member.permissions.has("ManageMessages") && !message.member.permissions.has("Administrator")) 
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.higher_perm, this.client.embeds.error_color)] });
  
    let duration = args[1];
  
    if (!duration) return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.moderation.invalid_duration, this.client.embeds.error_color)] });
    let time = ms(duration);
    if (isNaN(time) || time == 0) return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.moderation.invalid_duration, this.client.embeds.error_color)] });
  
    let reason = args.slice(2).join(" ");
    if (!reason) return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.moderation.no_reason, this.client.embeds.error_color)] });
  
    if (reason.length > 100) return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.moderation.reason_long, this.client.embeds.error_color)] });
  
    if (member.isCommunicationDisabled()) return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.moderation.already_muted, this.client.embeds.error_color)] });
  
    await member.timeout(time, reason);
  
    let muteEmbed = this.client.embedBuilder(this.client, message.author, this.client.language.moderation.titles.mute, this.client.language.moderation.muted.replace("<user>", member)
      .replace("<staff>", message.author)
      .replace("<duration>", this.client.utils.formatTime(time))
      .replace("<reason>", reason), this.client.embeds.success_color);
    
    message.channel.send({ embeds: [muteEmbed] });

    this.client.utils.pushInf(message, member.id, this.client.language.moderation.history.format
      .replace("<date>", new Date().toLocaleString())
      .replace("<user>", member.user)
      .replace("<reason>", reason)
      .replace("<duration>", this.client.utils.formatTime(time))
      .replace("<punishment>", this.client.language.moderation.history.muted)
      .replace("<staff>", message.author));

    this.client.utils.logs(this.client, message.guild, this.client.language.moderation.titles.mute, [{
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
    }], member.user, "MUTE");
  }

  async slashRun(interaction, args) {
    let config = this.client.config;
    let member = interaction.options.getUser("user");
    member = interaction.guild.members.cache.get(member.id);

    if (interaction.member === member)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.cannot_self, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.mute.ephemeral });
  
    if (member.permissions.has("ManageMessages") && !interaction.member.permissions.has("Administrator")) 
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.higher_perm, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.mute.ephemeral });
  
    let duration = args[1];

    if (!duration) return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.moderation.invalid_duration, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.mute.ephemeral });
    let time = ms(duration);
    if (isNaN(time) || time == 0) return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.moderation.invalid_duration, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.mute.ephemeral });
  
    let reason = args.slice(2).join(" ");
    if (!reason) return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.moderation.no_reason, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.mute.ephemeral });
  
    if (reason.length > 100) return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.moderation.reason_long, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.mute.ephemeral });
  
    if (member.isCommunicationDisabled()) return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.moderation.already_muted, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.mute.ephemeral });
  
    await member.timeout(time, reason);

    let muteEmbed = this.client.embedBuilder(this.client, interaction.user, this.client.language.moderation.titles.mute, tthis.client.language.moderation.muted.replace("<user>", member)
      .replace("<staff>", interaction.user)
      .replace("<duration>", this.client.utils.formatTime(time))
      .replace("<reason>", reason), this.client.embeds.success_color);
    
    interaction.reply({ embeds: [muteEmbed], ephemeral: this.client.cmdConfig.mute.ephemeral });

    this.client.utils.pushInf(interaction, member.id, this.client.language.moderation.history.format
      .replace("<date>", new Date().toLocaleString())
      .replace("<user>", member.user)
      .replace("<reason>", reason)
      .replace("<duration>", this.client.utils.formatTime(time))
      .replace("<punishment>", this.client.language.moderation.history.muted)
      .replace("<staff>", interaction.user));

    this.client.utils.logs(this.client, interaction.guild, this.client.language.moderation.titles.mute, [{
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
    }], member.user, "MUTE");
  }
};
