const Command = require("../../structures/Command");
const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = class Balance extends Command {
  constructor(client) {
    super(client, {
      name: "pay",
      description: client.cmdConfig.pay.description,
      usage: client.cmdConfig.pay.usage,
      permissions: client.cmdConfig.pay.permissions,
      aliases: client.cmdConfig.pay.aliases,
      category: "economy",
      listed: client.cmdConfig.pay.enabled,
      slash: true,
      options: [{
        name: "user",
        description: "User to which to send money.",
        type: Discord.ApplicationCommandOptionType.User,
        required: true,
      }, {
        name: "amount",
        description: "Amount to send",
        type: Discord.ApplicationCommandOptionType.Number,
        required: true,
      }]
    });
  }

  async run(message, args) {
    const config = this.client.config;
    let user = message.mentions.users.first() || this.client.users.cache.get(args[0]);
    let amount = args[1];
    let balance = await db.get(`money_${message.guild.id}_${message.author.id}`);

    if(!user || !amount) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.pay.usage)] });
    if(isNaN(amount) || amount < 1 || amount > balance || `${amount}`.includes("-")) return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.economy.invalid_amount, this.client.embeds.error_color)] });
    if(user.id == message.author.id) return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.cannot_self, this.client.embeds.error_color)] });
    if(user.bot) return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.cannot_bot, this.client.embeds.error_color)] });
    if(balance < amount) return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.economy.no_enough, this.client.embeds.error_color)] });

    await db.add(`money_${message.guild.id}_${user.id}`, amount);
    await db.sub(`money_${message.guild.id}_${message.author.id}`, amount);
    message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.economy.title, this.client.language.economy.payed.replace("<user>", user).replace("<amount>", amount), this.client.embeds.success_color)] });
  }
  async slashRun(interaction, args) {
    const config = this.client.config;
    let user = interaction.options.getUser("user") || interaction.user;
    let amount = interaction.options.getNumber("amount");

    let balance = await db.get(`money_${interaction.guild.id}_${interaction.user.id}`);
    
    if(!user || !amount) return interaction.reply({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.pay.usage)] });
    if(isNaN(amount) || amount < 1 || amount > balance || `${amount}`.includes("-")) return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.economy.invalid_amount, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.pay.ephemeral });
    if(user.id == interaction.user.id) return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.cannot_self, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.pay.ephemeral });
    if(user.bot) return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.cannot_bot, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.pay.ephemeral });
    if(balance < amount) return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.economy.no_enough, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.pay.ephemeral });
    
    await db.add(`money_${interaction.guild.id}_${user.id}`, amount);
    await db.sub(`money_${interaction.guild.id}_${interaction.user.id}`, amount);
    interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.economy.title, this.client.language.economy.payed.replace("<user>", user).replace("<amount>", amount), this.client.embeds.success_color)], ephemeral: this.client.cmdConfig.pay.ephemeral });
  }
};
