const Command = require("../../structures/Command");
let { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { QueueRepeatMode } = require("discord-player");

module.exports = class Loop extends Command {
	constructor(client) {
		super(client, {
			name: "loop",
			description: client.cmdConfig.queue.description,
			usage: client.cmdConfig.queue.usage,
			permissions: client.cmdConfig.queue.permissions,
      aliases: client.cmdConfig.queue.aliases,
			category: "music",
			listed: client.cmdConfig.queue.enabled,
      slash: true,
      options: [{
        name: "type",
        type: ApplicationCommandOptionType.String,
        description: "What to loop",
        required: false,
        choices: [
          {
            name: "Turn Off",
            value: "off"
          },
          {
            name: "Song",
            value: "song"
          },
          {
            name: "Queue",
            value: "queue"
          }
        ]
      }]
		});
	}
  
  async run(message, args) {
    let type = args[0];
    if(!type || (type != "off" && type != "song" && type != "queue")) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.queue.usage)] });
    const queue = this.client.player.getQueue(message.guild.id);
  
    if (!queue || !queue.playing)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)] });
  
    let current = "none";
    if (queue.repeatMode == 2) {
      current = "queue";
    } else if (queue.repeatMode == 1) {
      current = "song";
    } else if (queue.repeatMode == 0) {
      current = "off";
    }
  
    if(!type) message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, "Music", this.client.language.music.queue.status.replace("<status>", current), "Yellow")] });
  
    switch (type) {
      case "off":
        queue.setRepeatMode(QueueRepeatMode.OFF);
        message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, "Music", this.client.language.music.queue.loop_disabled, "Yellow")] });
        break;
      case "song":
        queue.setRepeatMode(QueueRepeatMode.TRACK);
        message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, "Music", this.client.language.music.queue.song_loop, "Yellow")] });
        break;
      case "queue":
        queue.setRepeatMode(QueueRepeatMode.QUEUE);
        message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, "Music", this.client.language.music.queue.queue_loop, "Yellow")] });
        break;
      default:
        message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, "Music", this.client.language.music.queue.status.replace("<status>", current), "Yellow")] });
    }
  }
  
  async slashRun(interaction, args) {
    let type = interaction.options.getString("type");
    const queue = this.client.player.getQueue(interaction.guild.id);

    if (!queue || !queue.playing)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.music.no_song, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.queue.ephemeral });

    let current = "none";
    if (queue.repeatMode == 2) {
      current = "queue";
    } else if (queue.repeatMode == 1) {
      current = "song";
    } else if (queue.repeatMode == 0) {
      current = "off";
    }

    if(!type) interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, "Music", this.client.language.music.queue.status.replace("<status>", current), "Yellow")], ephemeral: this.client.cmdConfig.queue.ephemeral });

    switch (type) {
      case "off":
        queue.setRepeatMode(QueueRepeatMode.OFF);
        interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, "Music", this.client.language.music.queue.loop_disabled, "Yellow")], ephemeral: this.client.cmdConfig.queue.ephemeral });
        break;
      case "song":
        queue.setRepeatMode(QueueRepeatMode.TRACK);
        interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, "Music", this.client.language.music.queue.song_loop, "Yellow")], ephemeral: this.client.cmdConfig.queue.ephemeral });
        break;
      case "queue":
        queue.setRepeatMode(QueueRepeatMode.QUEUE);
        interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, "Music", this.client.language.music.queue.queue_loop, "Yellow")], ephemeral: this.client.cmdConfig.queue.ephemeral });
        break;
      default:
        interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, "Music", this.client.language.music.queue.status.replace("<status>", current), "Yellow")], ephemeral: this.client.cmdConfig.queue.ephemeral });
    }
  }
};
