const Command = require("../../structures/Command");
const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = class BalTop extends Command {
  constructor(client) {
    super(client, {
      name: "baltop",
      description: client.cmdConfig.baltop.description,
      usage: client.cmdConfig.baltop.usage,
      permissions: client.cmdConfig.baltop.permissions,
      aliases: client.cmdConfig.baltop.aliases,
      category: "economy",
      listed: client.cmdConfig.baltop.enabled,
      slash: true,
    });
  }

  async run(message, args) {
    let balTop = (await db.all()).filter(i => i.id.startsWith(`money_${message.guild.id}_`));
    if(balTop.length == 0) return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.lb_empty, this.client.embeds.error_color)] })
    balTop = balTop.sort((a, b) => b.value - a.value).map(async(x, i) => {
      let bank = await db.get(`bank_${message.guild.id}_${x.id.split("_")[2]}`) || 0;
      return this.client.config.plugins.stats.leaderboard.format.replace("<rank>", i + 1)
        .replace("<user>", this.client.users.cache.get(x.id.split("_")[2]) || "N/A")
        .replace("<symbol>", "")
        .replace("<data>", `${this.client.config.general.currency_symbol}` + Number(bank + x.value))
    });
      
    this.client.paginateContent(this.client, balTop, 10, 1, message, this.client.language.titles.balance_top, this.client.embeds.general_color);
  }
  async slashRun(interaction, args) {
    let balTop = (await db.all()).filter(i => i.id.startsWith(`money_${interaction.guild.id}_`));
    if(balTop.length == 0) return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.lb_empty, this.client.embeds.error_color)] })
    balTop = balTop.sort((a, b) => b.value - a.value).map(async(x, i) => {
      let bank = await db.get(`bank_${interaction.guild.id}_${x.id.split("_")[2]}`) || 0;
      return this.client.config.plugins.stats.leaderboard.format.replace("<rank>", i + 1)
      .replace("<user>", this.client.users.cache.get(x.id.split("_")[2]) || "N/A")
      .replace("<symbol>", "")
      .replace("<data>", `${this.client.config.general.currency_symbol}` + Number(bank + x.value))
    });
      
    this.client.paginateContent(this.client, balTop, 10, 1, interaction, this.client.language.titles.balance_top, this.client.embeds.general_color);
  }
};
