const Command = require("../../structures/Command");
const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = class Daily extends Command {
  constructor(client) {
    super(client, {
      name: "daily",
      description: client.cmdConfig.daily.description,
      usage: client.cmdConfig.daily.usage,
      permissions: client.cmdConfig.daily.permissions,
      aliases: client.cmdConfig.daily.aliases,
      category: "economy",
      listed: client.cmdConfig.daily.enabled,
      slash: true,
    });
  }

  async run(message, args) {
    const config = this.client.config;
    let cooldown = await db.get(`daily_${message.guild.id}_${message.author.id}`);
    let day = 86400000;

    if(cooldown != null && day - (Date.now() - cooldown) > 0) return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.economy.daily.already, this.client.embeds.error_color)] });
    let min = Math.ceil(config.plugins.economy.daily.min);
    let max = Math.floor(config.plugins.economy.daily.max);

    let amount = config.plugins.economy.daily.random == true ? Math.floor(Math.random() * (max - min + 1)) + min : config.plugins.economy.daily.amount;

    await db.add(`money_${message.guild.id}_${message.author.id}`, amount);
    message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.economy.title, this.client.language.economy.daily.claimed.replace("<user>", message.author).replace("<daily>", amount), this.client.embeds.success_color)] });
    await db.set(`daily_${message.guild.id}_${message.author.id}`, Date.now());
  }
  async slashRun(interaction, args) {
    const config = this.client.config;
    let cooldown = await db.get(`daily_${interaction.guild.id}_${interaction.user.id}`);
    let day = 86400000;
    
    if(cooldown != null && day - (Date.now() - cooldown) > 0) return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.economy.daily.already, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.daily.ephemeral });
    let min = Math.ceil(config.plugins.economy.daily.min);
    let max = Math.floor(config.plugins.economy.daily.max);
    
    let amount = config.plugins.economy.daily.random == true ? Math.floor(Math.random() * (max - min + 1)) + min : config.plugins.economy.daily.amount;
    
    await db.add(`money_${interaction.guild.id}_${interaction.user.id}`, amount);
    interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.economy.title, this.client.language.economy.daily.claimed.replace("<user>", interaction.user).replace("<daily>", amount), this.client.embeds.success_color)], ephemeral: this.client.cmdConfig.daily.ephemeral });
    await db.set(`daily_${interaction.guild.id}_${interaction.user.id}`, Date.now());
  }
};
