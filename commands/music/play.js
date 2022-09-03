const Command = require("../../structures/Command");
let { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");

module.exports = class Play extends Command {
	constructor(client) {
		super(client, {
			name: "play",
			description: client.cmdConfig.play.description,
			usage: client.cmdConfig.play.usage,
			permissions: client.cmdConfig.play.permissions,
      aliases: client.cmdConfig.play.aliases,
			category: "music",
			listed: client.cmdConfig.play.enabled,
      slash: true,
      options: [{
        name: "song",
        type: ApplicationCommandOptionType.String,
        description: "Song/Link to play",
        required: true
      }]
		});
	}

  async run(message, args) {
    let song = args.join(" ");
    if(!args[0]) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.play.usage)] });
  
    const guildQueue = this.client.player.getQueue(message.guild.id);
  
    const channel = message.member.voice.channel;
  
    if(!channel)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, `You aren't in Voice Channel.`, this.client.embeds.error_color)] });
  
    if(guildQueue && channel.id !== message.guild.members.me.voice.channelId)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, `I'm already playing in different voice channel.`, this.client.embeds.error_color)] });
  
    let found = await this.client.player.search(song, { requestedBy: message.author }).catch(() => {});
    if (!found || !found.tracks.length)
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, `No song were found with query \`${song}\`.`, this.client.embeds.error_color)] });
  
    let queue;
  
    let m = await message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, "Music", `Searching for \`${song}\`.`, "Yellow")] });
    
    if (guildQueue) {
      queue = guildQueue;
      queue.metadata = message;
    } else {
      queue = await this.client.player.createQueue(message.guild, {
        metadata: message
      });
    }
  
    try {
      if (!queue.connection) await queue.connect(channel);
      queue.setVolume(50);
    } catch (error) {
      this.client.player.deleteQueue(message.guild.id);
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, `I cannot join voice channel.`, this.client.embeds.error_color)] });
    }
  
    found.playlist ? queue.addTracks(found.tracks) : queue.addTrack(found.tracks[0]);
  
    if (!queue.playing) await queue.play();
    
    if(found.playlist) {
      if(queue.playing) {
        m.edit({ embeds: [ this.client.embedBuilder(this.client, message.author, "Music", this.client.language.music.play.pl_added
          .replace("<title>", found.playlist.title)
          .replace("<author>", found.playlist.author.name), "Yellow")] });
      } else {
        m.edit({ embeds: [ this.client.embedBuilder(this.client, message.author, "Music", this.client.language.music.play.pl_playing
          .replace("<title>", found.playlist.title)
          .replace("<author>", found.playlist.author.name), "Yellow")] });
      }
    } else {
      if(queue.playing) {
        m.edit({ embeds: [ this.client.embedBuilder(this.client, message.author, "Music", this.client.language.music.play.song_added
          .replace("<title>", found.tracks[0].title)
          .replace("<author>", found.tracks[0].author), "Yellow")] });
      } else {
        m.edit({ embeds: [ this.client.embedBuilder(this.client, message.author, "Music", this.client.language.music.play.song_playing
          .replace("<title>", found.tracks[0].title)
          .replace("<author>", found.tracks[0].author), "Yellow")] });
      }
    }
  }

  async slashRun(interaction, args) {
    let song = interaction.options.getString("song");

    const guildQueue = this.client.player.getQueue(interaction.guild.id);

    const channel = interaction.member.voice.channel;

    if(!channel)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, `You aren't in Voice Channel.`, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.play.ephemeral });

    if(guildQueue && channel.id !== interaction.guild.members.me.voice.channelId)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, `I'm already playing in different voice channel.`, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.play.ephemeral });

    let found = await this.client.player.search(song, { requestedBy: interaction.user }).catch(() => {});
    if (!found || !found.tracks.length)
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, `No song were found with query \`${song}\`.`, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.play.ephemeral });

    let queue;

    let m = await interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, "Music", `Searching for \`${song}\`.`, "Yellow")], ephemeral: this.client.cmdConfig.play.ephemeral });
    
    if (guildQueue) {
      queue = guildQueue;
      queue.metadata = interaction;
    } else {
      queue = await this.client.player.createQueue(interaction.guild, {
        metadata: interaction
      });
    }

    try {
      if (!queue.connection) await queue.connect(channel);
	    queue.setVolume(50);
    } catch (error) {
      this.client.player.deleteQueue(interaction.guild.id);
      return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, `I cannot join voice channel.`, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.play.ephemeral });
    }

    found.playlist ? queue.addTracks(found.tracks) : queue.addTrack(found.tracks[0]);

    if (!queue.playing) await queue.play();
    
    if(found.playlist) {
      if(queue.playing) {
        m.edit({ embeds: [ this.client.embedBuilder(this.client, interaction.user, "Music", this.client.language.music.play.pl_added
          .replace("<title>", found.playlist.title)
          .replace("<author>", found.playlist.author.name), "Yellow")] });
      } else {
        m.edit({ embeds: [ this.client.embedBuilder(this.client, interaction.user, "Music", this.client.language.music.play.pl_playing
          .replace("<title>", found.playlist.title)
          .replace("<author>", found.playlist.author.name), "Yellow")] });
      }
    } else {
      if(queue.playing) {
        m.edit({ embeds: [ this.client.embedBuilder(this.client, interaction.user, "Music", this.client.language.music.play.song_added
          .replace("<title>", found.tracks[0].title)
          .replace("<author>", found.tracks[0].author), "Yellow")] });
      } else {
        m.edit({ embeds: [ this.client.embedBuilder(this.client, interaction.user, "Music", this.client.language.music.play.song_playing
          .replace("<title>", found.tracks[0].title)
          .replace("<author>", found.tracks[0].author), "Yellow")] });
      }
    }
  }
};
