const Command = require("../../structures/Command");
let { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = class Level extends Command {
	constructor(client) {
		super(client, {
			name: "level",
			description: client.cmdConfig.level.description,
			usage: client.cmdConfig.level.usage,
			permissions: client.cmdConfig.level.permissions,
      aliases: client.cmdConfig.level.aliases,
			category: "member",
			listed: client.cmdConfig.level.enabled,
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

    if(user.bot) return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.cannot_bot, this.client.embeds.error_color)] });

    let level = await db.get(`level_${message.guild.id}_${user.id}`);
    let xp = await db.get(`xp_${message.guild.id}_${user.id}`);

    const nextLevel = parseInt(level) + 1;
    const xpNeeded = nextLevel * 2 * 250 + 250;

    let every = (await db.all()).filter(i => i.id.startsWith(`level_${message.guild.id}_`)).sort((a, b) => b.value - a.value);
    let rank = every.map(x => x.id).indexOf(`level_${message.guild.id}_${user.id}`) + 1 || 'N/A';

    let progress = this.client.utils.progressBar(Math.floor(xpNeeded), Math.floor(xp));

    let embed = new EmbedBuilder()
      .setColor(this.client.embeds.level.color);
    if(this.client.embeds.level.title) embed.setTitle(this.client.embeds.level.title);
    
    if(this.client.embeds.level.description) embed.setDescription(this.client.embeds.level.description.replace("<user>", user)
      .replace("<level>", level)
      .replace("<xp>", xp)
      .replace("<xpNeeded>", xpNeeded)
      .replace("<rank>", rank)
      .replace("<progress>", progress[0])
      .replace("<percentage>", Math.round(progress[1])));
    
    let field = this.client.embeds.level.fields;
    for(let i = 0; i < this.client.embeds.level.fields.length; i++) {
      embed.addFields([{ name: field[i].title, value: field[i].description.replace("<user>", user)
        .replace("<level>", level)
        .replace("<xp>", xp)
        .replace("<xpNeeded>", xpNeeded)
        .replace("<rank>", rank)
        .replace("<progress>", progress[0])
        .replace("<percentage>", Math.round(progress[1])) }]);
    }
    
    if(this.client.embeds.level.footer == true ) embed.setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() }).setTimestamp();
    if(this.client.embeds.level.thumbnail == true) embed.setThumbnail(user.displayAvatarURL());

    message.channel.send({ embeds: [embed] });
  }

  async slashRun(interaction, args) {
    let user = interaction.options.getUser("user") || interaction.user;

    if(user.bot) return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.cannot_bot, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.level.ephemeral });

    let level = await db.get(`level_${interaction.guild.id}_${user.id}`);
    let xp = await db.get(`xp_${interaction.guild.id}_${user.id}`);
    
    const nextLevel = parseInt(level) + 1;
    const xpNeeded = nextLevel * 2 * 250 + 250;
    
    let every = (await db.all()).filter(i => i.id.startsWith(`level_${interaction.guild.id}_`)).sort((a, b) => b.value - a.value);
    let rank = every.map(x => x.id).indexOf(`level_${interaction.guild.id}_${user.id}`) + 1 || 'N/A';
    
    let progress = this.client.utils.progressBar(Math.floor(xpNeeded), Math.floor(xp));
    
    let embed = new EmbedBuilder()
      .setColor(this.client.embeds.level.color);
    if(this.client.embeds.level.title) embed.setTitle(this.client.embeds.level.title);
    
    if(this.client.embeds.level.description) embed.setDescription(this.client.embeds.level.description.replace("<user>", user)
      .replace("<level>", level)
      .replace("<xp>", xp)
      .replace("<xpNeeded>", xpNeeded)
      .replace("<rank>", rank)
      .replace("<progress>", progress[0])
      .replace("<percentage>", Math.round(progress[1])));
    
    let field = this.client.embeds.level.fields;
    for(let i = 0; i < this.client.embeds.level.fields.length; i++) {
      embed.addFields([{ name: field[i].title, value: field[i].description.replace("<user>", user)
        .replace("<level>", level)
        .replace("<xp>", xp)
        .replace("<xpNeeded>", xpNeeded)
        .replace("<rank>", rank)
        .replace("<progress>", progress[0])
        .replace("<percentage>", Math.round(progress[1])) }]);
    }
    
    if(this.client.embeds.level.footer == true ) embed.setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() }).setTimestamp();
    if(this.client.embeds.level.thumbnail == true) embed.setThumbnail(user.displayAvatarURL());
    
    interaction.reply({ embeds: [embed], ephemeral: this.client.cmdConfig.level.ephemeral });
  }
};
