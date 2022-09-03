const Command = require("../../structures/Command");
const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = class InvitesTop extends Command {
  constructor(client) {
    super(client, {
      name: "invitestop",
      description: client.cmdConfig.invitestop.description,
      usage: client.cmdConfig.invitestop.usage,
      permissions: client.cmdConfig.invitestop.permissions,
      aliases: client.cmdConfig.invitestop.aliases,
      category: "member",
      listed: client.cmdConfig.invitestop.enabled,
      slash: true,
    });
  }

  async run(message, args) {
    let invitesTop = (await db.all()).filter(i => i.id.startsWith(`invitesRegular_${message.guild.id}_`));
    if(invitesTop.length == 0) return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.lb_empty, this.client.embeds.error_color)] })
    invitesTop = invitesTop.sort((a, b) => b.value - a.value).map((x, i) => this.client.config.plugins.stats.leaderboard.format.replace("<rank>", i + 1)
      .replace("<user>", this.client.users.cache.get(x.id.split("_")[2]) || "N/A")
      .replace("<data>", x.value)
      .replace("<symbol>", this.client.config.plugins.stats.leaderboard.symbol.invites));
      
    this.client.paginateContent(this.client, invitesTop, 10, 1, message, this.client.language.titles.invites_top, this.client.embeds.general_color);
  }
  async slashRun(interaction, args) {
    let invitesTop = (await db.all()).filter(i => i.id.startsWith(`invitesRegular_${interaction.guild.id}_`));
    if(invitesTop.length == 0) return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.lb_empty, this.client.embeds.error_color)] })
    invitesTop = invitesTop.sort((a, b) => b.value - a.value).map((x, i) => this.client.config.plugins.stats.leaderboard.format.replace("<rank>", i + 1)
      .replace("<user>", this.client.users.cache.get(x.id.split("_")[2]) || "N/A")
      .replace("<data>", x.value)
      .replace("<symbol>", this.client.config.plugins.stats.leaderboard.symbol.invites));
      
    this.client.paginateContent(this.client, invitesTop, 10, 1, interaction, this.client.language.titles.invites_top, this.client.embeds.general_color);
  }
};
