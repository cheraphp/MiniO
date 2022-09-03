const Command = require("../../structures/Command");
const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = class Infractions extends Command {
  constructor(client) {
    super(client, {
      name: "infractions",
      description: client.cmdConfig.infractions.description,
      usage: client.cmdConfig.infractions.usage,
      permissions: client.cmdConfig.infractions.permissions,
      aliases: client.cmdConfig.infractions.aliases,
      category: "member",
      listed: client.cmdConfig.infractions.enabled,
      slash: true,
      options: [{
        name: "user",
        description: "User who's infractions to view",
        type: Discord.ApplicationCommandOptionType.User,
        required: false
      }]
    });
  }

  async run(message, args) {
    let user = message.mentions.users.first() || message.guild.members.cache.get(args[0]) || message.author;
    let infractionList = await db.get(`infractions_${message.guild.id}_${user.id}`) || [];
    if(infractionList.length == 0) return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.moderation.history.empty, this.client.embeds.error_color)] })

    infractionList = infractionList.map((x) => x);
      
    this.client.paginateContent(this.client, infractionList, 10, 1, message, this.client.language.titles.infractions.replace("<user>", user.username), this.client.embeds.general_color);
  }
  async slashRun(interaction, args) {
    let user = interaction.options.getUser("user") || interaction.user;
    let infractionList = await db.get(`infractions_${interaction.guild.id}_${user.id}`) || [];
    if(infractionList.length == 0) return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.moderation.history.empty, this.client.embeds.error_color)] })

    infractionList = infractionList.map((x) => x);
      
    this.client.paginateContent(this.client, infractionList, 10, 1, interaction, this.client.language.titles.infractions.replace("<user>", user.username), this.client.embeds.general_color);
  }
};
