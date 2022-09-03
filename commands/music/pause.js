const Command = require("../../structures/Command");
let { EmbedBuilder } = require("discord.js");

module.exports = class Pause extends Command {
	constructor(client) {
		super(client, {
			name: "pause",
			description: client.cmdConfig.pause.description,
			usage: client.cmdConfig.pause.usage,
			permissions: client.cmdConfig.pause.permissions,
      aliases: client.cmdConfig.pause.aliases,
			category: "music",
			listed: client.cmdConfig.pause.enabled,
      slash: true,
		});
	}

  async run(message, args) {
    const queue = this.client.player.getQueue(message.guild.id);

    if (!queue || !queue.playing)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)] });

    if (queue.connection.paused)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.music.already_paused, this.client.embeds.error_color)] });

    queue.setPaused(true);

    message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, "Music", this.client.language.music.paused, "Yellow")] });
  }
  async slashRun(interaction, args) {
    const queue = this.client.player.getQueue(interaction.guild.id);

    if (!queue || !queue.playing)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.pause.ephemeral });

    if (queue.connection.paused)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.music.already_paused, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.pause.ephemeral });

    queue.setPaused(true);

    interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, "Music", this.client.language.music.paused, "Yellow")], ephemeral: this.client.cmdConfig.pause.ephemeral });
  }
};
