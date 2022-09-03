const Command = require("../../structures/Command");
const { ApplicationCommandOptionType } = require("discord.js");

module.exports = class RemoveRole extends Command {
  constructor(client) {
    super(client, {
      name: "removerole",
      description: client.cmdConfig.removerole.description,
      usage: client.cmdConfig.removerole.usage,
      permissions: client.cmdConfig.removerole.permissions,
      aliases: client.cmdConfig.removerole.aliases,
      category: "moderation",
      listed: client.cmdConfig.removerole.enabled,
      slash: true,
      options: [{
        name: 'user',
        type: ApplicationCommandOptionType.User,
        description: 'User from which to remove Role',
        required: true,
      },{
        name: 'role',
        type: ApplicationCommandOptionType.Role,
        description: 'Role which to remove',
        required: true,
      }]
    });
  }
  async run(message, args) {
    const user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]) 
      || message.guild.roles.cache.find((r) => r.name.toLowerCase().includes(args[0]?.toLowerCase()));

    if(!user || !role)
      return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.removerole.usage)] });

    if(user.id == message.author.id) 
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.cannot_self, this.client.embeds.error_color)] });
      
    if(user.roles.cache.has(role))
      return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.moderation.have_role, this.client.embeds.error_color)] });

    let botRole = message.guild.members.cache.get(this.client.user.id).roles.highest;
    if (role.position > botRole.position)
      return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.moderation.cannot_remove, this.client.embeds.error_color)] });

    if(message.member.roles.highest.position < role.position && !message.member.permission.cache.has("Administrator"))
      return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.moderation.cannot_remove, this.client.embeds.error_color)] });

    user.roles.add(role).catch((err) => {});
    message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.moderation.role_removed.replace("<user>", user).replace("<role>", role), this.client.embeds.success_color)] });
  }
  async slashRun(interaction, args) {
    let user = interaction.options.getUser("user");
    let role = interaction.options.getRole("role");
  
    if(user.id == interaction.user.id) 
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.cannot_self, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.removerole.ephemeral });

    if(user.roles.cache.has(role))
      return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.moderation.have_role, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.removerole.ephemeral });
    
    let botRole = interaction.guild.members.cache.get(this.client.user.id).roles.highest;
    if (role.position > botRole.position)
      return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.moderation.cannot_remove, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.removerole.ephemeral });
    
    if(interaction.member.roles.highest.position < role.position && !interaction.member.permission.cache.has("Administrator"))
      return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.moderation.cannot_remove, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.removerole.ephemeral });
    
    user.roles.remove(role).catch((err) => {});
    interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.moderation.role_removed.replace("<user>", user).replace("<role>", role), this.client.embeds.success_color)], ephemeral: this.client.cmdConfig.removerole.ephemeral });
  }
};