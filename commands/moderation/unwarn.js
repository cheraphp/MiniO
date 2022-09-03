const Command = require("../../structures/Command");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const Discord = require("discord.js");

module.exports = class UnWarn extends Command {
	constructor(client) {
		super(client, {
			name: "unwarn",
			description: client.cmdConfig.unwarn.description,
			usage: client.cmdConfig.unwarn.usage,
			permissions: client.cmdConfig.unwarn.permissions,
      aliases: client.cmdConfig.unwarn.aliases,
			category: "moderation",
			listed: client.cmdConfig.unwarn.enabled,
      slash: true,
      options: [{
        name: 'user',
        type: Discord.ApplicationCommandOptionType.User,
        description: 'User to UnWarn',
        required: true,
      }]
		});
	}
  
  async run(message, args) {
    let config = this.client.config;
    let member = message.mentions.members.first() || this.client.users.cache.get(args[0]);

    if(!member) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.unwarn.usage)] });

    let warns = await db.get(`warns_${message.guild.id}_${member.id}`);
    if(!warns || warns.length < 1) return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.moderation.no_warns, this.client.embeds.error_color)] });
    
    await db.sub(`warns_${message.guild.id}_${member.id}`, 1);

    message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.moderation.titles.unwarn, this.client.language.moderation.unwarned
      .replace("<warns>", Number(warns - 1))
      .replace("<user>", `<@${member.id}>`)
      .replace("<staff>", message.author), this.client.embeds.success_color)] });

    this.client.utils.logs(this.client, message.guild, this.client.language.moderation.titles.unwarn, [{
      name: this.client.language.titles.logs.fields.user,
      desc: member.user
    },{
      name: this.client.language.titles.logs.fields.staff,
      desc: message.author
    },
    {
      name: this.client.language.titles.logs.fields.warns,
      desc: `${Number(warns - 1)}`
    }], member.user, "UNWARN");
  }

  async slashRun(interaction, args) {
    let config = this.client.config;
    let member = interaction.options.getMember("user");
  
    let warns = await db.get(`warns_${interaction.guild.id}_${member.id}`);
    if(!warns || warns.length < 1) return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.moderation.no_warns, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.unwarn.ephemeral });
    
    await db.sub(`warns_${interaction.guild.id}_${member.id}`, 1);
    
    interaction.reply({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.moderation.titles.unwarn, this.client.language.moderation.unwarned
      .replace("<warns>", Number(warns - 1))
      .replace("<user>", `<@${member.id}>`)
      .replace("<staff>", message.author), this.client.embeds.success_color)], ephemeral: this.client.cmdConfig.unwarn.ephemeral });
    
    this.client.utils.logs(this.client, interaction.guild, this.client.language.moderation.titles.unwarn, [{
      name: this.client.language.titles.logs.fields.user,
      desc: member.user
    },{
      name: this.client.language.titles.logs.fields.staff,
      desc: interaction.user
    },
    {
      name: this.client.language.titles.logs.fields.warns,
      desc: `${Number(warns - 1)}`
    }], member.user, "UNWARN");
  }
};
