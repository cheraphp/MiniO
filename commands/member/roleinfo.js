const Command = require("../../structures/Command");
let { EmbedBuilder, Permissions, ApplicationCommandOptionType } = require("discord.js");

module.exports = class RoleInfo extends Command {
	constructor(client) {
		super(client, {
			name: "roleinfo",
			description: client.cmdConfig.serverinfo.description,
			usage: client.cmdConfig.serverinfo.usage,
			permissions: client.cmdConfig.serverinfo.permissions,
      aliases: client.cmdConfig.serverinfo.aliases,
			category: "member",
			listed: client.cmdConfig.serverinfo.enabled,
      slash: true,
      options: [{
        name: "role",
        description: "Role which info to view",
        type: ApplicationCommandOptionType.Role,
        required: true
      }]
		});
	}

  async run(message, args) {
    let role = message.mentions.roles.first();
    if(!role) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.roleinfo.usage)]});

    let embed = new EmbedBuilder()
      .setColor(this.client.embeds.roleInfo.color);
    if(this.client.embeds.roleInfo.title) embed.setTitle(this.client.embeds.roleInfo.title);
    
    if(this.client.embeds.roleInfo.description) embed.setDescription(this.client.embeds.roleInfo.description.replace("<role>", role.name)
      .replace("<id>", role.id)
      .replace("<createdAt>", role.createdAt.toLocaleString())
      .replace("<mentionable>", role.mentionable)
      .replace("<color>", role.hexColor)
      .replace("<position>", role.rawPosition)
      .replace("<permissions>", new Permissions(role.permissions).toArray().join(", ").replaceAll("_", " ").trim()));
    
    let field = this.client.embeds.roleInfo.fields;
    for(let i = 0; i < this.client.embeds.roleInfo.fields.length; i++) {
      embed.addFields([{ name: field[i].title, value: field[i].description.replace("<role>", role.name)
      .replace("<id>", role.id)
      .replace("<createdAt>", role.createdAt.toLocaleString())
      .replace("<mentionable>", role.mentionable)
      .replace("<color>", role.hexColor)
      .replace("<position>", role.rawPosition)
      .replace("<permissions>", new Permissions(role.permissions).toArray().join(", ").replaceAll("_", " ").trim()), inline: true }]);
    }
    
    if(this.client.embeds.roleInfo.footer == true) embed.setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() }).setTimestamp();
    if(this.client.embeds.roleInfo.thumbnail == true && role.icon) embed.setThumbnail(role.iconURL());

    message.channel.send({ embeds: [embed] });
  }

  async slashRun(interaction, args) {
    let role = interaction.options.getRole("role");

    let embed = new EmbedBuilder()
      .setColor(this.client.embeds.roleInfo.color);
    if(this.client.embeds.roleInfo.title) embed.setTitle(this.client.embeds.roleInfo.title);
    
    if(this.client.embeds.roleInfo.description) embed.setDescription(this.client.embeds.roleInfo.description.replace("<role>", role.name)
      .replace("<id>", role.id)
      .replace("<createdAt>", role.createdAt.toLocaleString())
      .replace("<mentionable>", role.mentionable)
      .replace("<color>", role.hexColor)
      .replace("<position>", role.rawPosition)
      .replace("<permissions>", new Permissions(role.permissions).toArray().join(", ").replaceAll("_", " ").trim()));
    
    let field = this.client.embeds.roleInfo.fields;
    for(let i = 0; i < this.client.embeds.roleInfo.fields.length; i++) {
    embed.addFields([{ name: field[i].title, value: field[i].description.replace("<role>", role.name)
      .replace("<id>", role.id)
      .replace("<createdAt>", role.createdAt.toLocaleString())
      .replace("<mentionable>", role.mentionable)
      .replace("<color>", role.hexColor)
      .replace("<position>", role.rawPosition)
      .replace("<permissions>", new Permissions(role.permissions).toArray().join(", ").replaceAll("_", " ").trim()), inline: true }]);
    }
    
    if(this.client.embeds.roleInfo.footer == true ) embed.setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() }).setTimestamp();
    if(this.client.embeds.roleInfo.thumbnail == true && role.icon) embed.setThumbnail(role.iconURL());
    
    interaction.reply({ embeds: [embed], ephemeral: this.client.cmdConfig.serverinfo.ephemeral });
  }
};
