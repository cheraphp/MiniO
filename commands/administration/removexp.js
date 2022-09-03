const Command = require("../../structures/Command");
const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = class RemoveXp extends Command {
  constructor(client) {
    super(client, {
      name: "removexp",
      description: client.cmdConfig.removexp.description,
      usage: client.cmdConfig.removexp.usage,
      permissions: client.cmdConfig.removexp.permissions,
      aliases: client.cmdConfig.removexp.aliases,
      category: "administration",
      listed: client.cmdConfig.removexp.enabled,
      slash: true,
      options: [{
        name: "user",
        description: "User from which to remove xp",
        type: Discord.ApplicationCommandOptionType.User,
        required: true,
      }, {
        name: "xp",
        description: "Number of xp to remove",
        type: Discord.ApplicationCommandOptionType.Number,
        required: true,
      }]
    });
  }

  async run(message, args) {
    const user = message.mentions.users.first() || message.guild.members.cache.get(args[0]);
    const xp = args[1];

    if(!user || !xp || isNaN(xp))
      return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.buy.usage)] });

    await db.sub(`xp_${message.guild.id}_${user.id}`, parseInt(xp));

    const total = await db.get(`xp_${message.guild.id}_${user.id}`);
    
    message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.administration.xp_removed.replace("<user>", user).replace("<xp>", xp).replace("<total>", total), this.client.embeds.general_color)] });
  }
  async slashRun(interaction, args) {
    const user = interaction.options.getUser("user");
    const xp = interaction.options.getNumber("xp");

    await db.sub(`xp_${interaction.guild.id}_${user.id}`, parseInt(xp));

    const total = await db.get(`xp_${interaction.guild.id}_${user.id}`);
    
    interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.administration.xp_removed.replace("<user>", user).replace("<xp>", xp).replace("<total>", total), this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.removexp.ephemeral });
  }
};
