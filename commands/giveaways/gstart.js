const Command = require("../../structures/Command");
const Discord = require('discord.js');
const ms = require('ms');
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = class GiveawayStart extends Command {
	constructor(client) {
		super(client, {
			name: "gstart",
			description: client.cmdConfig.gstart.description,
			usage: client.cmdConfig.gstart.usage,
			permissions: client.cmdConfig.gstart.permissions,
			aliases: client.cmdConfig.gstart.aliases,
			category: "giveaway",
			listed: client.cmdConfig.gstart.enabled,
      slash: true,
      options: [{
        name: 'duration',
        type: Discord.ApplicationCommandOptionType.String,
        description: 'Duration of Giveaway',
        required: true,
      },{
        name: 'channel',
        type: Discord.ApplicationCommandOptionType.Channel,
        channelTypes: [Discord.ChannelType.GuildText],
        description: 'Channel in which to Start Giveaway',
        required: true,
      },{
        name: 'winners',
        type: Discord.ApplicationCommandOptionType.Number,
        description: 'Number of Winners',
        required: true,
      },{
        name: 'messages',
        type: Discord.ApplicationCommandOptionType.Number,
        description: 'Number of Messages Required to enter Giveaway',
        required: true,
      },{
        name: 'invites',
        type: Discord.ApplicationCommandOptionType.Number,
        description: 'Number of Invites Required to enter Giveaway',
        required: true,
      },{
        name: 'prize',
        type: Discord.ApplicationCommandOptionType.String,
        description: 'Prize for Giveaway',
        required: true,
      }]
		});
	}
    
  async run(message, args) {
    let durationArg = args[0];
    let channelArg = message.mentions.channels.first();
    let winnersArg = parseInt(args[2]);
    let messagesArg = args[3];
    let invitesArg = args[4];
    let prizeArg = args.slice(5).join(" ");
    
    if(!durationArg || isNaN(ms(durationArg))) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.gstart.usage)] });
    if(!channelArg) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.gstart.usage)] });
    if(!winnersArg || isNaN(winnersArg) || winnersArg <= 0) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.gstart.usage)] });
    if(winnersArg > 20) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.gstart.usage)] });
    if(!messagesArg || isNaN(messagesArg) || messagesArg < 0) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.gstart.usage)] });
    if(!invitesArg || isNaN(invitesArg) || invitesArg < 0) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.gstart.usage)] });
    if(!prizeArg || prizeArg.length >= 32) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.gstart.usage)] });

    let giveawayObject = this.client.utils.giveawayObject(
      message.guild.id, 
      0, 
      ms(durationArg), 
      channelArg.id, 
      winnersArg, 
      parseInt(messagesArg), 
      parseInt(invitesArg), 
      (Date.now() + ms(durationArg)), 
      message.author.id,
      prizeArg,
    );
    this.client.gw.startGiveaway(this.client, message, giveawayObject);
    
    message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.giveaway.titles.giveaway, this.client.language.giveaway.create.done.replace("<channel>", channelArg), this.client.embeds.success_color)] });
  }
  async slashRun(interaction, args) {
    let durationArg = interaction.options.getString("duration");
    let channelArg = interaction.options.getChannel("channel");
    let winnersArg = interaction.options.getNumber("winners");
    let messagesArg = interaction.options.getNumber("messages");
    let invitesArg = interaction.options.getNumber("invites");
    let prizeArg = interaction.options.getString("prize");

    let giveawayObject = this.client.utils.giveawayObject(
      interaction.guild.id, 
      0, 
      ms(durationArg), 
      channelArg.id, 
      winnersArg, 
      parseInt(messagesArg), 
      parseInt(invitesArg), 
      (Date.now() + ms(durationArg)), 
      interaction.user.id,
      prizeArg,
    );
    this.client.gw.startGiveaway(this.client, interaction, giveawayObject);
    
    interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.giveaway.titles.giveaway, this.client.language.giveaway.create.done.replace("<channel>", channelArg), this.client.embeds.success_color)] });
  }
};
