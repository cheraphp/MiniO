const Command = require("../../structures/Command");
const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = class AddLevel extends Command {
  constructor(client) {
    super(client, {
      name: "addlevel",
      description: client.cmdConfig.addlevel.description,
      usage: client.cmdConfig.addlevel.usage,
      permissions: client.cmdConfig.addlevel.permissions,
      aliases: client.cmdConfig.addlevel.aliases,
      category: "administration",
      listed: client.cmdConfig.addlevel.enabled,
      slash: true,
      options: [{
        name: "user",
        description: "User to who to add level",
        type: Discord.ApplicationCommandOptionType.User,
        required: true,
      }, {
        name: "level",
        description: "Number of levels to add",
        type: Discord.ApplicationCommandOptionType.Number,
        required: true,
      }]
    });
  }

  async run(message, args) {
    const user = message.mentions.users.first() || message.guild.members.cache.get(args[0]);
    const level = args[1];

    if(!user || !level || isNaN(level))
      return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.buy.usage)] });

    await db.add(`level_${message.guild.id}_${user.id}`, parseInt(level));

    const total = await db.get(`level_${message.guild.id}_${user.id}`);
    
    message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.administration.level_added.replace("<user>", user).replace("<level>", level).replace("<total>", total), this.client.embeds.general_color)] });
  }
  async slashRun(interaction, args) {
    const user = interaction.options.getUser("user");
    const level = interaction.options.getNumber("level");

    await db.add(`level_${interaction.guild.id}_${user.id}`, parseInt(level));

    const total = await db.get(`level_${interaction.guild.id}_${user.id}`);
    
    interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.administration.level_added.replace("<user>", user).replace("<level>", level).replace("<total>", total), this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.addlevel.ephemeral });
  }
};
