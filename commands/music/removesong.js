const Command = require("../../structures/Command");
let { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");

module.exports = class RemoveSong extends Command {
	constructor(client) {
		super(client, {
			name: "removesong",
			description: client.cmdConfig.removesong.description,
			usage: client.cmdConfig.removesong.usage,
			permissions: client.cmdConfig.removesong.permissions,
      aliases: client.cmdConfig.removesong.aliases,
			category: "music",
			listed: client.cmdConfig.removesong.enabled,
      slash: true,
      options: [{
        name: "number",
        type: ApplicationCommandOptionType.Number,
        description: "ID of Song which to Remove",
        required: false
      }]
		});
	}

  async run(message, args) {
    let id = args[0];
    if(!id || isNaN(id)) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.removesong.usage)] });

    const queue = this.client.player.getQueue(message.guild.id);

    if (!queue || !queue.playing)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)] });

    if (queue.tracks.length < 1)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)] });

    const number = (id - 1);

    if (!number || number < 0 || number > queue.tracks.length || !queue.tracks[number])
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.music.cannot_find, this.client.embeds.error_color)] });

    queue.remove(number);

    message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, "Music", this.client.language.music.removed.replace("<number>", number), "Yellow")] });
  }

  async slashRun(interaction, args) {
    let id = interaction.options.getNumber("number");

    const queue = this.client.player.getQueue(interaction.guild.id);

    if (!queue || !queue.playing)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.removesong.ephemeral });

    if (queue.tracks.length < 1)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.removesong.ephemeral });

    const number = (id - 1);

    if (!number || number < 0 || number > queue.tracks.length || !queue.tracks[number])
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.music.cannot_find, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.removesong.ephemeral });

    queue.remove(number);

    interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, "Music", this.client.language.music.removed.replace("<number>", number), "Yellow")], ephemeral: this.client.cmdConfig.removesong.ephemeral });
  }
};
