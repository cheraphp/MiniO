const Command = require("../../structures/Command");
let { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");

module.exports = class UserInfo extends Command {
	constructor(client) {
		super(client, {
			name: "userinfo",
			description: client.cmdConfig.userinfo.description,
			usage: client.cmdConfig.userinfo.usage,
			permissions: client.cmdConfig.userinfo.permissions,
      aliases: client.cmdConfig.userinfo.aliases,
			category: "member",
			listed: client.cmdConfig.userinfo.enabled,
      slash: true,
      options: [{
        name: "user",
        type: ApplicationCommandOptionType.User,
        description: "User whoes Info to view",
        required: false
      }]
		});
	}

  async run(message, args) {
    let user = message.mentions.users.first() || message.author;
    let member = message.guild.members.cache.get(user.id);

    let embed = new EmbedBuilder()
      .setColor(this.client.embeds.userInfo.color);
    if(this.client.embeds.userInfo.title) embed.setTitle(this.client.embeds.userInfo.title);
    
    if(this.client.embeds.userInfo.description) embed.setDescription(this.client.embeds.userInfo.description.replace("<user>", user)
      .replace("<username>", user.username)
      .replace("<tag>", user.tag)
      .replace("<discriminator>", user.discriminator)
      .replace("<joinedAt>", member.joinedAt.toLocaleString())
      .replace("<createdAt>", user.createdAt.toLocaleString())
      .replace("<id>", user.id));
    
    let field = this.client.embeds.userInfo.fields;
    for(let i = 0; i < this.client.embeds.userInfo.fields.length; i++) {
      embed.addFields([{ name: field[i].title, value: field[i].description.replace("<user>", user)
        .replace("<username>", user.username)
        .replace("<tag>", user.tag)
        .replace("<discriminator>", user.discriminator)
        .replace("<joinedAt>", member.joinedAt.toLocaleString())
        .replace("<createdAt>", user.createdAt.toLocaleString())
        .replace("<id>", user.id), inline: true }]);
    }
    
    if(this.client.embeds.userInfo.footer == true ) embed.setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() }).setTimestamp();
    if(this.client.embeds.userInfo.thumbnail == true) embed.setThumbnail(user.displayAvatarURL());

    message.channel.send({ embeds: [embed] });
  }

  async slashRun(interaction, args) {
    let user = interaction.options.getUser("user") || interaction.user;
    let member = interaction.guild.members.cache.get(user.id);
    
    let embed = new EmbedBuilder()
      .setColor(this.client.embeds.userInfo.color);
    if(this.client.embeds.userInfo.title) embed.setTitle(this.client.embeds.userInfo.title);
    
    if(this.client.embeds.userInfo.description) embed.setDescription(this.client.embeds.userInfo.description.replace("<user>", user)
      .replace("<username>", user.username)
      .replace("<tag>", user.tag)
      .replace("<discriminator>", user.discriminator)
      .replace("<joinedAt>", member.joinedAt.toLocaleString())
      .replace("<createdAt>", user.createdAt.toLocaleString())
      .replace("<id>", user.id));
    
    let field = this.client.embeds.userInfo.fields;
    for(let i = 0; i < this.client.embeds.userInfo.fields.length; i++) {
      embed.addFields([{ name: field[i].title, value: field[i].description.replace("<user>", user)
        .replace("<username>", user.username)
        .replace("<tag>", user.tag)
        .replace("<discriminator>", user.discriminator)
        .replace("<joinedAt>", member.joinedAt.toLocaleString())
        .replace("<createdAt>", user.createdAt.toLocaleString())
        .replace("<id>", user.id), inline: true }]);
    }
    
    if(this.client.embeds.userInfo.footer == true) embed.setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() }).setTimestamp();
    if(this.client.embeds.userInfo.thumbnail == true) embed.setThumbnail(user.displayAvatarURL());
    
    interaction.reply({ embeds: [embed], ephemeral: this.client.cmdConfig.userinfo.ephemeral });
  }
};
