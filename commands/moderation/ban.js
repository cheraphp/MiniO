const Command = require("../../structures/Command");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const Discord = require("discord.js")

module.exports = class Ban extends Command {
	constructor(client) {
		super(client, {
			name: "ban",
			description: client.cmdConfig.ban.description,
			usage: client.cmdConfig.ban.usage,
			permissions: client.cmdConfig.ban.permissions,
			aliases: client.cmdConfig.ban.aliases,
			category: "moderation",
			listed: client.cmdConfig.ban.enabled,
      slash: true,
      options: [{
        name: 'user',
        type: Discord.ApplicationCommandOptionType.User,
        description: 'User to Ban',
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
    let member = message.mentions.members.first();
    if(!member) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.ban.usage)] });
    if (member.permissions.has("ManageMessages") && !message.member.permissions.has("Administrator")) 
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.cannot_staff, this.client.embeds.error_color)] });
  
    if (message.author.id == member.id)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.cannot_self, this.client.embeds.error_color)] });
  
    if (!member.bannable)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.higher_perm, this.client.embeds.error_color)] });
    let reason = args.slice(1).join(" ");
    if (!reason) reason = this.client.language.moderation.no_reason;
  
    message.guild.members.ban(member, { reason: reason });
  
    let banEmbed = this.client.embedBuilder(this.client, message.author, this.client.language.moderation.titles.ban, this.client.language.moderation.banned.replace("<user>", member)
      .replace("<staff>", message.author)
      .replace("<reason>", reason), this.client.embeds.success_color);
  
    message.channel.send({ embeds: [banEmbed] });

    this.client.utils.pushInf(message, member.id, this.client.language.moderation.history.format
      .replace("<date>", new Date().toLocaleString())
      .replace("<user>", member.user)
      .replace("<reason>", reason)
      .replace("<duration>", "N/A")
      .replace("<punishment>", this.client.language.moderation.history.banned)
      .replace("<staff>", message.author));

    this.client.utils.logs(this.client, message.guild, this.client.language.moderation.titles.ban, [{
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
    }], member.user, "BAN");
  }

  async slashRun(interaction, args) {
    let member = interaction.options.getUser("user");
    member = interaction.guild.members.cache.get(member.id);
    if (member.permissions.has("ManageMessages") && !interaction.member.permissions.has("Administrator")) 
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.cannot_staff, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.ban.ephemeral });

    if (interaction.user.id == member.id)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.cannot_self, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.ban.ephemeral });

    if (!member.bannable) return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.higher_perm, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.ban.ephemeral });
    let reason = interaction.options.getString("reason");
    if (!reason) reason = this.client.language.moderation.no_reason;
  
    interaction.guild.members.ban(member, { reason: reason });
  
    let banEmbed = this.client.embedBuilder(this.client, interaction.user, this.client.language.moderation.titles.ban, this.client.language.moderation.banned.replace("<user>", member)
      .replace("<staff>", interaction.user)
      .replace("<reason>", reason), this.client.embeds.success_color);

    interaction.reply({ embeds: [banEmbed], ephemeral: this.client.cmdConfig.ban.ephemeral });
  
    this.client.utils.pushInf(interaction, member.id, this.client.language.moderation.history.format
      .replace("<date>", new Date().toLocaleString())
      .replace("<user>", member.user)
      .replace("<reason>", reason)
      .replace("<duration>", "N/A")
      .replace("<punishment>", this.client.language.moderation.history.banned)
      .replace("<staff>", interaction.user));

    this.client.utils.logs(this.client, interaction.guild, this.client.language.moderation.titles.ban, [{
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
    }], member.user, "BAN");
  }
};
