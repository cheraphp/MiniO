const Command = require("../../structures/Command");
const Discord = require("discord.js");
const db = require("quick.db")

module.exports = class Counters extends Command {
  constructor(client) {
    super(client, {
      name: "counters",
      description: client.cmdConfig.counters.description,
      usage: client.cmdConfig.counters.usage,
      permissions: client.cmdConfig.counters.permissions,
      aliases: client.cmdConfig.counters.aliases,
      category: "utility",
      listed: client.cmdConfig.counters.enabled,
      slash: true,
    });
  }

  async run(message, args) {
    let config = this.client.config;

    let allUsers = this.client.users.cache.size;
    let members = this.client.users.cache.filter((u) => u.bot == false).size;
    let robots = this.client.users.cache.filter((u) => u.bot == true).size;
    let boostCount = message.guild.premiumSubscriptionCount;
    let channels = this.client.channels.cache.size;
    let roles = message.guild.roles.cache.size;

    let m = await message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.utility.counters_started, this.client.embeds.general_color)] });

    let chCategory = await message.guild.channels.create(this.client.language.utility.counters_category, {
      type: Discord.ChannelType.GuildCategory,
    });
    
    if(config.general.stats_type != "GUILD_VOICE" && config.general.stats_type != "GUILD_TEXT") return this.client.utils.sendError("Provided Channel Type for Counters (stats_type) is invalid. Valid types: GUILD_VOICE, GUILD_TEXT.")

    let chTotal = await message.guild.channels.create({
      name: `${this.client.language.utility.total_counter.replace("<stats>", allUsers)}`,
      type: config.general.stats_type == "GUILD_VOICE" ? Discord.ChannelType.GuildVoice : Discord.ChannelType.GuildText,
      parent: chCategory,
      permissionOverwrites: [
        {
          id: message.guild.roles.everyone,
          deny: ['Connect']
        }
      ]
    });
    let chMembers = await message.guild.channels.create({
      name: `${this.client.language.utility.members_counter.replace("<stats>", members)}`,
      type: config.general.stats_type == "GUILD_VOICE" ? Discord.ChannelType.GuildVoice : Discord.ChannelType.GuildText,
      parent: chCategory,
      permissionOverwrites: [
        {
          id: message.guild.roles.everyone,
          deny: ['Connect']
        }
      ]
    });
    let chRobots = await message.guild.channels.create({
      name: `${this.client.language.utility.robots_counter.replace("<stats>", robots)}`,
      type: config.general.stats_type == "GUILD_VOICE" ? Discord.ChannelType.GuildVoice : Discord.ChannelType.GuildText,
      parent: chCategory,
      permissionOverwrites: [
        {
          id: message.guild.roles.everyone,
          deny: ['Connect']
        }
      ]
    });
    let chChannels = await message.guild.channels.create({
      name: `${this.client.language.utility.channels_counter.replace("<stats>", channels)}`,
      type: config.general.stats_type == "GUILD_VOICE" ? Discord.ChannelType.GuildVoice : Discord.ChannelType.GuildText,
      parent: chCategory,
      permissionOverwrites: [
        {
          id: message.guild.roles.everyone,
          deny: ['Connect']
        }
      ]
    });
    let chRoles = await message.guild.channels.create({
      name: `${this.client.language.utility.roles_counter.replace("<stats>", roles)}`,
      type: config.general.stats_type == "GUILD_VOICE" ? Discord.ChannelType.GuildVoice : Discord.ChannelType.GuildText,
      parent: chCategory,
      permissionOverwrites: [
        {
          id: message.guild.roles.everyone,
          deny: ['Connect']
        }
      ]
    });
    let chBoosts = await message.guild.channels.create({
      name: `${this.client.language.utility.boosts_counter.replace("<stats>", boostCount)}`,
      type: config.general.stats_type == "GUILD_VOICE" ? Discord.ChannelType.GuildVoice : Discord.ChannelType.GuildText,
      parent: chCategory,
      permissionOverwrites: [
        {
          id: message.guild.roles.everyone,
          deny: ['Connect']
        }
      ]
    });

    await db.set(`totalChannel_${message.guild.id}`, chTotal.id);
    await db.set(`membersChannel_${message.guild.id}`, chMembers.id);
    await db.set(`robotsChannel_${message.guild.id}`, chRobots.id);
    await db.set(`channelsChannel_${message.guild.id}`, chChannels.id);
    await db.set(`rolesChannel_${message.guild.id}`, chRoles.id);
    await db.set(`boostsChannel_${message.guild.id}`, chBoosts.id);

    await m.edit({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.utility.counters_created, this.client.embeds.general_color)] });
  }
  async slashRun(interaction, args) {
    let config = this.client.config;
  
    let allUsers = this.client.users.cache.size;
    let members = this.client.users.cache.filter((u) => u.bot == false).size;
    let robots = this.client.users.cache.filter((u) => u.bot == true).size;
    let boostCount = interaction.guild.premiumSubscriptionCount;
    let channels = this.client.channels.cache.size;
    let roles = interaction.guild.roles.cache.size;

    let m = await interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.utility.counters_started, this.client.embeds.general_color)] });
  
    let chCategory = await interaction.guild.channels.create(this.client.language.utility.counters_category, {
      type: Discord.ChannelType.GuildCategory,
    });

    let chTotal = await interaction.guild.channels.create({
      name: `${this.client.language.utility.total_counter.replace("<stats>", allUsers)}`,
      type: config.general.stats_type == "GUILD_VOICE" ? Discord.ChannelType.GuildVoice : Discord.ChannelType.GuildText,
      parent: chCategory,
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone,
          deny: ['Connect']
        }
      ]
    });
    let chMembers = await interaction.guild.channels.create({
      name: `${this.client.language.utility.members_counter.replace("<stats>", members)}`,
      type: config.general.stats_type == "GUILD_VOICE" ? Discord.ChannelType.GuildVoice : Discord.ChannelType.GuildText,
      parent: chCategory,
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone,
          deny: ['Connect']
        }
      ]
    });
    let chRobots = await interaction.guild.channels.create({
      name: `${this.client.language.utility.robots_counter.replace("<stats>", robots)}`,
      type: config.general.stats_type == "GUILD_VOICE" ? Discord.ChannelType.GuildVoice : Discord.ChannelType.GuildText,
      parent: chCategory,
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone,
          deny: ['Connect']
        }
      ]
    });
    let chChannels = await interaction.guild.channels.create({
      name: `${this.client.language.utility.channels_counter.replace("<stats>", channels)}`,
      type: config.general.stats_type == "GUILD_VOICE" ? Discord.ChannelType.GuildVoice : Discord.ChannelType.GuildText,
      parent: chCategory,
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone,
          deny: ['Connect']
        }
      ]
    });
    let chRoles = await interaction.guild.channels.create({
      name: `${this.client.language.utility.roles_counter.replace("<stats>", roles)}`,
      type: config.general.stats_type == "GUILD_VOICE" ? Discord.ChannelType.GuildVoice : Discord.ChannelType.GuildText,
      parent: chCategory,
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone,
          deny: ['Connect']
        }
      ]
    });
    let chBoosts = await interaction.guild.channels.create({
      name: `${this.client.language.utility.boosts_counter.replace("<stats>", boostCount)}`,
      type: config.general.stats_type == "GUILD_VOICE" ? Discord.ChannelType.GuildVoice : Discord.ChannelType.GuildText,
      parent: chCategory,
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone,
          deny: ['Connect']
        }
      ]
    });
  
    await db.set(`totalChannel_${interaction.guild.id}`, chTotal.id);
    await db.set(`membersChannel_${interaction.guild.id}`, chMembers.id);
    await db.set(`robotsChannel_${interaction.guild.id}`, chRobots.id);
    await db.set(`channelsChannel_${interaction.guild.id}`, chChannels.id);
    await db.set(`rolesChannel_${interaction.guild.id}`, chRoles.id);
    await db.set(`boostsChannel_${interaction.guild.id}`, chBoosts.id);
  
    await m.edit({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.utility.counters_created, this.client.embeds.general_color)] });
  }
};