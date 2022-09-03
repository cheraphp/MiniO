const Command = require("../../structures/Command");
const Discord = require('discord.js');
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = class GiveawayEdit extends Command {
  constructor(client) {
    super(client, {
      name: "gend",
      description: client.cmdConfig.gend.description,
      usage: client.cmdConfig.gend.usage,
      permissions: client.cmdConfig.gend.permissions,
      aliases: client.cmdConfig.gend.aliases,
      category: "giveaway",
      listed: client.cmdConfig.gend.enabled,
      slash: true,
      options: [{
        name: 'msgid',
        type: Discord.ApplicationCommandOptionType.String,
        description: 'Message ID of Giveaway',
        required: true,
      }],
    });
  }

  async run(message, args) {
    let messageID = args[0];

    if (!messageID || isNaN(messageID)) return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.language.titles.error, this.client.language.general.msgid, this.client.embeds.error_color)] });

    let giveaways = await db.get(`giveaways_${message.guild.id}`);
    let gwData = giveaways.find(g => g.messageID == messageID && g.ended == false);

    if (!gwData) return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.language.titles.error, this.client.language.general.msgid, this.client.embeds.error_color)] });

    this.client.gw.endGiveaway(this.client, message, messageID, message.guild);
    message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.giveaway.titles.giveaway, this.client.language.giveaway.ended, this.client.embeds.success_color)] });
  }
  async slashRun(interaction, args) {
    let messageID = parseInt(interaction.options.getString("msgid")) || 0;

    let giveaways = await db.get(`giveaways_${interaction.guild.id}`);
    let gwData = giveaways.find(g => g.messageID == messageID && g.ended == false);

    if (!gwData) return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.language.titles.error, this.client.language.general.msgid, this.client.embeds.error_color)] });

    this.client.gw.endGiveaway(this.client, interaction, messageID, interaction.guild);
    interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.giveaway.titles.giveaway, this.client.language.giveaway.ended, this.client.embeds.success_color)] });
  }
};
