const Command = require("../../structures/Command");
const Discord = require("discord.js");

module.exports = class Ping extends Command {
  constructor(client) {
    super(client, {
      name: "ping",
      description: client.cmdConfig.ping.description,
      usage: client.cmdConfig.ping.usage,
      permissions: client.cmdConfig.ping.permissions,
      aliases: client.cmdConfig.ping.aliases,
      category: "member",
      listed: client.cmdConfig.ping.enabled,
      slash: true,
    });
  }

  async run(message, args) {
    let embed = new Discord.EmbedBuilder()
      .setTitle(this.client.config.general.name)
      .setDescription(this.client.language.general.ping_loading)
      .setColor(this.client.embeds.general_color);

    const m = await message.channel.send({ embeds: [embed] });
  
    let embedEdit = new Discord.EmbedBuilder()
      .setTitle(this.client.config.general.name)
      .setDescription(this.client.language.general.ping.replace("<uptime>", this.client.utils.formatTime(this.client.uptime))
        .replace("<bot>", m.createdTimestamp - message.createdTimestamp)
        .replace("<api>", this.client.ws.ping))
      .setColor(this.client.embeds.general_color);

    m.edit({ embeds: [embedEdit] });
  }
  async slashRun(interaction, args) {
    let embed = new Discord.EmbedBuilder()
      .setTitle(this.client.config.general.name)
      .setDescription(this.client.language.general.ping_loading)
      .setColor(this.client.embeds.general_color);

    const m = await interaction.reply({ embeds: [embed] });

    let embedEdit = new Discord.EmbedBuilder()
      .setTitle(this.client.config.general.name)
      .setDescription(this.client.language.general.ping.replace("<uptime>", this.client.utils.formatTime(this.client.uptime))
        .replace("<bot>", m.createdTimestamp - interaction.createdTimestamp)
        .replace("<api>", this.client.ws.ping))
      .setColor(this.client.embeds.general_color);

    m.edit({ embeds: [embedEdit] });
  }
};
