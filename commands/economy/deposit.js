const Command = require("../../structures/Command");
const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = class Balance extends Command {
  constructor(client) {
    super(client, {
      name: "deposit",
      description: client.cmdConfig.deposit.description,
      usage: client.cmdConfig.deposit.usage,
      permissions: client.cmdConfig.deposit.permissions,
      aliases: client.cmdConfig.deposit.aliases,
      category: "economy",
      listed: client.cmdConfig.deposit.enabled,
      slash: true,
      options: [{
        name: "amount",
        description: "Amount to deposit into bank",
        type: Discord.ApplicationCommandOptionType.Number,
        required: true,
      }]
    });
  }

  async run(message, args) {
    const config = this.client.config;
    let amount = args[0];

    let balance = await db.get(`money_${message.guild.id}_${message.author.id}`);

    if(!amount) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.deposit.usage)] });
    if(isNaN(amount) || amount < 1 || amount > balance || `${amount}`.includes("-")) return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.economy.invalid_amount, this.client.embeds.error_color)] });

    await db.add(`bank_${message.guild.id}_${message.author.id}`, amount);
    await db.sub(`money_${message.guild.id}_${message.author.id}`, amount);
    let bank = await db.get(`bank_${message.guild.id}_${message.author.id}`);

    message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.economy.title, this.client.language.economy.bank.deposited.replace("<bank>", bank).replace("<amount>", amount), this.client.embeds.success_color)] });
  }
  async slashRun(interaction, args) {
    const config = this.client.config;
    let amount = interaction.options.getNumber("amount");

    let balance = await db.get(`money_${interaction.guild.id}_${interaction.user.id}`);

    if(isNaN(amount) || amount < 1 || amount > balance || `${amount}`.includes("-")) return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.economy.invalid_amount, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.deposit.ephemeral });
    
    await db.add(`bank_${interaction.guild.id}_${interaction.user.id}`, amount);
    await db.sub(`money_${interaction.guild.id}_${interaction.user.id}`, amount);
    let bank = await db.get(`bank_${interaction.guild.id}_${interaction.user.id}`);
    
    interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.economy.title, this.client.language.economy.bank.deposited.replace("<bank>", bank).replace("<amount>", amount), this.client.embeds.success_color)], ephemeral: this.client.cmdConfig.deposit.ephemeral });
  }
};
