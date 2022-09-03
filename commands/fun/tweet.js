const Command = require("../../structures/Command");
const Discord = require("discord.js");
const axios = require("axios");

module.exports = class Tweet extends Command {
  constructor(client) {
    super(client, {
      name: "tweet",
      description: client.cmdConfig.tweet.description,
      usage: client.cmdConfig.tweet.usage,
      permissions: client.cmdConfig.tweet.permissions,
      aliases: client.cmdConfig.tweet.aliases,
      category: "fun",
      listed: client.cmdConfig.eightball.enabled,
      slash: true,
      options: [{
        name: "username",
        type: Discord.ApplicationCommandOptionType.String,
        description: "Username to tweet as",
        required: true,
      },{
        name: "text",
        type: Discord.ApplicationCommandOptionType.String,
        description: "Text to write",
        required: true,
      }]
    });
  }

  async run(message, args) {
    const config = this.client.config;
    let username = args[0];
    let text = args.slice(1).join(" ");

    if(!username) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.tweet.usage)] });
    if(!text || text.length < 6) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.tweet.usage)] });

    await axios.get(`https://nekobot.xyz/api/imagegen?type=tweet&&username=${username}&&text=${text}`).then(async(resp) => {
      let embed = new Discord.EmbedBuilder()
        .setImage(resp.value.message)
        .setColor(this.client.embeds.general_color);

      message.channel.send({ embeds: [embed] });
    }).catch((err) => {
      message.channel.send({ content: "An Error Ocurred" });
    });
  }
  async slashRun(interaction, args) {
    const config = this.client.config;

    let username = args[0];
    let text = args.slice(1).join(" ");

    if(!username || !text || text.length < 6) return interaction.reply({ embeds: [this.client.utils.validUsage(this.client, interaction, this.client.cmdConfig.tweet.usage)] });

    await axios.get(`https://nekobot.xyz/api/imagegen?type=tweet&&username=${username}&&text=${text}`).then(async(resp) => {
      let embed = new Discord.EmbedBuilder()
        .setImage(resp.value.message)
        .setColor(this.client.embeds.general_color);

      interaction.reply({ embeds: [embed], ephemeral: this.client.cmdConfig.tweet.ephemeral });
    }).catch((err) => {
      interaction.reply({ content: "An Error Ocurred" });
    });
  }
};
