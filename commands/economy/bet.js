const Command = require("../../structures/Command");
const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = class Bet extends Command {
  constructor(client) {
    super(client, {
      name: "bet",
      description: client.cmdConfig.bet.description,
      usage: client.cmdConfig.bet.usage,
      permissions: client.cmdConfig.bet.permissions,
      aliases: client.cmdConfig.bet.aliases,
      category: "economy",
      listed: client.cmdConfig.bet.enabled,
      slash: true,
      options: [{
        name: "amount",
        description: "Amount of Money you want to bet",
        type: Discord.ApplicationCommandOptionType.String,
        required: true,
      }]
    });
  }

  async run(message, args) {
    const config = this.client.config;
    let cooldown = await db.get(`bet_${message.guild.id}_${message.author.id}`);
    let timeout = this.client.config.plugins.economy.bet.cooldown * 1000;

    if(cooldown != null && timeout - (Date.now() - cooldown) > 0) return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.economy.bet.cooldown, this.client.embeds.error_color)] });
  
    let money = args[0];
    if(!money || (isNaN(money) && money != "all")) return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.economy.invalid_amount, this.client.embeds.error_color)] });
    if(money < 100) return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.economy.bet.less, this.client.embeds.error_color)] });

    let balance = await db.get(`money_${message.guild.id}_${message.author.id}`);
          
    let chance = Math.floor(Math.random() * 100) + 1;
    if(money == "all") money = Number(balance);
    else money = Number(money);

    if(money > balance || args[0].includes("-")) return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.economy.invalid_amount, this.client.embeds.error_color)] });

    if (chance > 70) {
      message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.economy.bet.won.replace("<amount>", money), this.client.embeds.success_color)] });
      await db.add(`money_${message.guild.id}_${message.author.id}`, money);
    } else if(chance < 70) {
      message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.economy.bet.lost.replace("<amount>", money), this.client.embeds.error_color)] });
      await db.sub(`money_${message.guild.id}_${message.author.id}`, money);
    }
    await db.set(`bet_${message.guild.id}_${message.author.id}`, Date.now());
  }

  async slashRun(interaction, args) {
    const config = this.client.config;
    let cooldown = await db.get(`bet_${interaction.guild.id}_${interaction.user.id}`);
    let timeout = this.client.config.plugins.economy.bet.cooldown * 1000;

    if(cooldown != null && timeout - (Date.now() - cooldown) > 0) return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.economy.bet.cooldown, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.bet.ephemeral });
  
    let money = interaction.options.getString("amount");
    if(!money || (isNaN(money) && money != "all")) return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.economy.invalid_amount, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.bet.ephemeral });
    if(money < 100) return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.economy.bet.less, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.bet.ephemeral });
    
    let balance = await db.get(`money_${interaction.guild.id}_${interaction.user.id}`);
          
    let chance = Math.floor(Math.random() * 100) + 1;
    if(money == "all") money = Number(balance);
    else money = Number(money);
    
    if(money > balance || args[0].includes("-")) return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.economy.invalid_amount, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.bet.ephemeral });
    
    if (chance > 70) {
      interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.economy.bet.won.replace("<amount>", money), this.client.embeds.success_color)], ephemeral: this.client.cmdConfig.bet.ephemeral });
      await db.add(`money_${interaction.guild.id}_${interaction.user.id}`, money);
    } else if(chance < 70) {
      interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.economy.bet.lost.replace("<amount>", money), this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.bet.ephemeral });
      await db.sub(`money_${interaction.guild.id}_${interaction.user.id}`, money);
    }
    await db.set(`bet_${interaction.guild.id}_${interaction.user.id}`, Date.now());
  }
};
