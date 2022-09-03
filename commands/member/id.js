const Command = require("../../structures/Command");
const Discord = require("discord.js");

module.exports = class ID extends Command {
  constructor(client) {
    super(client, {
      name: "id",
      description: client.cmdConfig.id.description,
      usage: client.cmdConfig.id.usage,
      permissions: client.cmdConfig.id.permissions,
      aliases: client.cmdConfig.id.aliases,
      category: "member",
      listed: client.cmdConfig.id.enabled,
      slash: true,
      options: [{
        name: "channel",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "Channel which ID to obtain",
        options: [{
          name: "channelmention",
          type: Discord.ApplicationCommandOptionType.Channel,
          description: "Channel which ID to obtain",
          required: true,
        }]
      },{
        name: "role",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "Role which ID to obtain",
        options: [{
          name: "rolemention",
          type: Discord.ApplicationCommandOptionType.Role,
          description: "Role which ID to obtain",
          required: true,
        }]
      },{
        name: "user",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "User which ID to obtain",
        options: [{
          name: "usermention",
          type: Discord.ApplicationCommandOptionType.User,
          description: "User which ID to obtain",
          required: true,
        }]
      }]
    });
  }

  async run(message, args) {
    const config = this.client.config;
    let mention = message.mentions.channels.first() || message.mentions.roles.first() || message.mentions.users.first();
    if(!mention) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.id.usage)]});

    message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.utility.getid.replace("<type>", mention).replace("<id>", mention.id), this.client.embeds.success_color)] });
  }
  async slashRun(interaction, args) {
    const config = this.client.config;
    let option = args[0];
    let value = args[1];

    if(option == "channel") {
      interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.utility.getid.replace("<type>", `<#${value}>`).replace("<id>", value), this.client.embeds.success_color)] });
    } else if(option == "role") {
      interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.utility.getid.replace("<type>", `<@&${value}>`).replace("<id>", value), this.client.embeds.success_color)] });
    } else if(option == "user") {
      interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.utility.getid.replace("<type>", `<@${value}>`).replace("<id>", value), this.client.embeds.success_color)] });
    }
  }
};
