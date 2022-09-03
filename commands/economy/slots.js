const Command = require("../../structures/Command");
const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

const slotItems = [
  "🍇",
  "🍉",
  "🍊",
  "🍎",
  "🍍",
  "🍓",
  "🍒",
  "🥝",
  "🍋",
];

module.exports = class Slots extends Command {
  constructor(client) {
    super(client, {
      name: "slots",
      description: client.cmdConfig.slots.description,
      usage: client.cmdConfig.slots.usage,
      permissions: client.cmdConfig.slots.permissions,
      aliases: client.cmdConfig.slots.aliases,
      category: "economy",
      listed: client.cmdConfig.slots.enabled,
      slash: true,
      options: [{
        name: "amount",
        description: "Amount you want to bet",
        type: Discord.ApplicationCommandOptionType.String,
        required: true,
      }]
    });
  }

  async run(message, args) {
    const config = this.client.config;
    let money = args[0];
    
    const balance = await db.get(`money_${message.guild.id}_${message.author.id}`);
    
    if(!money || (isNaN(money) && money != "all")) return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.economy.invalid_amount, this.client.embeds.error_color)] });

    if(money == "all") money = Number(balance);
    else money = Number(money);

    if(money > balance || args[0].includes("-")) return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.economy.invalid_amount, this.client.embeds.error_color)] });
    if(money < 100) return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.economy.bet.less, this.client.embeds.error_color)] });
    
    let hasWon = false;
    let number = [];
    for (let i = 0; i < 3; i++) {
      number[i] = Math.floor(Math.random() * slotItems.length);
    }
  
    if (number[0] == number[1] && number[1] == number[2]) {
      money *= 9;
      hasWon = true;
    } else if (number[0] == number[1] || number[0] == number[2] || number[1] == number[2]) {
      money *= 2;
      hasWon = true;
    }

    const columns = [
      this.client.language.economy.slots_row.replace("<firstItem>", slotItems[Math.floor(Math.random() * slotItems.length)])
        .replace("<secondItem>", slotItems[Math.floor(Math.random() * slotItems.length)])
        .replace("<thirdItem>", slotItems[Math.floor(Math.random() * slotItems.length)]),
      this.client.language.economy.slots_win_row.replace("<firstItem>", slotItems[number[0]])
        .replace("<secondItem>", slotItems[number[1]])
        .replace("<thirdItem>", slotItems[number[2]]),
      this.client.language.economy.slots_row.replace("<firstItem>", slotItems[Math.floor(Math.random() * slotItems.length)])
        .replace("<secondItem>", slotItems[Math.floor(Math.random() * slotItems.length)])
        .replace("<thirdItem>", slotItems[Math.floor(Math.random() * slotItems.length)])
    ];

    if(hasWon == true) {
      message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.economy.title, this.client.language.economy.slots_won.replace("<amount>", money).replace("<columns>", columns.join("\n")), this.client.embeds.success_color)] });
      db.add(`money_${message.guild.id}_${message.author.id}`, money);
    } else {
      message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.economy.title, this.client.language.economy.slots_lost.replace("<amount>", money).replace("<columns>", columns.join("\n")), this.client.embeds.error_color)] });
      db.sub(`money_${message.guild.id}_${message.author.id}`, money);
    }
  }

  async slashRun(interaction, args) {
    const config = this.client.config;
    let money = interaction.options.getString("amount");
    
    const balance = await db.get(`money_${interaction.guild.id}_${interaction.user.id}`);
    
    if(!money || (isNaN(money) && money != "all")) return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.economy.invalid_amount, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.slots.ephemeral });

    if(money == "all") money = Number(balance);
    else money = Number(money);

    if(money > balance || args[0].includes("-")) return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.economy.invalid_amount, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.slots.ephemeral });
    if(money < 100) return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.economy.bet.less, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.bet.ephemeral });
    
    let hasWon = false;
    let number = [];
    for (let i = 0; i < 3; i++) {
      number[i] = Math.floor(Math.random() * slotItems.length);
    }
  
    if (number[0] == number[1] && number[1] == number[2]) {
      money *= 9;
      hasWon = true;
    } else if (number[0] == number[1] || number[0] == number[2] || number[1] == number[2]) {
      money *= 2;
      hasWon = true;
    }

    const columns = [
      this.client.language.economy.slots_row.replace("<firstItem>", slotItems[Math.floor(Math.random() * slotItems.length)])
        .replace("<secondItem>", slotItems[Math.floor(Math.random() * slotItems.length)])
        .replace("<thirdItem>", slotItems[Math.floor(Math.random() * slotItems.length)]),
      this.client.language.economy.slots_win_row.replace("<firstItem>", slotItems[number[0]])
        .replace("<secondItem>", slotItems[number[1]])
        .replace("<thirdItem>", slotItems[number[2]]),
      this.client.language.economy.slots_row.replace("<firstItem>", slotItems[Math.floor(Math.random() * slotItems.length)])
        .replace("<secondItem>", slotItems[Math.floor(Math.random() * slotItems.length)])
        .replace("<thirdItem>", slotItems[Math.floor(Math.random() * slotItems.length)])
    ];

    if(hasWon == true) {
      interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.economy.title, this.client.language.economy.slots_won.replace("<amount>", money).replace("<columns>", columns.join("\n")), this.client.embeds.success_color)], ephemeral: this.client.cmdConfig.slots.ephemeral });
      db.add(`money_${interaction.guild.id}_${interaction.user.id}`, money);
    } else {
      interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.economy.title, this.client.language.economy.slots_lost.replace("<amount>", money).replace("<columns>", columns.join("\n")), this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.slots.ephemeral });
      db.sub(`money_${interaction.guild.id}_${interaction.user.id}`, money);
    }
  }
};
