const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

const manageLeveling = async (client, message) => {
  if(!client.talkedRecently.has(message.author.id)) {
    client.talkedRecently.add(message.author.id);
    setTimeout(() => {
      client.talkedRecently.delete(message.author.id);
    }, client.config.plugins.leveling.cooldown * 1000);

    const xp = parseInt(await db.get(`xp_${message.guild.id}_${message.author.id}`));
    const level = parseInt(await db.get(`level_${message.guild.id}_${message.author.id}`));
    const xpGive = Math.floor(Math.random() * (50 - 30 + 1) + 30); 
    
    const nextLevel = parseInt(level) + 1;
    const xpNeeded = nextLevel * 2 * 250 + 250;

    if (xp + xpGive >= xpNeeded) {
      const embed = new Discord.EmbedBuilder()
        .setDescription(client.language.member.levelup.replace("<user>", message.author.username)
          .replace("<level>", nextLevel))
        .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp()
        .setColor(client.embeds.general_color);

      if(client.language.titles.levelup) embed.setTitle(client.language.titles.levelup);

      message.channel.send({ embeds: [embed] });
      if(xp + xpGive > xpNeeded) {
        await db.set(`xp_${message.guild.id}_${message.author.id}`, xp - (xpNeeded - xpGive));
        await db.add(`level_${message.guild.id}_${message.author.id}`, 1);
      } else {
        await db.set(`xp_${message.guild.id}_${message.author.id}`, 0);
        await db.add(`level_${message.guild.id}_${message.author.id}`, 1);
      }
      let rLevel = await db.get(`level_${message.guild.id}_${message.author.id}`);
      if(client.config.roles.leveling.enabled == true) {
        for(let i = 0; i < Object.keys(client.config.roles.leveling.list).length; i++) {
          if(Object.keys(client.config.roles.leveling.list)[i] == rLevel) return message.member.roles.add(Object.values(client.config.roles.leveling.list)[i]);
        }
      }
    } else {
      if(!message.author.bot) {
        await db.add(`xp_${message.guild.id}_${message.author.id}`, xpGive);
      }
    }
  }
}

module.exports = {
  manageLeveling,
}
