const Command = require("../../structures/Command");
let { EmbedBuilder } = require("discord.js");

module.exports = class Shuffle extends Command {
	constructor(client) {
		super(client, {
			name: "shuffle",
			description: client.cmdConfig.shuffle.description,
			usage: client.cmdConfig.shuffle.usage,
			permissions: client.cmdConfig.shuffle.permissions,
      aliases: client.cmdConfig.shuffle.aliases,
			category: "music",
			listed: client.cmdConfig.shuffle.enabled,
      slash: true,
		});
	}

  async run(message, args) {
    const queue = this.client.player.getQueue(message.guild.id);

    if (!queue || !queue.playing)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)] });

    if (queue.tracks.length < 3)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.music.need_three, this.client.embeds.error_color)] });

    queue.shuffle();

    message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, "Music", this.client.language.music.shuffled, "Yellow")] });
  }

  async slashRun(interaction, args) {
    const queue = this.client.player.getQueue(interaction.guild.id);

    if (!queue || !queue.playing)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.shuffle.ephemeral });

    if (queue.tracks.length < 3)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.music.need_three, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.shuffle.ephemeral });

    queue.shuffle();

    interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, "Music", this.client.language.music.shuffled, "Yellow")], ephemeral: this.client.cmdConfig.shuffle.ephemeral });
  }
};
