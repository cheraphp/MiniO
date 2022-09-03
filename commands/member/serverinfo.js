const Command = require("../../structures/Command");
let { EmbedBuilder } = require("discord.js");

module.exports = class ServerInfo extends Command {
	constructor(client) {
		super(client, {
			name: "serverinfo",
			description: client.cmdConfig.serverinfo.description,
			usage: client.cmdConfig.serverinfo.usage,
			permissions: client.cmdConfig.serverinfo.permissions,
      aliases: client.cmdConfig.serverinfo.aliases,
			category: "member",
			listed: client.cmdConfig.serverinfo.enabled,
      slash: true,
		});
	}

  async run(message, args) {
    let embed = new EmbedBuilder()
      .setColor(this.client.embeds.serverInfo.color);
    if(this.client.embeds.serverInfo.title) embed.setTitle(this.client.embeds.serverInfo.title);
    
    if(this.client.embeds.serverInfo.description) embed.setDescription(this.client.embeds.serverInfo.description.replace("<name>", message.guild.name)
      .replace("<id>", message.guild.id)
      .replace("<createdAt>", message.guild.createdAt.toLocaleString())
      .replace("<channels>", message.guild.channels.cache.size)
      .replace("<roles>", message.guild.roles.cache.size)
      .replace("<bots>", message.guild.members.cache.filter(m => m.user.bot).size)
      .replace("<members>", message.guild.members.cache.size));
    
    let field = this.client.embeds.serverInfo.fields;
    for(let i = 0; i < this.client.embeds.serverInfo.fields.length; i++) {
      embed.addFields([{ name: field[i].title, value: field[i].description.replace("<name>", message.guild.name)
        .replace("<id>", message.guild.id)
        .replace("<createdAt>", message.guild.createdAt.toLocaleString())
        .replace("<channels>", message.guild.channels.cache.size)
        .replace("<roles>", message.guild.roles.cache.size)
        .replace("<bots>", message.guild.members.cache.filter(m => m.user.bot).size)
        .replace("<members>", message.guild.members.cache.size), inline: true }]);
    }
    
    if(this.client.embeds.serverInfo.footer == true ) embed.setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() }).setTimestamp();
    if(this.client.embeds.serverInfo.thumbnail == true) embed.setThumbnail(message.guild.iconURL());

    message.channel.send({ embeds: [embed] });
  }

  async slashRun(interaction, args) {
    let embed = new EmbedBuilder()
      .setColor(this.client.embeds.serverInfo.color);
    if(this.client.embeds.serverInfo.title) embed.setTitle(this.client.embeds.serverInfo.title);
    
    if(this.client.embeds.serverInfo.description) embed.setDescription(this.client.embeds.serverInfo.description.replace("<name>", interaction.guild.name)
      .replace("<id>", interaction.guild.id)
      .replace("<createdAt>", interaction.guild.createdAt.toLocaleString())
      .replace("<channels>", interaction.guild.channels.cache.size)
      .replace("<roles>", interaction.guild.roles.cache.size)
      .replace("<bots>", interaction.guild.members.cache.filter(m => m.user.bot).size)
      .replace("<members>", interaction.guild.members.cache.size));
    
    let field = this.client.embeds.serverInfo.fields;
    for(let i = 0; i < this.client.embeds.serverInfo.fields.length; i++) {
    embed.addFields([{ name: field[i].title, value: field[i].description.replace("<name>", interaction.guild.name)
      .replace("<id>", interaction.guild.id)
      .replace("<createdAt>", interaction.guild.createdAt.toLocaleString())
      .replace("<channels>", interaction.guild.channels.cache.size)
      .replace("<roles>", interaction.guild.roles.cache.size)
      .replace("<bots>", interaction.guild.members.cache.filter(m => m.user.bot).size)
      .replace("<members>", interaction.guild.members.cache.size), inline: true }]);
    }
    
    if(this.client.embeds.serverInfo.footer == true ) embed.setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() }).setTimestamp();
    if(this.client.embeds.serverInfo.thumbnail == true) embed.setThumbnail(interaction.guild.iconURL());
    
    interaction.reply({ embeds: [embed], ephemeral: this.client.cmdConfig.serverinfo.ephemeral });
  }
};
