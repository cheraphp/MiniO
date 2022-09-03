const { QuickDB } = require("quick.db");
const db = new QuickDB();
const Discord = require("discord.js");
const chalk = require("chalk");
const fs = require("fs");

function formatTime(ms){
  let roundNumber = ms > 0 ? Math.floor : Math.ceil;
  let days = roundNumber(ms / 86400000),
  hours = roundNumber(ms / 3600000) % 24,
  mins = roundNumber(ms / 60000) % 60,
  secs = roundNumber(ms / 1000) % 60;
  var time = (days > 0) ? `${days}d ` : "";
  time += (hours > 0) ? `${hours}h ` : "";
  time += (mins > 0) ? `${mins}m ` : "";
  time += (secs > 0) ? `${secs}s` : "0s";
  return time;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const updateStats = async(client, guild) => {
  let allUsers = client.users.cache.size;
  let members = client.users.cache.filter((u) => u.bot == false).size;
  let robots = client.users.cache.filter((u) => u.bot == true).size;
  let boostCount = guild.premiumSubscriptionCount;
  let channels = client.channels.cache.size;
  let roles = guild.roles.cache.size;

  let chTotal = await db.get(`totalChannel_${guild.id}`);
  let chMembers = await db.get(`membersChannel_${guild.id}`);
  let chRobots = await db.get(`robotsChannel_${guild.id}`);
  let chChannels = await db.get(`channelsChannel_${guild.id}`);
  let chRoles = await db.get(`rolesChannel_${guild.id}`);
  let chBoosts = await db.get(`boostsChannel_${guild.id}`);

  if(chTotal != null && guild.channels.cache.get(chTotal)) {
    let ch = guild.channels.cache.get(chTotal);
    ch.setName(ch.name.replace(/[0-9]/g, "") + allUsers);
  }
  if(chMembers != null && guild.channels.cache.get(chMembers)) {
    let ch = guild.channels.cache.get(chMembers);
    ch.setName(ch.name.replace(/[0-9]/g, "") + members);
  }
  if(chRobots != null && guild.channels.cache.get(chRobots)) {
    let ch = guild.channels.cache.get(chRobots);
    ch.setName(ch.name.replace(/[0-9]/g, "") + robots);
  }
  if(chChannels != null && guild.channels.cache.get(chChannels)) {
    let ch = guild.channels.cache.get(chChannels);
    ch.setName(ch.name.replace(/[0-9]/g, "") + channels);
  }
  if(chRoles != null && guild.channels.cache.get(chChannels)) {
    let ch = guild.channels.cache.get(chRoles);
    ch.setName(ch.name.replace(/[0-9]/g, "") + roles);
  }
  if(chBoosts != null && guild.channels.cache.get(chBoosts)) {
    let ch = guild.channels.cache.get(chBoosts);
    ch.setName(ch.name.replace(/[0-9]/g, "") + boostCount);
  }
}

function commandsList(client, category) {
  let prefix = client.config.general.prefix; 
  let commands = client.commands.filter(
    c => c.category === category && c.listed === true
  );
  let loaded = [...commands.values()];
  let content = "";
  
  loaded.forEach(
    c => (content += client.language.general.help_format.replace("<prefix>", prefix)
      .replace("<name>", c.name)
      .replace("<usage>", c.usage)
      .replace("<description>", c.description))
  );
  
  return content.trim();
}

const parseArgs = (args, options) => {
  if (!options) return args

  if (typeof options === 'string') options = [options]

  const optionValues = {}

  let i
  for (i = 0; i < args.length; i++) {
    const arg = args[i]
    if (!arg.startsWith('-')) break;

    const label = arg.substr(1)

    if (options.indexOf(label + ':') > -1) {
      const leftover = args.slice(i + 1).join(' ')
      const matches = leftover.match(/^"(.+?)"/)
      if (matches) {
        optionValues[label] = matches[1]
        i += matches[0].split(' ').length
      } else {
        i++
        optionValues[label] = args[i]
      }
    } else if (options.indexOf(label) > -1) {
      optionValues[label] = true
    } else {
      break
    }
  }

  return {
    options: optionValues,
    leftover: args.slice(i)
  }
}

const inviteToJson = (invite) => {
  return {
    code: invite.code,
    uses: invite.uses,
    maxUses: invite.maxUses,
    inviter: invite.inviter,
    channel: invite.channel,
    url: invite.url
  };
};


const generateInvitesCache = (invitesCache) => {
  const cacheCollection = new Discord.Collection();
  invitesCache.forEach((invite) => {
    cacheCollection.set(invite.code, inviteToJson(invite));
  });
  return cacheCollection;
};

const isEqual = (value, other) => {
  const type = Object.prototype.toString.call(value);
  if (type !== Object.prototype.toString.call(other)) return false;
  if (["[object Array]", "[object Object]"].indexOf(type) < 0) return false;
  const valueLen = type === "[object Array]" ? value.length : Object.keys(value).length;
  const otherLen = type === "[object Array]" ? other.length : Object.keys(other).length;
  if (valueLen !== otherLen) return false;
  const compare = (item1, item2) => {
    const itemType = Object.prototype.toString.call(item1);
    if (["[object Array]", "[object Object]"].indexOf(itemType) >= 0) {
        if (!isEqual(item1, item2)) return false;
    } else {
      if (itemType !== Object.prototype.toString.call(item2)) return false;
      if (itemType === "[object Function]") {
        if (item1.toString() !== item2.toString()) return false;
      } else {
        if (item1 !== item2) return false;
      }
    }
  };
  if (type === "[object Array]") {
    for (var i = 0; i < valueLen; i++) {
      if (compare(value[i], other[i]) === false) return false;
    }
  } else {
    for (var key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        if (compare(value[key], other[key]) === false) return false;
      }
    }
  }
  return true;
};

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

const sendError = (error) => {
  console.log(chalk.red("[ERROR] ") + chalk.white(error));

  let errorMessage = `[${new Date().toLocaleString()}] [ERROR] ${error}\n`;
  
  fs.appendFile("./info.txt", errorMessage, (e) => { 
    if(e) console.log(e);
  });
}

const sendWarn = (warn) => {
  console.log(chalk.keyword("orange")("[WARNING] ") + chalk.white(warn));

  let warnMessage = `[${new Date().toLocaleString()}] [WARN] ${warn}\n`;
  
  fs.appendFile("./info.txt", warnMessage, (e) => { 
    if(e) console.log(e);
  });
}

const sendInfo = (info) => {
  console.log(chalk.blue("[INFO] ") + chalk.white(info));
}

const filesCheck = () => {
  if(!fs.existsSync('./info.txt')) {
    fs.open('./info.txt', 'w', function (err, file) {
      if (err) sendError("Couldn't create file (info.txt)");
      sendInfo("File (info.txt) doesn't exists, creating it.");
    });
  }
  if(!fs.existsSync('./transcripts')) {
    fs.mkdir('./transcripts', function (err) {
      if (err) sendError("Couldn't create folder (transcripts)");
      sendInfo("Folder (transcripts) doesn't exists, creating it.");
    }) 
  }
}

const validUsage = (client, message, validUsage) => {
  let embed = client.embedBuilder(client, message.member.user, client.embeds.title, client.language.general.invalid_usage.replace("<usage>", validUsage), client.embeds.error_color);
  return embed;
}

const hasRole = (client, guild, member, roles, checkEmpty = false) => {
  if(checkEmpty == true && roles.length == 0) return true;

  let arr = roles.map((x, i) => {
    let findPerm = client.utils.findRole(guild, `${x}`.toLowerCase());
    if(!findPerm) return false;
    if(member.roles.cache.has(findPerm.id)) return true;

    return false;
  });
  if(checkEmpty == true && arr.length == 0) return true;

  return arr.includes(true) ? true : false;
}

const permissionsLength = (message, member, permList) => {
  let userPerms = [];
  permList.forEach((perm) => {
    if(!Discord.PermissionFlagsBits[perm]) perm = "";
    if(!message.channel.permissionsFor(member).has(perm)) {
      userPerms.push(perm);
    }
  });

  return userPerms.length;
}

const pushHistory = async(message, userId, text) => {
  let history = await db.get(`invitesHistory_${message.guild.id}_${userId}`) || [];
  history.unshift(text);
  await db.set(`invitesHistory_${message.guild.id}_${userId}`, history);
}

const lbContent = async(client, message, lbType) => {
  let leaderboard = (await db.all())
    .filter(data => data.id.startsWith(`${lbType}_${message.guild.id}`))
    .sort((a, b) => b.value - a.value);
  let content = "";
  
  for (let i = 0; i < leaderboard.length; i++) {
    if (i === 10) break;
  
    let user = client.users.cache.get(leaderboard[i].id.split("_")[2]);
    if (user == undefined) user = "Unknown User";
    else user = user.username;
    content += `\`${i + 1}.\` ${user} - **${leaderboard[i].value}**\n`;
  }

  if(leaderboard.length == 0) content = `> No Data`
  
  return content;
}

const logs = (client, guild, type, fields, user, event = "none") => {
  if(!guild.members.me.permissions.has("ManageGuild")) return;
  if(event == "none") {
    let aChannel = client.utils.findChannel(guild, client.config.channels.logging.bot);
    
    let embed = new Discord.EmbedBuilder()
      .setAuthor({ name: user.username, iconURL: user.displayAvatarURL({ dynamic: true }) })
      .setDescription(`Logging Type - \`${type}\``)
      .setColor("#FFFFFD")
      .setTimestamp();
      
    for(var i = 0; i < fields.length; i++) {
      embed.addFields([{ name: fields[i].name + "", value: fields[i].desc + "" }]);
    }

    aChannel.send({ embeds: [embed] });
  } else {
    if(!client.config.plugins.logging.events.includes(event)) return;
    let aChannel = client.utils.findChannel(guild, client.config.channels.logging.events);
    
    let embed = new Discord.EmbedBuilder()
      .setAuthor({ name: user.username, iconURL: user.displayAvatarURL({ dynamic: true }) })
      .setDescription(`Logging Type - \`${type}\``)
      .setColor("#FFFFFD")
      .setTimestamp();
      
    for(var i = 0; i < fields.length; i++) {
      embed.addFields([{ name: fields[i].name + "", value: fields[i].desc + "" }]);
    }
  
    aChannel.send({ embeds: [embed] });
  }
}

const findChannel = (guild, channel) => {
  return guild.channels.cache.find(ch => ch.name.toLowerCase() == `${channel}`.toLowerCase()) || guild.channels.cache.get(channel);
}

const findRole = (guild, role) => {
  return guild.roles.cache.find(r => r.name.toLowerCase() == `${role}`.toLowerCase()) || guild.roles.cache.get(role);
}

const channelRoleCheck = (client, usedGuild, foundWarn) => {
  const config = client.config;
  if (client.config.roles.bypass.cooldown.length > 0) {
    for (let i = 0; i > client.config.roles.bypass.cooldown.length; i++) {
      let findRole = client.utils.findRole(usedGuild, client.config.roles.bypass.cooldown[i]);
      if (!findRole) {
        client.utils.sendWarn("One or more Cooldown Bypass Roles (roles.bypass.cooldown) provided are invalid or belongs to other Server.");
        foundWarn.push("Invalid Cooldown Bypass Roles");
        break;
      }
    }
  }
  if (client.config.roles.bypass.permission.length > 0) {
    for (let i = 0; i > client.config.roles.bypass.permission.length; i++) {
      let findRole = client.utils.findRole(usedGuild, client.config.roles.bypass.permission[i]);
      if (!findRole) {
        client.utils.sendWarn("One or more Permission Bypass Roles (roles.bypass.permission) provided are invalid or belongs to other Server.");
        foundWarn.push("Invalid Permission Bypass Roles");
        break;
      }
    }
  }
  if(config.channels.sugg_logs != "" && config.general.sugg_decision == true) {
    let findChannel = client.utils.findChannel(usedGuild, config.channels.sugg_logs);
    if(!findChannel) {
      client.utils.sendWarn("Suggestion Logs Channel Name/ID (sugg_logs) provided is invalid or belongs to other Server.");
      foundWarn.push("Invalid Suggestions Logs Channel");
    }
  }
  if(config.channels.sugg_decision != "" && config.general.sugg_decision == true) {
    let findChannel = client.utils.findChannel(usedGuild, config.channels.sugg_logs);
    if(!findChannel) {
      client.utils.sendWarn("Suggestion Decision Channel Name/ID (sugg_decision) provided is invalid or belongs to other Server.");
      foundWarn.push("Invalid Suggestions Decision Channel");
    }
  }
  if(config.channels.announce != "") {
    let findChannel = client.utils.findChannel(usedGuild, config.channels.announce);
    if(!findChannel) {
      client.utils.sendWarn("Auto Announcements Channel Name/ID (announce) provided is invalid or belongs to other Server.");
      foundWarn.push("Invalid Auto Announcements Channel");
    }
  }
  if(config.channels.invites != "") {
    let findChannel = client.utils.findChannel(usedGuild, config.channels.invites);
    if(!findChannel) {
      client.utils.sendWarn("Invites Channel Name/ID (invites) provided is invalid or belongs to other Server.");
      foundWarn.push("Invalid Invites Channel");
    }
  }
  if(config.channels.welcome != "") {
    let findChannel = client.utils.findChannel(usedGuild, config.channels.welcome);
    if(!findChannel) {
      client.utils.sendWarn("Welcome Channel Name/ID (welcome) provided is invalid or belongs to other Server.");
      foundWarn.push("Invalid Welcome Channel");
    }
  }
  if(config.channels.leave != "") {
    let findChannel = client.utils.findChannel(usedGuild, config.channels.leave);
    if(!findChannel) {
      client.utils.sendWarn("Leave Channel Name/ID (leave) provided is invalid or belongs to other Server.");
      foundWarn.push("Invalid Leave Channel");
    }
  }
  if(config.channels.temporary.category != "") {
    let findChannel = client.utils.findChannel(usedGuild, config.channels.temporary.category);
    if(!findChannel) {
      client.utils.sendWarn("Temporary Voice Channel Category Name/ID (temporary.category) provided is invalid or belongs to other Server.");
      foundWarn.push("Invalid Temporary VC Category");
    }
  }
  if(config.channels.temporary.voice != "") {
    let findChannel = client.utils.findChannel(usedGuild, config.channels.temporary.voice);
    if(!findChannel) {
      client.utils.sendWarn("Temporary Voice Channel Name/ID (temporary.voice) provided is invalid or belongs to other Server.");
      foundWarn.push("Invalid Temporary Voice Channel");
    }
  }
  if(config.channels.logging.bot != "") {
    let findChannel = client.utils.findChannel(usedGuild, config.channels.logging.bot);
    if(!findChannel) {
      client.utils.sendWarn("Bot Logging Channel Name/ID (decision) provided is invalid or belongs to other Server.");
      foundWarn.push("Invalid Bot Logging Channel");
    }
  }
  if(config.channels.logging.events != "") {
    let findChannel = client.utils.findChannel(usedGuild, config.channels.logging.events);
    if(!findChannel) {
      client.utils.sendWarn("Events Logging Channel Name/ID (decision) provided is invalid or belongs to other Server.");
      foundWarn.push("Invalid Events Logging Channel");
    }
  }
}

const progressBar = (max, curr) => {
  let line = '□'
  let slider = '■';
  let length = 25;
  if (curr > max) {
    const bar = slider.repeat(length + 2);
    const percentage = (curr / max) * 100;
    return [bar, percentage];
  } else {
    const percentage = curr / max;
    const progress = Math.round((length * percentage));
    const emptyProgress = length - progress;
    const progressText = slider.repeat(progress);
    const emptyProgressText = line.repeat(emptyProgress);
    const bar = progressText + emptyProgressText;
    const calculated = percentage * 100;
    return [bar, calculated];
  }
}

const isIgnored = (guild, channels) => {
  let ignoredChannels = channels.map((x, i) => {
    let ignored = [];
    let findIgnore = findChannel(guild, x);
    if(findIgnore) ignored.push(findIgnore.id);
    return ignored;
  });
  return ignoredChannels.length > 0 ? true : false;
}

function giveawayObject(guild, messageID, time, channel, winners, messages, invites, ending, hoster, prize) {
  let gwObject = {
    messageID: messageID,
    guildID: guild, 
    channelID: channel,
    prize: prize,
    duration: time, 
    hostedBy: hoster, 
    winnerCount: winners, 
    requirements: {
      messagesReq: messages, 
      invitesReq: invites,
    },
    ended: false, 
    endsAt: ending,
    winners: []
  }
  
  return gwObject;
}

const updateSuggestionEmbed = async(client, interaction) => {
  let suggData = await db.get(`suggestion_${interaction.guild.id}_${interaction.message.id}`);
  let suggChannel = client.utils.findChannel(interaction.guild, client.config.channels.suggestions);
  let decisionChannel = client.utils.findChannel(interaction.guild, client.config.channels.sugg_decision);

  let suggMenu = new Discord.EmbedBuilder()
    .setColor(client.embeds.suggestion.color);

  if(client.embeds.suggestion.title) suggMenu.setTitle(client.embeds.suggestion.title);
  let field = client.embeds.suggestion.fields;
  for(let i = 0; i < client.embeds.suggestion.fields.length; i++) {
  suggMenu.addFields([{ name: field[i].title, value: field[i].description.replace("<author>", `<@!${suggData.author.id}>`)
    .replace("<suggestion>", suggData.text)
    .replace("<yes_vote>", suggData.yes)
    .replace("<no_vote>", suggData.no)
    .replace("<date>", suggData.date) }])
  }

  if(client.embeds.suggestion.footer == true) suggMenu.setFooter({ text: suggData.author.username, iconURL: suggData.author.displayAvatarURL }).setTimestamp();
  if(client.embeds.suggestion.thumbnail == true) suggMenu.setThumbnail(interaction.guild.iconURL());

  if(client.embeds.suggestion.description) suggMenu.setDescription(client.embeds.suggestion.description.replace("<author>", `<@!${suggData.author.id}>`)
    .replace("<suggestion>", suggData.text)
    .replace("<yes_vote>", suggData.yes)
    .replace("<no_vote>", suggData.no)
    .replace("<date>", suggData.date));

  let suggRow = new Discord.ActionRowBuilder().addComponents(
    new Discord.ButtonBuilder()
      .setLabel(client.language.buttons.yes_vote)
      .setEmoji(client.config.emojis.yes_emoji || {})
      .setCustomId("vote_yes")
      .setStyle(Discord.ButtonStyle.Primary),
    new Discord.ButtonBuilder()
      .setLabel(client.language.buttons.no_vote)
      .setEmoji(client.config.emojis.no_emoji || {})
      .setCustomId("vote_no")
      .setStyle(Discord.ButtonStyle.Danger),
    new Discord.ButtonBuilder()
      .setLabel(client.language.buttons.remove_vote)
      .setEmoji(client.config.emojis.remove_vote || {})
      .setCustomId("vote_reset")
      .setStyle(Discord.ButtonStyle.Secondary)
  );

  let decisionRow = new Discord.ActionRowBuilder().addComponents(
    new Discord.SelectMenuBuilder()
      .setCustomId("decision_menu")
      .setPlaceholder(client.language.general.suggestions.placeholder)
      .addOptions([{
        label: client.language.general.suggestions.decision.accept,
        value: "decision_accept",
        emoji: client.config.emojis.yes_emoji
      }, {
        label: client.language.general.suggestions.decision.deny,
        value: "decision_deny",
        emoji: client.config.emojis.no_emoji
      }, {
        label: client.language.general.suggestions.decision.delete,
        value: "decision_delete",
        emoji: client.config.emojis.remove_vote
      }])
  );

  let suggMessage = await suggChannel.messages.fetch({ message: interaction.message.id });
  await suggMessage.edit({ embeds: [suggMenu], components: [suggRow] });
  if(client.config.channels.sugg_decision && client.config.general_sugg_decision) {
    let decisionMessage = await decisionChannel.messages.fetch({ message: suggData.decision });
    if(decisionMessage) await decisionMessage.edit({ embeds: [suggMenu], components: [decisionRow] });
  }
}

const antiCapsFilter = (c) => {
  let length = c.replace(/[^A-Z]/g, "").length;
  let percent = Math.floor((length / c.length) * 100);
  if (c.length < 8) return false;
  return percent > 65;
}

const pushInf = async(message, userId, text) => {
  let history = await db.get(`infractions_${message.guild.id}_${userId}`) || [];
  history.unshift(text);
  await db.set(`infractions_${message.guild.id}_${userId}`, history);
}

const unbanChecker = async(client, guild) => {
  let bans = (await db.all()).filter((x) => x.id.startsWith("tempban_"));
  
  bans.forEach((ban) => {
    const bannedUser = client.users.cache.get(ban.id.split("_")[2]);
    setInterval(() => {
      if(ban.value.endsAt < Date.now()) {
        guild.bans.remove(bannedUser)
      }
    }, 180_000);
  })
}

module.exports = {
  formatTime,
  capitalizeFirstLetter,
  commandsList,
  updateStats,
  sendError, 
  validUsage,
  generateInvitesCache,
  inviteToJson,
  asyncForEach,
  isEqual,
  pushHistory,
  lbContent,
  logs, 
  findChannel,
  findRole,
  channelRoleCheck,
  giveawayObject,
  progressBar,
  isIgnored,
  hasRole,
  filesCheck,
  sendWarn,
  sendInfo,
  permissionsLength,
  parseArgs,
  updateSuggestionEmbed,
  antiCapsFilter,
  pushInf,
  unbanChecker
}
