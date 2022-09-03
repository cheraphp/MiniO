const Discord = require('discord.js');

module.exports = (client, user, title, description, color) => {
  let embed = new Discord.EmbedBuilder().setFooter({ text: client.embeds.footer, iconURL: client.user.displayAvatarURL({ size: 1024, dynamic: true }) }).setTimestamp();
  if (title.length > 0) {
    embed.setTitle(title)
  }
  if (color.length > 0) {
    embed.setColor(color);
  }
  if (description.length > 0) {
    embed.setDescription(description);
  }
  return embed;
}
