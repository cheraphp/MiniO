const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const ms = require("ms");

const startGiveaway = async (client, message, gwObject) => {
  let reqContent = "";
  if(gwObject.requirements.messagesReq > 0 || gwObject.requirements.invitesReq > 0) reqContent += client.language.giveaway.embed.requirements;
  if(gwObject.requirements.messagesReq > 0) reqContent += client.language.giveaway.embed.messages.replace("<messages>", gwObject.requirements.messagesReq);
  if(gwObject.requirements.invitesReq > 0) reqContent += client.language.giveaway.embed.invites.replace("<invites>", gwObject.requirements.invitesReq);
  
  let startEmbed = new Discord.EmbedBuilder()
    .setAuthor({ name: client.language.giveaway.titles.giveaway, iconURL: client.user.displayAvatarURL() })
    .setDescription(client.embeds.giveaway.description.replace("<reward>", gwObject.prize)
      .replace("<hoster>", `<@${gwObject.hostedBy}>`)
      .replace("<remaining>", client.utils.formatTime(gwObject.endsAt - Date.now()))
      .replace("<winnerCount>", gwObject.winnerCount)
      .replace("<requirements>", reqContent))
    .setColor(client.embeds.giveaway.color)
    .setThumbnail(message.guild.iconURL());

  if(client.embeds.giveaway.footer == true) startEmbed.setFooter({ text: client.language.giveaway.embed.ends, iconURL: client.user.displayAvatarURL() }).setTimestamp(gwObject.endsAt);

  let channel = client.channels.cache.get(gwObject.channelID);
  
  let customEmoji = client.config.emojis.giveaway.react;

  let m = await channel.send({embeds: [startEmbed]});
  await m.react(customEmoji);
    
  gwObject.messageID = m.id;
  await db.push(`giveaways_${message.guild.id}`, gwObject);
}

const editGiveaway = async (client, message, messageID, guild, msgReq, invReq, winners, ending, prize) => {
  let giveaways = await db.get(`giveaways_${message.guild.id}`);
  let gwData = giveaways.find(g => g.messageID == messageID && g.ended == false);
  
  let channel = client.channels.cache.get(gwData.channelID);
  let msg = await channel.messages.fetch({ message: gwData.messageID });
  
  if(ending != 0 && ending != "none") ending = ms(ending);
  
  if(msgReq == "none" || msgReq == 0) msgReq = 0;
  if(invReq == "none" || invReq == 0) invReq = 0;
  if(winners == "none" || winners == 0) winners = gwData.winnerCount;
  if(prize == "none" || prize == 0) prize = gwData.prize;
  
  if(ending == "none" || ending == 0) { 
    ending = gwData.endsAt;
  } else {
    ending = gwData.endsAt + ending;
  }
  
  let newObject = client.utils.giveawayObject(
    gwData.guildID,
    gwData.messageID,
    gwData.duration,
    gwData.channelID,
    winners,
    msgReq,
    invReq,
    ending,
    gwData.hostedBy,
    prize
  );

  const newData = giveaways.filter((giveaway) => giveaway.messageID != gwData.messageID);

  newData.push(newObject);

  await db.set(`giveaways_${guild.id}`, newData);
  
  setTimeout(async() => {
    await client.gw.checkGiveaway(client, message.guild);
  }, 1000);
}

const endGiveaway = async (client, message, messageID, guild) => {
  let giveaways = await db.get(`giveaways_${message.guild.id}`);
  let gwData = giveaways.find(g => g.messageID == messageID && g.ended == false);
  
  let channel = client.channels.cache.get(gwData.channelID);
  let msg = await channel.messages.fetch({ message: gwData.messageID });
    
  let customEmoji = client.config.emojis.giveaway.react;
  let rUsers = await msg.reactions.cache.get(customEmoji).users.fetch();
  let rFilter = rUsers.filter(r => !r.bot);

  let rArray = [...rFilter.values()];
  let randomWinner;
  let winners = [];
  
  for(let j = 0; j < gwData.winnerCount 
  ; j++) {
    if(gwData.winnerCount > 1 && rArray.length < 2) {
      randomWinner = rArray[0];
      winners.push(randomWinner);
      rArray.splice(rArray.indexOf(randomWinner), 1);
      break;
    } else {
      randomWinner = rArray[~~(Math.random() * rArray.length)]; 
      winners.push(randomWinner);
      rArray.splice(rArray.indexOf(randomWinner), 1);
    }
  }

  let newObject = client.utils.giveawayObject(
    gwData.guildID,
    gwData.messageID,
    client.language.giveaway.embed.ended,
    gwData.channelID,
    gwData.winnerCount,
    gwData.requirements.messagesReq,
    gwData.requirements.invitesReq,
    client.language.giveaway.embed.ended,
    gwData.hostedBy,
    gwData.prize
  );
  newObject.winners.push(winners);
  newObject.ended = true;

  const newData = giveaways.filter((giveaway) => giveaway.messageID != gwData.messageID);

  newData.push(newObject);

  await db.set(`giveaways_${guild.id}`, newData);

  let reqContent = "";
  if (gwData.requirements.messagesReq > 0 || gwData.requirements.invitesReq > 0) reqContent += client.language.giveaway.embed.requirements;
  if (gwData.requirements.messagesReq > 0) reqContent += client.language.giveaway.embed.messages.replace("<messages>", gwData.requirements.messagesReq);
  if (gwData.requirements.invitesReq > 0) reqContent += client.language.giveaway.embed.invites.replace("<invites>", gwData.requirements.invitesReq);
  
  let editEmbed = new Discord.EmbedBuilder()
    .setAuthor({ name: client.language.giveaway.titles.ended, iconURL: client.user.displayAvatarURL() })
    .setDescription(client.embeds.giveaway.endDescription.replace("<reward>", gwData.prize)
      .replace("<hoster>", `<@${gwData.hostedBy}>`)
      .replace("<remaining>", client.language.giveaway.embed.ended)
      .replace("<winnerCount>", gwData.winnerCount)
      .replace("<winners>", randomWinner ? winners : client.language.giveaway.embed.without_winners)
      .replace("<requirements>", reqContent))
    .setColor(client.embeds.error_color)
    .setThumbnail(guild.iconURL());

  if(client.embeds.giveaway.footer == true) editEmbed.setFooter({ text: client.language.giveaway.embed.ended, iconURL: client.user.displayAvatarURL() }).setTimestamp(gwData.endsAt);

  msg.edit({ embeds: [editEmbed] });

  let hasWinners = client.language.giveaway.embed.winners_yes.replace("<winners>", winners);
  let noWinners = client.language.giveaway.embed.winners_no.replace("<winners>", winners);

  let endEmbed = new Discord.EmbedBuilder()
    .setTitle(client.language.giveaway.titles.giveaway)
    .setDescription(`${randomWinner ? hasWinners : noWinners}`)
    .setColor(client.embeds.general_color);
  
  channel.send({ embeds: [endEmbed] });
}

const rerollGiveaway = async (client, message, messageID) => {
  let giveaways = await db.get(`giveaways_${message.guild.id}`);
  let gwData = giveaways.find(g => g.messageID == messageID && g.ended == true);
  
  let channel = client.channels.cache.get(gwData.channelID);
  let msg = await channel.messages.fetch({ message: gwData.messageID });
    
  let customEmoji = client.config.emojis.giveaway.react;
  let rUsers = await msg.reactions.cache.get(customEmoji).users.fetch();
  let rFilter = rUsers.filter(r => !r.bot);

  let rArray = [...rFilter.values()];
  let winners = [];
  
  for(let i = 0; i < gwData.winnerCount; i++) {
    if(gwData.winnerCount > 1 && rArray.length < 2) {
      randomWinner = rArray[0];
      winners.push(randomWinner);
      rArray.splice(rArray.indexOf(randomWinner), 1);
      break;
    } else {
      randomWinner = rArray[~~(Math.random() * rArray.length)]; 
      winners.push(randomWinner);
      rArray.splice(rArray.indexOf(randomWinner), 1);
    }
  }
  
  let winnerString = client.language.giveaway.reroll.replace("<winners>", winners);
      
  let rerollEmbed = new Discord.EmbedBuilder()
    .setTitle(client.language.giveaway.titles.giveaway)
    .setDescription(`${winnerString}`)
    .setColor(client.embeds.general_color);
  
  channel.send({ embeds: [rerollEmbed] })
}

const checkGiveaway = async (client, guild) => {
  let giveaways = await db.get(`giveaways_${guild.id}`) || [];
  if(giveaways == null) return;
  if(giveaways.length == 0) return;
  
  for(let i = 0; i < giveaways.length; i++) {
    if(giveaways[i].ended == true) continue;
    
    let removed = false;
    let channel = client.channels.cache.get(giveaways[i].channelID);
    if(channel == undefined) {
      const cData = giveaways[i].filter((giveaway) => giveaway.messageID != giveaways[i].messageID);
      await db.set(`giveaways_${giveaways[i].guildID}`, cData);
      removed = true;
    }
    
    let msg = await channel.messages.fetch({ message: giveaways[i].messageID }).catch(async (err) => {
      const mData = giveaways.filter((giveaway) => giveaway.messageID != giveaways[i].messageID);
      await db.set(`giveaways_${giveaways[i].guildID}`, mData);
      removed = true;
    });
    
    if(removed == true) continue;
    
    let customEmoji = client.config.emojis.giveaway.react
    let rUsers = await msg.reactions.cache.get(customEmoji).users.fetch();
    let rFilter = rUsers.filter(r => !r.bot);
    let rArray = [...rFilter.values()];
    let randomWinner;
    let winners = [];
    
    if(Date.now() > giveaways[i].endsAt) {
      for(let j = 0; j < giveaways[i].winnerCount; j++) {
        if(giveaways[i].winnerCount > 1 && rArray.length < 2) {
          randomWinner = rArray[0];
          winners.push(randomWinner);
          rArray.splice(rArray.indexOf(randomWinner), 1);
          break;
        } else {
          randomWinner = rArray[~~(Math.random() * rArray.length)]; 
          winners.push(randomWinner);
          rArray.splice(rArray.indexOf(randomWinner), 1);
        }
      }
      
      let newObject = client.utils.giveawayObject(
        giveaways[i].guildID,
        giveaways[i].messageID, 
        client.language.giveaway.embed.ended, 
        giveaways[i].channelID, 
        giveaways[i].winnerCount, 
        giveaways[i].requirements.messagesReq, 
        giveaways[i].requirements.invitesReq, 
        client.language.giveaway.embed.ended, 
        giveaways[i].hostedBy, 
        giveaways[i].prize
      );
      newObject.winners.push(winners);
      newObject.ended = true;
      
      const newData = giveaways.filter((giveaway) => giveaway.messageID != giveaways[i].messageID);
      
      newData.push(newObject);
      
      await db.set(`giveaways_${guild.id}`, newData);
      
      let reqContent = "";
      if(giveaways[i].requirements.messagesReq > 0 || giveaways[i].requirements.invitesReq > 0) reqContent += client.language.giveaway.embed.requirements;
      if(giveaways[i].requirements.messagesReq > 0) reqContent += client.language.giveaway.embed.messages.replace("<messages>", giveaways[i].requirements.messagesReq);
      if(giveaways[i].requirements.invitesReq > 0) reqContent += client.language.giveaway.embed.invites.replace("<invites>", giveaways[i].requirements.invitesReq);
      
      let editEmbed = new Discord.EmbedBuilder()
        .setAuthor({ name: client.language.giveaway.titles.ended, iconURL: client.user.displayAvatarURL() })
        .setDescription(client.embeds.giveaway.endDescription.replace("<reward>", giveaways[i].prize)
          .replace("<hoster>", `<@${giveaways[i].hostedBy}>`)
          .replace("<remaining>", client.language.giveaway.embed.ended)
          .replace("<winnerCount>", giveaways[i].winnerCount)
          .replace("<winners>", randomWinner ? winners : client.language.giveaway.embed.without_winners)
          .replace("<requirements>", reqContent))
        .setColor(client.embeds.error_color)
        .setThumbnail(guild.iconURL());
    
      if(client.embeds.giveaway.footer == true) editEmbed.setFooter({ text: client.language.giveaway.embed.ended, iconURL: client.user.displayAvatarURL() }).setTimestamp(giveaways[i].endsAt);

      msg.edit({ embeds: [editEmbed] });
      
      let hasWinners = client.language.giveaway.embed.winners_yes.replace("<winners>", winners);
      let noWinners = client.language.giveaway.embed.winners_no.replace("<winners>", winners);
    
      let endEmbed = new Discord.EmbedBuilder()
        .setTitle(client.language.giveaway.titles.giveaway)
        .setDescription(`${randomWinner ? hasWinners : noWinners}`)
        .setColor(client.embeds.general_color);
      
      channel.send({ embeds: [endEmbed] });
    } else {
      let reqContent = "";
      if(giveaways[i].requirements.messagesReq > 0 || giveaways[i].requirements.invitesReq > 0) reqContent += client.language.giveaway.embed.requirements;
      if(giveaways[i].requirements.messagesReq > 0) reqContent += client.language.giveaway.embed.messages.replace("<messages>", giveaways[i].requirements.messagesReq);
      if(giveaways[i].requirements.invitesReq > 0) reqContent += client.language.giveaway.embed.invites.replace("<invites>", giveaways[i].requirements.invitesReq);

      let embedChange = new Discord.EmbedBuilder()
        .setAuthor({ name: client.language.giveaway.titles.giveaway, iconURL: client.user.displayAvatarURL() })
        .setDescription(client.embeds.giveaway.description.replace("<reward>", giveaways[i].prize)
          .replace("<hoster>", `<@${giveaways[i].hostedBy}>`)
          .replace("<remaining>", client.utils.formatTime(giveaways[i].endsAt - Date.now()))
          .replace("<winnerCount>", giveaways[i].winnerCount)
          .replace("<requirements>", reqContent))
        .setColor(client.embeds.giveaway.color)
        .setThumbnail(guild.iconURL());

      if(client.embeds.giveaway.footer == true) embedChange.setFooter({ text: client.language.giveaway.embed.ends, iconURL: client.user.displayAvatarURL() }).setTimestamp(giveaways[i].endsAt);

      msg.edit({ embeds: [embedChange] });
    }
  } 
}

module.exports = {
  startGiveaway,
  checkGiveaway, 
  endGiveaway,
  editGiveaway, 
  rerollGiveaway,
}
