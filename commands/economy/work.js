const Command = require("../../structures/Command");
const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = class Work extends Command {
  constructor(client) {
    super(client, {
      name: "work",
      description: client.cmdConfig.work.description,
      usage: client.cmdConfig.work.usage,
      permissions: client.cmdConfig.work.permissions,
      aliases: client.cmdConfig.work.aliases,
      category: "economy",
      listed: client.cmdConfig.work.enabled,
      slash: true,
    });
  }

  async run(message, args) {
    const config = this.client.config;

    let rand = Math.floor(Math.random() * (config.plugins.economy.jobs.length - 1) + 1);

    let job = Object.keys(config.plugins.economy.jobs[rand])[0];
    let salary = Object.values(config.plugins.economy.jobs[rand])[0];

    await db.add(`money_${message.guild.id}_${message.author.id}`, salary);
    message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.economy.title, this.client.language.economy.worked.replace("<job>", job).replace("<salary>", salary), this.client.embeds.success_color)] });
  }
  async slashRun(interaction, args) {
    const config = this.client.config;

    let rand = Math.floor(Math.random() * (config.plugins.economy.jobs.length - 1) + 1);

    let job = Object.keys(config.plugins.economy.jobs[rand])[0];
    let salary = Object.values(config.plugins.economy.jobs[rand])[0];

    await db.add(`money_${interaction.guild.id}_${interaction.user.id}`, salary);
    interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.economy.title, this.client.language.economy.worked.replace("<job>", job).replace("<salary>", salary), this.client.embeds.success_color)], ephemeral: this.client.cmdConfig.work.ephemeral });
  }
};
