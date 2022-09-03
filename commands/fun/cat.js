const Command = require("../../structures/Command");
const Discord = require("discord.js");
const fetch = require("node-fetch");

module.exports = class Cat extends Command {
  constructor(client) {
    super(client, {
      name: "cat",
      description: client.cmdConfig.cat.description,
      usage: client.cmdConfig.cat.usage,
      permissions: client.cmdConfig.cat.permissions,
      usage: client.cmdConfig.cat.usage,
      category: "fun",
      listed: client.cmdConfig.cat.enabled,
      slash: true,
    });
  }

  async run(message, args) {
    let cat = await fetch("https://api.thecatapi.com/v1/images/search").then(async(res) => await res.json());

    let embed = new Discord.EmbedBuilder()
      .setColor(this.client.embeds.general_color)
      .setImage(cat[0].url);

    message.channel.send({ embeds: [embed] });
  }

  async slashRun(interaction, args) {
    let cat = await fetch("https://api.thecatapi.com/v1/images/search").then(async(res) => await res.json());

    let embed = new Discord.EmbedBuilder()
      .setColor(this.client.embeds.general_color)
      .setImage(cat[0].url);

    interaction.reply({ embeds: [embed], ephemeral: this.client.cmdConfig.cat.ephemeral });
  }
};
