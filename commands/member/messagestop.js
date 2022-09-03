const Command = require("../../structures/Command");
const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = class MessagesTop extends Command {
  constructor(client) {
    super(client, {
      name: "messagestop",
      description: client.cmdConfig.messagestop.description,
      usage: client.cmdConfig.messagestop.usage,
      permissions: client.cmdConfig.messagestop.permissions,
      aliases: client.cmdConfig.messagestop.aliases,
      category: "member",
      listed: client.cmdConfig.messagestop.enabled,
      slash: true,
    });
  }

  async run(message, args) {
    let messagesTop = (await db.all()).filter(i => i.id.startsWith(`messages_${message.guild.id}_`));
    if(messagesTop.length == 0) return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.lb_empty, this.client.embeds.error_color)] })
    messagesTop = messagesTop.sort((a, b) => b.value - a.value).map((x, i) => this.client.config.plugins.stats.leaderboard.format.replace("<rank>", i + 1)
      .replace("<user>", this.client.users.cache.get(x.id.split("_")[2]) || "N/A")
      .replace("<data>", x.value)
      .replace("<symbol>", this.client.config.plugins.stats.leaderboard.symbol.messages));
      
    this.client.paginateContent(this.client, messagesTop, 10, 1, message, this.client.language.titles.messages_top, this.client.embeds.general_color);
  }
  async slashRun(interaction, args) {
    let messagesTop = (await db.all()).filter(i => i.id.startsWith(`messages_${interaction.guild.id}_`));
    if(messagesTop.length == 0) return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.lb_empty, this.client.embeds.error_color)] })
    messagesTop = messagesTop.sort((a, b) => b.value - a.value).map((x, i) => this.client.config.plugins.stats.leaderboard.format.replace("<rank>", i + 1)
      .replace("<user>", this.client.users.cache.get(x.id.split("_")[2]) || "N/A")
      .replace("<data>", x.value)
      .replace("<symbol>", this.client.config.plugins.stats.leaderboard.symbol.messages));
      
    this.client.paginateContent(this.client, messagesTop, 10, 1, interaction, this.client.language.titles.messages_top, this.client.embeds.general_color);
  }
};
