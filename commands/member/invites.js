const Command = require("../../structures/Command");
const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = class Invites extends Command {
	constructor(client) {
		super(client, {
			name: "invites",
			description: client.cmdConfig.invites.description,
			usage: client.cmdConfig.invites.usage,
			permissions: client.cmdConfig.invites.permissions,
			aliases: client.cmdConfig.invites.aliases,
			category: "member",
			listed: client.cmdConfig.invites.enabled,
      slash: true,
      options: [{
        name: 'target',
        type: Discord.ApplicationCommandOptionType.User,
        description: "User which Invites to view",
        required: false,
      }]
		});
	}

  async run(message, args) {
    var user = message.mentions.users.first() || this.client.users.cache.get(args[0]) || message.author;
  
    let joins = await db.get(`invitesJoins_${message.guild.id}_${user.id}`) || 0;
    let left = await db.get(`invitesLeaves_${message.guild.id}_${user.id}`) || 0;
    let regular = await db.get(`invitesRegular_${message.guild.id}_${user.id}`) || 0;
    let invitedBy = await db.get(`inviter_${message.guild.id}_${user.id}`);
    let inviter = this.client.users.cache.get(invitedBy);
    inviter = inviter ? inviter.username : 'Unknown User';

    let every = (await db.all()).filter(i => i.id.startsWith(`invitesRegular_${message.guild.id}_`)).sort((a, b) => b.value - a.value);
    let rank = every.map(x => x.id).indexOf(`invitesRegular_${message.guild.id}_${user.id}`) + 1 || 'N/A';
    
    let history = await db.get(`invitesHistory_${message.guild.id}_${user.id}`) || ["No History"];
    let contentHistory = String();
    
    for(const inv of history.slice(0, 5)) {
      contentHistory += `\n> ${inv}`
    }
  
    let embed = new Discord.EmbedBuilder()
      .setDescription(this.client.language.invites.invites.replace("<user>", user.username)
        .replace("<joinsInvites>", joins)
        .replace("<leavesInvites>", left)
        .replace("<regularInvites>", regular)
        .replace("<rank>", rank)
        .replace("<history>", contentHistory)
        .replace("<inviter>", inviter))
      .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setTimestamp()
      .setColor(this.client.embeds.general_color);

    if(this.client.language.titles.invites) embed.setTitle(this.client.language.titles.invites);
  
    message.channel.send({ embeds: [embed] });
  }
  async slashRun(interaction, args) {
    var user = interaction.options.getUser("target") || interaction.user;
  
    let joins = await db.get(`invitesJoins_${interaction.guild.id}_${user.id}`) || 0;
    let left = await db.get(`invitesLeaves_${interaction.guild.id}_${user.id}`) || 0;
    let regular = await db.get(`invitesRegular_${interaction.guild.id}_${user.id}`) || 0;
    let invitedBy = await db.get(`inviter_${interaction.guild.id}_${user.id}`);
    let inviter = this.client.users.cache.get(invitedBy);
    inviter = inviter ? inviter.username : 'Unknown User';

    let every = (await db.all()).filter(i => i.id.startsWith(`invitesRegular_${interaction.guild.id}_`)).sort((a, b) => b.value - a.value);
    let rank = every.map(x => x.id).indexOf(`invitesRegular_${interaction.guild.id}_${user.id}`) + 1 || 'N/A';
  
    let history = await db.get(`invitesHistory_${interaction.guild.id}_${user.id}`) || ["No History"];
    let contentHistory = String();
    
    for(const inv of history.slice(0, 5)) {
      contentHistory += `\n> ${inv}`
    }
  
    let embed = new Discord.EmbedBuilder()
      .setDescription(this.client.language.invites.invites.replace("<user>", user.username)
        .replace("<joinsInvites>", joins)
        .replace("<leavesInvites>", left)
        .replace("<regularInvites>", regular)
        .replace("<rank>", rank)
        .replace("<history>", contentHistory)
        .replace("<inviter>", inviter))
      .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
      .setTimestamp()
      .setColor(this.client.embeds.general_color);

    if(this.client.language.titles.invites) embed.setTitle(this.client.embeds.title);
  
    interaction.reply({ embeds: [embed], ephemeral: this.client.cmdConfig.invites.ephemeral });
  }
};
