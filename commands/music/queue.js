const Command = require("../../structures/Command");
let { EmbedBuilder } = require("discord.js");

module.exports = class Queue extends Command {
	constructor(client) {
		super(client, {
			name: "queue",
			description: client.cmdConfig.queue.description,
			usage: client.cmdConfig.queue.usage,
			permissions: client.cmdConfig.queue.permissions,
      aliases: client.cmdConfig.queue.aliases,
			category: "music",
			listed: client.cmdConfig.queue.enabled,
      slash: true,
		});
	}

  async run(message, args) {
    const queue = this.client.player.getQueue(message.guild.id);

    if (!queue || !queue.playing)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)] });

    if (!queue.tracks.length)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.music.empty, this.client.embeds.error_color)] });

    const currentTrack = queue.current;
    const tracks = queue.tracks.slice(0, 10).map((m, i) => {
        return `\`#${i + 1}\` **${m.title}** | ${currentTrack.requestedBy.toString()} ([Song](${m.url}))`;
    });

    let embed = new EmbedBuilder()
      .setTitle("Queue")
      .setDescription(`${tracks.join("\n")}${
        queue.tracks.length > tracks.length
            ? `\n...${queue.tracks.length - tracks.length === 1 ? `${queue.tracks.length - tracks.length} more song` : `${queue.tracks.length - tracks.length} more songs`}`
            : ""
      }`)
      .setColor("Yellow");

    message.channel.send({ embeds: [embed] });
  }

  async slashRun(interaction, args) {
    const queue = this.client.player.getQueue(interaction.guild.id);

    if (!queue || !queue.playing)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.queue.ephemeral });

    if (!queue.tracks.length)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.music.empty, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.queue.ephemeral });

    const currentTrack = queue.current;
    const tracks = queue.tracks.slice(0, 10).map((m, i) => {
        return `\`#${i + 1}\` **${m.title}** | ${currentTrack.requestedBy.toString()} ([Song](${m.url}))`;
    });

    let embed = new EmbedBuilder()
      .setTitle("Queue")
      .setDescription(`${tracks.join("\n")}${
        queue.tracks.length > tracks.length
            ? `\n...${queue.tracks.length - tracks.length === 1 ? `${queue.tracks.length - tracks.length} more song` : `${queue.tracks.length - tracks.length} more songs`}`
            : ""
      }`)
      .setColor("Yellow");

    interaction.reply({ embeds: [embed], ephemeral: this.client.cmdConfig.queue.ephemeral });
  }
};
