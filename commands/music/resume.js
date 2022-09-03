const Command = require("../../structures/Command");
let { EmbedBuilder } = require("discord.js");

module.exports = class Resume extends Command {
	constructor(client) {
		super(client, {
			name: "resume",
			description: client.cmdConfig.resume.description,
			usage: client.cmdConfig.resume.usage,
			permissions: client.cmdConfig.resume.permissions,
      aliases: client.cmdConfig.resume.aliases,
			category: "music",
			listed: client.cmdConfig.resume.enabled,
      slash: true,
		});
	}

  async run(message, args) {
    const queue = this.client.player.getQueue(message.guild.id);

    if (!queue || !queue.playing)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)] });

    if (!queue.connection.paused)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.music.not_paused, this.client.embeds.error_color)] });

    queue.setPaused(false);

    message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, "Music", this.client.language.music.resumed, "Yellow")] });
  }

  async slashRun(interaction, args) {
    const queue = this.client.player.getQueue(interaction.guild.id);

    if (!queue || !queue.playing)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.resume.ephemeral });

    if (!queue.connection.paused)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.music.not_paused, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.resume.ephemeral });

    queue.setPaused(false);

    interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, "Music", this.client.language.music.resumed, "Yellow")], ephemeral: this.client.cmdConfig.resume.ephemeral });
  }
};
