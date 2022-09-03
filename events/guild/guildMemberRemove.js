const { QuickDB } = require("quick.db");
const db = new QuickDB();
const Event = require("../../structures/Events");
const Discord = require("discord.js");

module.exports = class GuildMemberRemove extends Event {
	constructor(...args) {
		super(...args);
	}

	async run(member) {
	  let config = this.client.config;
    const inviter = await db.get(`inviter_${member.guild.id}_${member.id}`);
    if(inviter != member.id && inviter != "Unknown" && inviter != "Vanity URL") {
      await db.add(`invitesLeaves_${member.guild.id}_${inviter}`, 1);
      await db.sub(`invitesRegular_${member.guild.id}_${inviter}`, 1);
      this.client.utils.pushHistory(member, inviter, this.client.language.invites.leaveHistory.replace("<user>", member.user.username));
    }
    let invitesChannel = this.client.utils.findChannel(member.guild, this.client.config.channels.invites);

    if (invitesChannel) {
      let inviter = await db.get(`inviter_${member.guild.id}_${member.id}`);
      let invv = null;

      if(inviter == "Vanity URL") invv = "Vanity URL";
      else if(inviter == undefined  || inviter == null || inviter == "Unknown") invv = "Unknown";
      else invv = this.client.users.cache.get(inviter).tag;
        
      let inviterName = invv;
      
      let joins = await db.get(`invitesJoins_${member.guild.id}_${inviter}`) || 0;
      let leaves = await db.get(`invitesLeaves_${member.guild.id}_${inviter}`) || 0;
      let regular = await db.get(`invitesRegular_${member.guild.id}_${member.id}`) || 0;
      let msgLeave = this.client.embeds.invitesLeft;
      
      if(msgLeave && msgLeave != null) {
        const leaveEmbed = new Discord.EmbedBuilder()
          .setDescription(this.client.embeds.invitesLeft.description.replace("<user>", member.user)
            .replace("<members>", member.guild.memberCount)
            .replaceAll("<invitedBy>", inviterName)
            .replace("<leavesInvites>", leaves)
            .replace("<regularInvites>", regular)
            .replace("<joinsInvites>", joins)
            .replace("<createdAt>", member.user.createdAt.toLocaleString()))
          .setColor(this.client.embeds.invitesLeft.color);

        if(this.client.embeds.invitesLeft.title) leaveEmbed.setTitle(this.client.embeds.invitesLeft.title.replace("<user>", member.user.username));
        if(this.client.embeds.invitesLeft.footer) leaveEmbed.setFooter({ text: member.user.username, iconURL: member.user.displayAvatarURL({ dynamic: true }) });

        invitesChannel.send({ embeds: [leaveEmbed] });
      }
    }

    if(this.client.config.plugins.welcomer.save_roles == true)
      await db.set(`savedRoles_${member.id}`, member.roles.cache);
    
    if(this.client.config.plugins.leave.enabled == true && this.client.config.plugins.leave.send_message == true) {
      let leaveChannel = this.client.utils.findChannel(member.guild, this.client.config.channels.leave);
      if(this.client.config.plugins.leave.type == "EMBED") {
        if(leaveChannel && this.client.embeds.leave.description) {
          let inviterName = inviter != "Unknown" && inviter != "Vanity URL" ? this.client.users.cache.get(inviter) : inviter;
          let leaveEmbed = new Discord.EmbedBuilder()
            .setDescription(this.client.embeds.leave.description.replace("<user>", member)
              .replace("<members>", member.guild.memberCount)
              .replace("<createdAt>", member.user.createdAt.toLocaleString()
              .replaceAll("<inviter>", inviterName)))
            .setColor(this.client.embeds.leave.color);
        
          if(this.client.embeds.leave.title) embed.setTitle(this.client.embeds.leave.title.replace("<user>", member.user.username));
          if(this.client.embeds.leave.thumbnail) embed.setThumbnail(member.user.displayAvatarURL({ dynamic: true }));
          if(this.client.embeds.leave.footer) embed.setFooter({ text: member.user.username, iconURL: member.user.displayAvatarURL({ dynamic: true }) }).setTimestamp();
        
          leaveChannel.send({ embeds: [leaveEmbed] });
        }
      } else if(this.client.config.plugins.leave.type == "TEXT") {
        let inviterName = inviter != "Unknown" && inviter != "Vanity URL" ? this.client.users.cache.get(inviter) : inviter;
        leaveChannel.send({ content: this.client.config.plugins.leave.message.replace("<user>", member)
          .replace("<members>", member.guild.memberCount)
          .replace("<createdAt>", member.user.createdAt.toLocaleString())
          .replaceAll("<inviter>", inviterName) });
      }
    }
	}
};
