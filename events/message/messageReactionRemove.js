const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const Event = require("../../structures/Events");

module.exports = class MessageReactionRemove extends Event {
	constructor(...args) {
		super(...args);
	}

	async run(reaction, user) {
    const message = reaction.message;
    if(reaction.partial) await reaction.fetch();
    if(reaction.message.partial) await reaction.message.fetch();
    if(user.partial) await user.fetch();
    if(message.channel.type === Discord.ChannelType.DM) return;

    if(this.client.config.plugins.reaction_roles.enabled == true) {
      let data = await db.get(`reactionRoles_${message.guild.id}`) || [];
      data = data.find((d) => d.message == message.id);
      if(data) {
        let findReaction = this.client.config.plugins.reaction_roles.list.find((r) => r.id == data.id) || undefiend;
        if(findReaction) {
          for(let i = 0; i < Object.keys(findReaction.roles).length; i++) {
            if(Object.keys(findReaction.roles[i])[0] == reaction.emoji.name && data.message == reaction.message.id) {
              return reaction.message.guild.members.cache.get(user.id).roles.remove(Object.values(findReaction.roles[i])[0]);
            }
          }
        }
      }
    }

    if (reaction.emoji.name !== "⭐") return;

    const channel = this.client.utils.findChannel(message.guild, this.client.config.channels.starboard);
    if(!channel) return;
    const fetchedMessages = await channel.messages.fetch({ limit: 100 });
    const stars = fetchedMessages.find(m => m.embeds[0] && m.embeds[0].footer.text.endsWith(message.id));
    if (stars) {
      const r = await reaction.message.reactions.resolve("⭐");
      const foundStar = stars.embeds[0];
      const star = /([0-9]{1,3})/.exec(stars.embeds[0].author.name);
      const msg = await message.fetch();
      const image = message.attachments.size > 0 ? await extension(reaction, [...message.attachments.values()][0].url) : msg.content.match(/([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif))/i) ? msg.content.match(/([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif))/i)[0] : "";
      const desc = foundStar.description ? foundStar.description : " ";
      const embed = new Discord.EmbedBuilder()
        .setColor(this.client.embeds.general_color)
        .setAuthor({ name: this.client.language.general.starboard.author.replace("<user>", message.author.username)
          .replace("<stars>", `${parseInt(star[1]) - 1}`), iconURL: message.author.displayAvatarURL({ size: 1024, dynamic: true }) }) 
        .setDescription(desc)
        .setURL(message.url)
        .setTimestamp()
        .setFooter({ text: this.client.language.general.starboard.footer + `${message.id}` })
        .setImage(image);
      const starMsg = await channel.messages.cache.find(s => s.id === stars.id);
      await starMsg.edit({ embeds: [embed] });
      if (parseInt(star[1]) - 1 <= 0) return starMsg.delete();
    }
    async function extension(reaction, attachment) {
      const imageLink = attachment.split(".");
      const typeOfImage = imageLink[imageLink.length - 1];
      const image = /(jpg|jpeg|png|gif)/gi.test(typeOfImage);
      if (!image) return "";
      return attachment;
    }
  } 
};
