const Discord = require("discord.js");

const antiSpamMap = new Map();

const antiCaps = async(client, message) => {
  let plugin = client.config.plugins.auto_mod;
  let isIgnored = plugin.channels.caps.some(async(ch) => {
    let findCh = await client.utils.findChannel(message.guild, ch);
    return findCh?.id == message.channel.id;
  });

  if(plugin.enabled == true && plugin.modules.includes("CAPS_LOCK") && !isIgnored) {
    if(!client.utils.hasRole(client, message.guild, message.member, client.config.roles.bypass.caps_lock) && !message.member.permissions.has(Discord.PermissionFlagsBits["ManageGuild"])) {
      if(client.utils.antiCapsFilter(message.content)) {
        let embed = new Discord.EmbedBuilder()
          .setDescription(client.embeds.autoMod.caps.description.replace("<user>", message.author))
          .setColor(client.embeds.autoMod.caps.color);

        if(client.embeds.autoMod.caps.footer == true) embed.setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) }).setTimestamp();
        if(client.embeds.autoMod.caps.title != "") embed.setTitle(client.embeds.autoMod.caps.title);

        const punishment = plugin.punishments.caps;

        switch(punishment.type) {
          case 'WARN':
            message.channel.send({ embeds: [embed] }).then((msg) => setTimeout(() => msg.delete(), plugin.remove_after * 1000));
            break
          case 'DELETE':
            message.delete();
            break;
          case 'WARN_DELETE':
            await message.channel.send({ embeds: [embed] }).then((msg) => setTimeout(() => msg.delete(), plugin.remove_after * 1000));
            await message.delete();
            break;
          case 'TIMEOUT':
            await message.member.timeout(punishment.timeout * 1000, `AutoMod - Too much CapsLock`)
            await message.channel.send({ embeds: [embed] }).then((msg) => setTimeout(() => msg.delete(), plugin.remove_after * 1000));
            await message.delete();
            break;
          default:
            break;
        }
      }
    }
  }
}

const antiLinks = async(client, message) => {
  let plugin = client.config.plugins.auto_mod;
  let isIgnored = plugin.channels.links.some(async(ch) => {
    let findCh = await client.utils.findChannel(message.guild, ch);
    return findCh?.id == message.channel.id;
  });

  if(plugin.enabled == true && plugin.modules.includes("ANTI_LINK") && !isIgnored) {
    if(!client.utils.hasRole(client, message.guild, message.member, client.config.roles.bypass.links) && !message.member.permissions.has(Discord.PermissionFlagsBits["ManageGuild"])) {
      if(/(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/.test(message.content) && !message.content.toLowerCase().match(/(discord\.(gg|me|io)|(discordapp\.com|discord\.com)\/invite).*/) && !plugin.links_wl.some((l) => message.content.toLowerCase().includes(l.toLowerCase()))) {
        let embed = new Discord.EmbedBuilder()
          .setDescription(client.embeds.autoMod.links.description.replace("<user>", message.author))
          .setColor(client.embeds.autoMod.links.color);

        if(client.embeds.autoMod.links.footer == true) embed.setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) }).setTimestamp();
        if(client.embeds.autoMod.links.title != "") embed.setTitle(client.embeds.autoMod.links.title);

        const punishment = plugin.punishments.links;

        switch(punishment.type) {
          case 'WARN':
            message.channel.send({ embeds: [embed] }).then((msg) => setTimeout(() => msg.delete(), plugin.remove_after * 1000));
            break
          case 'DELETE':
            message.delete();
            break;
          case 'WARN_DELETE':
            await message.channel.send({ embeds: [embed] }).then((msg) => setTimeout(() => msg.delete(), plugin.remove_after * 1000));
            await message.delete();
            break;
          case 'TIMEOUT':
            await message.member.timeout(punishment.timeout * 1000, `AutoMod - Sending Links`)
            await message.channel.send({ embeds: [embed] }).then((msg) => setTimeout(() => msg.delete(), plugin.remove_after * 1000));
            await message.delete();
            break;
          default:
            break;
        }
      }
    }
  }
}

const antiSwear = async(client, message) => {
  let plugin = client.config.plugins.auto_mod;
  let isIgnored = plugin.channels.bad_words.some(async(ch) => {
    let findCh = await client.utils.findChannel(message.guild, ch);
    return findCh?.id == message.channel.id;
  });

  if(plugin.enabled == true && plugin.modules.includes("BAD_WORDS") && !isIgnored) {
    if(!client.utils.hasRole(client, message.guild, message.member, client.config.roles.bypass.bad_words) && !message.member.permissions.has(Discord.PermissionFlagsBits["ManageGuild"])) {
      const badWords = plugin.bad_words;
      if(badWords.length > 0 && badWords.some((w) => message.content.toLowerCase().includes(w.toLowerCase()))) {
        let embed = new Discord.EmbedBuilder()
          .setDescription(client.embeds.autoMod.bad_words.description.replace("<user>", message.author))
          .setColor(client.embeds.autoMod.bad_words.color);

        if(client.embeds.autoMod.bad_words.footer == true) embed.setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) }).setTimestamp();
        if(client.embeds.autoMod.bad_words.title != "") embed.setTitle(client.embeds.autoMod.bad_words.title);

        const punishment = plugin.punishments.bad_words;

        switch(punishment.type) {
          case 'WARN':
            message.channel.send({ embeds: [embed] }).then((msg) => setTimeout(() => msg.delete(), plugin.remove_after * 1000));
            break
          case 'DELETE':
            message.delete();
            break;
          case 'WARN_DELETE':
            await message.channel.send({ embeds: [embed] }).then((msg) => setTimeout(() => msg.delete(), plugin.remove_after * 1000));
            await message.delete();
            break;
          case 'TIMEOUT':
            await message.member.timeout(punishment.timeout * 1000, `AutoMod - Swearing/Bad Words`)
            await message.channel.send({ embeds: [embed] }).then((msg) => setTimeout(() => msg.delete(), plugin.remove_after * 1000));
            await message.delete();
            break;
          default:
            break;
        }
      }
    }
  }
}

const antiInvites = async(client, message) => {
  let plugin = client.config.plugins.auto_mod;
  let isIgnored = plugin.channels.invites.some(async(ch) => {
    let findCh = await client.utils.findChannel(message.guild, ch);
    return findCh?.id == message.channel.id;
  });

  if(plugin.enabled == true && plugin.modules.includes("ANTI_INVITE") && !isIgnored) {
    if(!client.utils.hasRole(client, message.guild, message.member, client.config.roles.bypass.invites) && !message.member.permissions.has(Discord.PermissionFlagsBits["ManageGuild"])) {
      if(message.content.toLowerCase().match(/(discord\.(gg|me|io)|(discordapp\.com|discord\.com)\/invite).*/)) {
        let embed = new Discord.EmbedBuilder()
          .setDescription(client.embeds.autoMod.invites.description.replace("<user>", message.author))
          .setColor(client.embeds.autoMod.invites.color);

        if(client.embeds.autoMod.invites.footer == true) embed.setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) }).setTimestamp();
        if(client.embeds.autoMod.invites.title != "") embed.setTitle(client.embeds.autoMod.invites.title);

        const punishment = plugin.punishments.invites;

        switch(punishment.type) {
          case 'WARN':
            message.channel.send({ embeds: [embed] }).then((msg) => setTimeout(() => msg.delete(), plugin.remove_after * 1000));
            break
          case 'DELETE':
            message.delete();
            break;
          case 'WARN_DELETE':
            await message.channel.send({ embeds: [embed] }).then((msg) => setTimeout(() => msg.delete(), plugin.remove_after * 1000));
            await message.delete();
            break;
          case 'TIMEOUT':
            await message.member.timeout(punishment.timeout * 1000, `AutoMod - Sending Invites`)
            await message.channel.send({ embeds: [embed] }).then((msg) => setTimeout(() => msg.delete(), plugin.remove_after * 1000));
            await message.delete();
            break;
          default:
            break;
        }
      }
    }
  }
}

const antiSpam = async(client, message) => {
  let plugin = client.config.plugins.auto_mod;
  let isIgnored = plugin.channels.spam.some(async(ch) => {
    let findCh = await client.utils.findChannel(message.guild, ch);
    return findCh?.id == message.channel.id;
  });

  if(plugin.enabled == true && plugin.modules.includes("ANTI_SPAM") && !isIgnored) {
    if(true) {
      if(antiSpamMap.has(message.author.id)) {
        const userData = antiSpamMap.get(message.author.id);
        const { lastMessage, spamTimer } = userData;
    
        const diff = message.createdTimestamp - lastMessage.createdTimestamp;
        let messageCount = userData.messageCount;
    
        if(diff > 7500) {
          userData.recently = false;
          antiSpamMap.set(message.author.id, userData);
        }

        if(diff > 2500) {
          clearTimeout(spamTimer);
          userData.messages = '1';
          userData.lastMessage = message;
          userData.spamTimer = setTimeout(() => antiSpamMap.delete(message.author.id), 5000);  
        } else {
          messageCount++;
          if(messageCount == 5) {
            let embed = new Discord.EmbedBuilder()
              .setDescription(client.embeds.autoMod.spam.description.replace("<user>", message.author))
              .setColor(client.embeds.autoMod.spam.color);
    
            if(client.embeds.autoMod.spam.footer == true) embed.setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) }).setTimestamp();
            if(client.embeds.autoMod.spam.title != "") embed.setTitle(client.embeds.autoMod.spam.title);
    
            const punishment = plugin.punishments.spam;
    
            let msgs = await message.channel.messages.fetch({ limit: 40 });
            msgs = msgs.filter((m) => m.author.id == message.author.id);

            switch(punishment.type) {
              case 'WARN':
                if(userData.recently == false) message.channel.send({ embeds: [embed] }).then((msg) => setTimeout(() => msg.delete(), plugin.remove_after * 1000));
                break
              case 'DELETE':
                if(userData.recently == false) msgs.forEach(async(m) => await m.delete());
                break;
              case 'WARN_DELETE':
                if(userData.recently == false) await message.channel.send({ embeds: [embed] }).then((msg) => setTimeout(() => msg.delete(), plugin.remove_after * 1000));
                msgs.forEach(async(m) => await m.delete().catch((err) => {}));
                break;
              case 'TIMEOUT':
                if(!message.member.isCommunicationDisabled()) await message.member.timeout(punishment.timeout * 1000, `AutoMod - Spamming`)
                if(userData.recently == false) await message.channel.send({ embeds: [embed] }).then((msg) => setTimeout(() => msg.delete(), plugin.remove_after * 1000));
                msgs.forEach(async(m) => await m.delete().catch((err) => {}));
                break;
              default:
                break;
            }
            
            userData.recently = true;
            antiSpamMap.set(message.author.id, userData);
          } else {
            userData.messageCount = messageCount;
            antiSpamMap.set(message.author.id, userData);
          }
        }
      } else {
        let remove = setTimeout(() => antiSpamMap.delete(message.author.id), 5000);
        antiSpamMap.set(message.author.id, {
          messageCount: 1,
          lastMessage: message,
          recently: false,
          timer: remove
        })
      }
    }
  }
}

module.exports = {
  antiCaps,
  antiInvites,
  antiLinks,
  antiSwear,
  antiSpam,
}