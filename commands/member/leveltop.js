const Command = require("../../structures/Command");
const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = class LevelTop extends Command {
  constructor(client) {
    super(client, {
      name: "leveltop",
      description: client.cmdConfig.leveltop.description,
      usage: client.cmdConfig.leveltop.usage,
      permissions: client.cmdConfig.leveltop.permissions,
      aliases: client.cmdConfig.leveltop.aliases,
      category: "member",
      listed: client.cmdConfig.leveltop.enabled,
      slash: true,
    });
  }

  async run(message, args) {
    let levelTop = (await db.all()).filter(i => i.id.startsWith(`level_${message.guild.id}_`));
    if(levelTop.length == 0) return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.lb_empty, this.client.embeds.error_color)] })
    levelTop = levelTop.sort((a, b) => b.value - a.value).map((x, i) => this.client.config.plugins.stats.leaderboard.format.replace("<rank>", i + 1)
      .replace("<user>", this.client.users.cache.get(x.id.split("_")[2]) || "N/A")
      .replace("<data>", x.value)
      .replace("<symbol>", this.client.config.plugins.stats.leaderboard.symbol.level));
      
    this.client.paginateContent(this.client, levelTop, 10, 1, message, this.client.language.titles.level_top, this.client.embeds.general_color);
  }
  async slashRun(interaction, args) {
    let levelTop = (await db.all()).filter(i => i.id.startsWith(`level_${interaction.guild.id}_`));
    if(levelTop.length == 0) return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.lb_empty, this.client.embeds.error_color)] })
    levelTop = levelTop.sort((a, b) => b.value - a.value).map((x, i) => this.client.config.plugins.stats.leaderboard.format.replace("<rank>", i + 1)
      .replace("<user>", this.client.users.cache.get(x.id.split("_")[2]) || "N/A")
      .replace("<data>", x.value)
      .replace("<symbol>", this.client.config.plugins.stats.leaderboard.symbol.level));
      
    this.client.paginateContent(this.client, levelTop, 10, 1, interaction, this.client.language.titles.level_top, this.client.embeds.general_color);
  }
};
