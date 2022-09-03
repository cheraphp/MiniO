const Command = require("../../structures/Command");
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");

module.exports = class Volume extends Command {
	constructor(client) {
		super(client, {
			name: "volume",
			description: client.cmdConfig.volume.description,
			usage: client.cmdConfig.volume.usage,
			permissions: client.cmdConfig.volume.permissions,
      aliases: client.cmdConfig.volume.aliases,
			category: "music",
			listed: client.cmdConfig.volume.enabled,
      slash: true,
      options: [{
        name: "volume",
        type: ApplicationCommandOptionType.Number,
        description: "Volume percent",
        required: false,
      }]
		});
	}

  async run(message, args) {
    let volume = args[0]

    const queue = this.client.player.getQueue(message.guild.id);

    if (!queue || !queue.playing)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)] });

    if(!volume)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, "Music", this.client.language.music.volume.current.replace("<volume>", queue.volume), "Yellow")] });

    if(isNaN(volume) || volume > 200 || volume < 0)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, "Music", this.client.language.music.volume.limit, this.client.embeds.error_color)] });

    queue.setVolume(volume);

    message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, "Music", this.client.language.music.volume.changed.replace("<volume>", volume), "Yellow")] });
  }

  async slashRun(interaction, args) {
    let volume = interaction.options.getInteger("volume");

    const queue = this.client.player.getQueue(interaction.guild.id);

    if (!queue || !queue.playing)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.volume.ephemeral });

    if(!volume)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, "Music", this.client.language.music.volume.current.replace("<volume>", queue.volume), "Yellow")], ephemeral: this.client.cmdConfig.volume.ephemeral });

    if(isNaN(volume) || volume > 200 || volume < 0)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, "Music", this.client.language.music.volume.limit, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.volume.ephemeral });

    queue.setVolume(volume);

    interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, "Music", this.client.language.music.volume.changed.replace("<volume>", volume), "Yellow")], ephemeral: this.client.cmdConfig.volume.ephemeral });
  }
};
