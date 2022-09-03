const Command = require("../../structures/Command");
let { EmbedBuilder } = require("discord.js");

module.exports = class NowPlaying extends Command {
	constructor(client) {
		super(client, {
			name: "nowplaying",
			description: client.cmdConfig.nowplaying.description,
			usage: client.cmdConfig.nowplaying.usage,
			permissions: client.cmdConfig.nowplaying.permissions,
      aliases: client.cmdConfig.nowplaying.aliases,
			category: "music",
			listed: client.cmdConfig.nowplaying.enabled,
      slash: true,
		});
	}

  async run(message, args) {
    const queue = this.client.player.getQueue(message.guild.id);

    if (!queue || !queue.playing)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)] });

    let embed = new EmbedBuilder()
      .setTitle("Now Playing")
      .setDescription(`[${queue.current.title}](${queue.current.url}) by **${queue.current.author}**.
**Requested by:** ${queue.current.requestedBy.toString()}

> ${queue.createProgressBar()}`)
      .setColor("Yellow")
      .setThumbnail(queue.current.thumbnail);

    message.channel.send({ embeds: [embed] });
  }

  async slashRun(interaction, args) {
    const queue = this.client.player.getQueue(interaction.guild.id);

    if (!queue || !queue.playing)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.nowplaying.ephemeral });

    let embed = new EmbedBuilder()
      .setTitle("Now Playing")
      .setDescription(`[${queue.current.title}](${queue.current.url}) by **${queue.current.author}**.
**Requested by:** ${queue.current.requestedBy.toString()}

> ${queue.createProgressBar()}`)
      .setColor("Yellow")
      .setThumbnail(queue.current.thumbnail);

    interaction.reply({ embeds: [embed], ephemeral: this.client.cmdConfig.nowplaying.ephemeral });
  }
};
