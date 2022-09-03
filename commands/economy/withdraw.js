const Command = require("../../structures/Command");
const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = class Balance extends Command {
  constructor(client) {
    super(client, {
      name: "withdraw",
      description: client.cmdConfig.withdraw.description,
      usage: client.cmdConfig.withdraw.usage,
      permissions: client.cmdConfig.withdraw.permissions,
      aliases: client.cmdConfig.withdraw.aliases,
      category: "economy",
      listed: client.cmdConfig.withdraw.enabled,
      slash: true,
      options: [{
        name: "amount",
        description: "Amount to withdraw from bank",
        type: Discord.ApplicationCommandOptionType.Number,
        required: true,
      }]
    });
  }

  async run(message, args) {
    const config = this.client.config;
    let amount = args[0];

    let bank = await db.get(`bank_${message.guild.id}_${message.author.id}`);

    if(!amount) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.withdraw.usage)] });
    if(isNaN(amount) || amount < 1 || amount > bank || `${amount}`.includes("-")) return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.economy.invalid_amount, this.client.embeds.error_color)] });

    await db.add(`money_${message.guild.id}_${message.author.id}`, amount);
    await db.sub(`bank_${message.guild.id}_${message.author.id}`, amount);

    message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.economy.title, this.client.language.economy.bank.withdrawed.replace("<bank>", Number(bank - amount)).replace("<amount>", amount), this.client.embeds.success_color)] });
  }
  async slashRun(interaction, args) {
    const config = this.client.config;
    let amount = interaction.options.getNumber("amount");

    let bank = await db.get(`bank_${interaction.guild.id}_${interaction.user.id}`);

    if(isNaN(amount) || amount < 1 || amount > bank || `${amount}`.includes("-")) return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.economy.invalid_amount, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.withdraw.ephemeral });
    
    await db.add(`money_${interaction.guild.id}_${interaction.user.id}`, amount);
    await db.sub(`bank_${interaction.guild.id}_${interaction.user.id}`, amount);
    
    interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.economy.title, this.client.language.economy.bank.withdrawed.replace("<bank>", Number(bank - amount)).replace("<amount>", amount), this.client.embeds.success_color)], ephemeral: this.client.cmdConfig.withdraw.ephemeral });
  }
};
