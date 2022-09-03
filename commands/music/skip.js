const Command = require("../../structures/Command");
let { EmbedBuilder } = require("discord.js");

module.exports = class Skip extends Command {
	constructor(client) {
		super(client, {
			name: "skip",
			description: client.cmdConfig.skip.description,
			usage: client.cmdConfig.skip.usage,
			permissions: client.cmdConfig.skip.permissions,
      aliases: client.cmdConfig.skip.aliases,
			category: "music",
			listed: client.cmdConfig.skip.enabled,
      slash: true,
		});
	}

  async run(message, args) {
    const queue = this.client.player.getQueue(message.guild.id);

    if (!queue || !queue.playing)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)] });

    if (queue.tracks.length < 1 && queue.repeatMode !== 3)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.music.empty, this.client.embeds.error_color)] });

    queue.skip();

    message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, "Music", this.client.language.music.skipped, "Yellow")] });
  }

  async slashRun(interaction, args) {
    const queue = this.client.player.getQueue(interaction.guild.id);

    if (!queue || !queue.playing)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.skip.ephemeral });

    if (queue.tracks.length < 1 && queue.repeatMode !== 3)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.music.empty, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.skip.ephemeral });

    queue.skip();

    interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, "Music", this.client.language.music.skipped, "Yellow")], ephemeral: this.client.cmdConfig.skip.ephemeral });
  }
};
