const Command = require("../../structures/Command");
const Discord = require('discord.js');
const ms = require('ms');
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = class GiveawayReroll extends Command {
  constructor(client) {
    super(client, {
      name: "greroll",
      description: client.cmdConfig.greroll.description,
      usage: client.cmdConfig.greroll.usage,
      permissions: client.cmdConfig.greroll.permissions,
      aliases: client.cmdConfig.greroll.aliases, 
      category: "giveaway",
      listed: client.cmdConfig.greroll.enabled,
      slash: true,
      options: [{
        name: 'msgid',
        type: Discord.ApplicationCommandOptionType.String,
        description: 'Message ID of Giveaway',
        required: true,
      }]
    });
  }

  async run(message, args) {
    let messageID = args[0];

    if (!messageID || isNaN(messageID)) return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, "Error", "You haven't entered Message ID.", this.client.embeds.error_color)] });

    let giveaways = await db.get(`giveaways_${message.guild.id}`);
    let gwData = giveaways.find(g => g.messageID == messageID && g.ended == true);

    if (!gwData) return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.language.titles.error, this.client.language.general.msgid, this.client.embeds.error_color)] });

    this.client.gw.rerollGiveaway(this.client, message, messageID);
  }
  async slashRun(interaction, args) {
    let messageID = parseInt(interaction.options.getString("msgid")) || 0;
    let giveaways = await db.get(`giveaways_${interaction.guild.id}`);
    let gwData = giveaways.find(g => g.messageID == messageID && g.ended == true);

    if (!gwData) return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.language.titles.error, this.client.language.general.msgid, this.client.embeds.error_color)] });

    this.client.gw.rerollGiveaway(this.client, interaction, messageID);
  }
};
