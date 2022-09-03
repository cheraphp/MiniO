const Command = require("../../structures/Command");
const { ApplicationCommandOptionType } = require("discord.js");

module.exports = class AddRole extends Command {
  constructor(client) {
    super(client, {
      name: "addrole",
      description: client.cmdConfig.addrole.description,
      usage: client.cmdConfig.addrole.usage,
      permissions: client.cmdConfig.addrole.permissions,
      aliases: client.cmdConfig.addrole.aliases,
      category: "moderation",
      listed: client.cmdConfig.addrole.enabled,
      slash: true,
      options: [{
        name: 'user',
        type: ApplicationCommandOptionType.User,
        description: 'User which to give Role to',
        required: true,
      },{
        name: 'role',
        type: ApplicationCommandOptionType.Role,
        description: 'Role which to give',
        required: true,
      }]
    });
  }
  async run(message, args) {
    const user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]) 
      || message.guild.roles.cache.find((r) => r.name.toLowerCase().includes(args[0]?.toLowerCase()));

    if(!user || !role)
      return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.addrole.usage)] });

    if(user.id == message.author.id) 
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.cannot_self, this.client.embeds.error_color)] });
      
    if(user.roles.cache.has(role))
      return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.moderation.have_role, this.client.embeds.error_color)] });

    let botRole = message.guild.members.cache.get(this.client.user.id).roles.highest;
    if (role.position > botRole.position)
      return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.moderation.cannot_add, this.client.embeds.error_color)] });

    if(message.member.roles.highest.position < role.position && !message.member.permission.cache.has("Administrator"))
      return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.moderation.cannot_add, this.client.embeds.error_color)] });

    user.roles.add(role).catch((err) => {});
    message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.moderation.role_added.replace("<user>", user).replace("<role>", role), this.client.embeds.success_color)] });
  }
  async slashRun(interaction, args) {
    let user = interaction.options.getUser("user");
    let role = interaction.options.getRole("role");
  
    if(user.id == interaction.user.id) 
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.cannot_self, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.addrole.ephemeral });

    if(user.roles.cache.has(role))
      return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.moderation.have_role, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.addrole.ephemeral });
    
    let botRole = interaction.guild.members.cache.get(this.client.user.id).roles.highest;
    if (role.position > botRole.position)
      return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.moderation.cannot_add, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.addrole.ephemeral });
    
    if(interaction.member.roles.highest.position < role.position && !interaction.member.permission.cache.has("Administrator"))
      return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.moderation.cannot_add, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.addrole.ephemeral });
    
    user.roles.add(role).catch((err) => {});
    interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.moderation.role_added.replace("<user>", user).replace("<role>", role), this.client.embeds.success_color)], ephemeral: this.client.cmdConfig.addrole.ephemeral });
  }
};
