const Command = require("../../structures/Command");
let { EmbedBuilder } = require("discord.js");

module.exports = class Stop extends Command {
	constructor(client) {
		super(client, {
			name: "stop",
			description: client.cmdConfig.stop.description,
			usage: client.cmdConfig.stop.usage,
			permissions: client.cmdConfig.stop.permissions,
      aliases: client.cmdConfig.stop.aliases,
			category: "music",
			listed: client.cmdConfig.stop.enabled,
      slash: true,
		});
	}

  async run(message, args) {
    const queue = this.client.player.getQueue(message.guild.id);

    if (!queue || !queue.playing)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)] });

    queue.stop();

    message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, "Music", this.client.language.music.stopped, "Yellow")] });
  }

  async slashRun(interaction, args) {
    const queue = this.client.player.getQueue(interaction.guild.id);

    if (!queue || !queue.playing)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.stop.ephemeral });

    queue.stop();

    interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, "Music", this.client.language.music.stopped, "Yellow")], ephemeral: this.client.cmdConfig.stop.ephemeral });
  }
};
