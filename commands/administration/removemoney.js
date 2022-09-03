const Command = require("../../structures/Command");
const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = class RemoveMoney extends Command {
  constructor(client) {
    super(client, {
      name: "removemoney",
      description: client.cmdConfig.removemoney.description,
      usage: client.cmdConfig.removemoney.usage,
      permissions: client.cmdConfig.removemoney.permissions,
      aliases: client.cmdConfig.removemoney.aliases,
      category: "administration",
      listed: client.cmdConfig.removemoney.enabled,
      slash: true,
      options: [{
        name: "user",
        description: "User from which to remove money",
        type: Discord.ApplicationCommandOptionType.User,
        required: true,
      }, {
        name: "type",
        description: "From where to remove money, from wallet or bank",
        type: Discord.ApplicationCommandOptionType.String,
        choices: [{
          name: "Wallet",
          value: "wallet"
        }, {
          name: "Bank",
          value: "bank"
        }],
        required: true,
      }, {
        name: "money",
        description: "Amount of money to remove",
        type: Discord.ApplicationCommandOptionType.Number,
        required: true,
      }]
    });
  }

  async run(message, args) {
    const user = message.mentions.users.first() || message.guild.members.cache.get(args[0]);
    const type = args[1];
    const money = args[2];

    if(!user || !money || isNaN(money) || !["wallet", "bank"].includes(type?.toLowerCase()))
      return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.buy.usage)] });

    let total;
    if(type == "wallet") {
      await db.sub(`money_${message.guild.id}_${user.id}`, parseInt(money));
      total = await db.get(`money_${message.guild.id}_${user.id}`);
    } else if(type == "bank") {
      await db.sub(`bank_${message.guild.id}_${user.id}`, parseInt(money));
      total = await db.get(`bank_${message.guild.id}_${user.id}`);
    }
    
    message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.administration.money_removed.replace("<user>", user).replace("<money>", money).replace("<type>", type).replace("<total>", total), this.client.embeds.general_color)] });
  }
  async slashRun(interaction, args) {
    const user = interaction.options.getUser("user");
    const type = interaction.options.getString("type");
    const money = interaction.options.getNumber("money");

    let total;
    if(type == "wallet") {
      await db.sub(`money_${interaction.guild.id}_${user.id}`, parseInt(money));
      total = await db.get(`money_${interaction.guild.id}_${user.id}`);
    } else if(type == "bank") {
      await db.sub(`bank_${interaction.guild.id}_${user.id}`, parseInt(money));
      total = await db.get(`bank_${interaction.guild.id}_${user.id}`);
    }
    
    interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.administration.money_removed.replace("<user>", user).replace("<money>", money).replace("<type>", type).replace("<total>", total), this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.removemoney.ephemeral });
  }
};
