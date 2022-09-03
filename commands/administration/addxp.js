const Command = require("../../structures/Command");
const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = class AddXP extends Command {
  constructor(client) {
    super(client, {
      name: "addxp",
      description: client.cmdConfig.addxp.description,
      usage: client.cmdConfig.addxp.usage,
      permissions: client.cmdConfig.addxp.permissions,
      aliases: client.cmdConfig.addxp.aliases,
      category: "administration",
      listed: client.cmdConfig.addxp.enabled,
      slash: true,
      options: [{
        name: "user",
        description: "User to who to add xp",
        type: Discord.ApplicationCommandOptionType.User,
        required: true,
      }, {
        name: "xp",
        description: "Number of xp to add",
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

    await db.add(`xp_${message.guild.id}_${user.id}`, parseInt(xp));

    const total = await db.get(`xp_${message.guild.id}_${user.id}`);
    
    message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.administration.xp_added.replace("<user>", user).replace("<xp>", xp).replace("<total>", total), this.client.embeds.general_color)] });
  }
  async slashRun(interaction, args) {
    const user = interaction.options.getUser("user");
    const xp = interaction.options.getNumber("xp");

    await db.add(`xp_${interaction.guild.id}_${user.id}`, parseInt(xp));

    const total = await db.get(`xp_${interaction.guild.id}_${user.id}`);
    
    interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.administration.xp_added.replace("<user>", user).replace("<xp>", xp).replace("<total>", total), this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.addxp.ephemeral });
  }
};
