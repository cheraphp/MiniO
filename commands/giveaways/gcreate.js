const Command = require("../../structures/Command");
const Discord = require('discord.js');

module.exports = class GiveawayCreate extends Command {
	constructor(client) {
		super(client, {
			name: "gcreate",
			description: client.cmdConfig.gcreate.description,
			usage: client.cmdConfig.gcreate.usage,
			permissions: client.cmdConfig.gcreate.permissions,
			aliases: client.cmdConfig.gcreate.aliases,
			category: "giveaway",
			listed: client.cmdConfig.gcreate.enabled,
			slash: true,
		});
	}
    
  async run(message, args) {
    let embed = new Discord.EmbedBuilder()
      .setColor(this.client.embeds.general_color)
      .setAuthor({ name: this.client.language.giveaway.titles.setup, iconURL: this.client.user.displayAvatarURL() });

    if(this.client.gwCreation.get(message.author.id) == true) return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.giveaway.create.already_started, this.client.embeds.error_color)] });

    let filter = m => m.author.id === message.author.id;
    this.client.setupUtils.durationSetup(this.client, message, embed, filter);
    this.client.gwCreation.set(message.author.id, true);
  }

  async slashRun(interaction, args) {
    let embed = new Discord.EmbedBuilder()
      .setColor(this.client.embeds.general_color)
      .setAuthor({ name: this.client.language.giveaway.titles.setup, iconURL: this.client.user.displayAvatarURL() });

    if(this.client.gwCreation.get(interaction.user.id) == true) return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.giveaway.create.already_started, this.client.embeds.error_color)] });

    let filter = m => m.author.id === interaction.user.id;
    await interaction.deferReply();
    this.client.setupUtils.durationSetup(this.client, interaction, embed, filter);
    this.client.gwCreation.set(interaction.user.id, true);
  }
};
