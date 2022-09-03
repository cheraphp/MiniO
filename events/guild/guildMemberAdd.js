const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const Event = require("../../structures/Events");
const { isEqual, generateInvitesCache } = require("../../utils/utils.js");

module.exports = class GuildMemberAdd extends Event {
	constructor(...args) {
		super(...args);
	}

	async run(member) {
	  if(!member.guild.members.me.permissions.has("ManageGuild")) return;

    let invite = null;
    let vanity = false;
    let failedVerify = false;

    if(this.client.config.plugins.verification.enabled == true) {
      let randomString  = () => (Math.random() * 466567).toString(36).slice(-7).replace(".", "");
      let realCode = randomString();

      let selOptions = [];
      let emojis = ["1️⃣", "2️⃣", "3️⃣"];
      emojis.forEach((e) => {
        let generateWrong = randomString();
        selOptions.push({
          label: generateWrong,
          value: generateWrong,
          emoji: e
        });
      });

      let verifyBttn = new Discord.ActionRowBuilder()
        .addComponents(
          new Discord.SelectMenuBuilder()
            .setCustomId("verify_sel")
            .setPlaceholder(this.client.language.general.verify_placeholder.replace("<code>", realCode))
            .addOptions(selOptions)
        );

      let randomReal = Math.floor(Math.random() * 3);
      verifyBttn.components[0].options[randomReal].value = realCode;
      verifyBttn.components[0].options[randomReal].label = realCode;

      let verifyEmbed = new Discord.EmbedBuilder()
        .setDescription(this.client.embeds.verification.description.replace("<code>", realCode))
        .setColor(this.client.embeds.verification.color);

      if(this.client.embeds.verification.title) verifyEmbed.setTitle(this.client.embeds.verification.title
        .replace("<user>", member.user.username));

      let verifyChannel = this.client.utils.findChannel(member.guild, this.client.config.plugins.verification.channel);
      let verifyDm = await member.user.send({ embeds: [verifyEmbed], components: [verifyBttn] }).catch((err) => { });
      if(!verifyDm && verifyChannel) return verifyChannel.send({ embeds: [this.client.embedBuilder(this.client, member.user, this.client.language.titles.error, this.client.language.general.dm_closed, this.client.embeds.error_color)] });
      if(!verifyDm) return;

      const verifyFilter = (int) => int.customId == "verify_sel" && int.user.id == member.user.id;
      await verifyDm.awaitMessageComponent({ verifyFilter, componentType: Discord.ComponentType.SelectMenu, time: this.client.config.plugins.verification.time * 1000 }).then(async(sel) => {
        await sel.deferUpdate();
        if(sel.values[0] != realCode) {
          verifyBttn.components[0].setDisabled(true);
          await verifyDm.edit({ embeds: [verifyEmbed], components: [verifyBttn] });
          verifyEmbed
            .setDescription(this.client.embeds.verification.fail_description.replace("<code>", realCode))
            .setColor("Red");
          if(this.client.embeds.verification.fail_title) verifyEmbed.setTitle(this.client.embeds.verification.fail_title);
  
          await member.user.send({ embeds: [verifyEmbed]});
          return failedVerify = true;
        }
        let findAdd = this.client.utils.findRole(member.guild, this.client.config.plugins.verification.role_add);
        if(findAdd) await member.roles.add(findAdd);
        let findRemove = this.client.utils.findRole(member.guild, this.client.config.plugins.verification.role_remove);
        if(findRemove) await member.roles.remove(findRemove);
        
        verifyBttn.components[0].setDisabled(true);
        await verifyDm.edit({ embeds: [verifyEmbed], components: [verifyBttn] });
        verifyEmbed
          .setDescription(this.client.embeds.verification.success_description.replace("<code>", realCode))
          .setColor("GREEN");
        if(this.client.embeds.verification.fail_title) verifyEmbed.setTitle(this.client.embeds.verification.success_title);

        await member.user.send({ embeds: [verifyEmbed] });
      }).catch(async(err) => {
        verifyBttn.components[0].setDisabled(true);
        await verifyDm.edit({ embeds: [verifyEmbed], components: [verifyBttn] });
        verifyEmbed
          .setDescription(this.client.embeds.verification.fail_description.replace("<code>", realCode))
          .setColor("Red");
        if(this.client.embeds.verification.fail_title) verifyEmbed.setTitle(this.client.embeds.verification.fail_title);

        await member.user.send({ embeds: [verifyEmbed]});
        return failedVerify = true;
      });
    }

    if(failedVerify == true) return;

    if(this.client.config.roles.join.enabled == true) {
      for(let i = 0; i < this.client.config.roles.join.list.length; i++) {
        member.roles.add(this.client.config.roles.join.list[i]);
      }
    }

    await member.guild.invites.fetch().catch(() => {});
    const guildInvites = generateInvitesCache(member.guild.invites.cache);
    const oldGuildInvites = this.client.invites[member.guild.id];
    if (guildInvites && oldGuildInvites) {
      this.client.invites[member.guild.id] = guildInvites;

      let inviteUsed = guildInvites.find((i) => oldGuildInvites.get(i.code) && ((Object.prototype.hasOwnProperty.call(oldGuildInvites.get(i.code), "uses") ? oldGuildInvites.get(i.code).uses : "Infinite") < i.uses));
      if ((isEqual(oldGuildInvites.map((i) => `${i.code}|${i.uses}`).sort(), guildInvites.map((i) => `${i.code}|${i.uses}`).sort())) && !inviteUsed && member.guild.features.includes("VANITY_URL")) {
        vanity = true;
      } else if (!inviteUsed) {
        const newAndUsed = guildInvites.filter((i) => !oldGuildInvites.get(i.code) && i.uses === 1);
        if (newAndUsed.size === 1) {
          inviteUsed = newAndUsed.first();
        }
      }
      if (inviteUsed && !vanity) invite = inviteUsed;
    } else if (guildInvites && !oldGuildInvites) {
      this.client.invites[member.guild.id] = guildInvites;
    }
    if (!invite && guildInvites) {
      const targetInvite = guildInvites.some((i) => i.targetUser && (i.targetUser.id === member.id));
      if (targetInvite.uses === 1) {
        invite = targetInvite;
      }
    }
    
    let inviter = null;
    if(vanity == false && (!invite || invite == undefined || invite == null)) inviter = "Unknown";
    else if(vanity == true && (!invite || invite == undefined || invite == null)) inviter = "Vanity URL"
    else inviter = this.client.users.cache.get(invite.inviter.id);

    if (inviter != "Unknown" && inviter != "Vanity URL") {
      await db.set(`inviter_${member.guild.id}_${member.id}`, inviter.id);

      if (inviter.id != member.id) {
        await db.add(`invitesRegular_${member.guild.id}_${inviter.id}`, 1);
        await db.add(`invitesJoins_${member.guild.id}_${inviter.id}`, 1);
        this.client.utils.pushHistory(member, inviter.id, this.client.language.invites.joinHistory.replace("<user>", member.user.username));
      }
    } else {
      await db.set(`inviter_${member.guild.id}_${member.id}`, inviter);
    }

    let invitesChannel = this.client.utils.findChannel(member.guild, this.client.config.channels.invites);

    let msgJoin = this.client.embeds.invitesJoined;
    if (invitesChannel && msgJoin && msgJoin != null) {
      let inviter = await db.get(`inviter_${member.guild.id}_${member.id}`);
      let invv = null;
      if (inviter == "Vanity URL") invv = "Vanity URL";
      else if (inviter == undefined || inviter == null || inviter == "Unknown") invv = "Unknown";
      else invv = this.client.users.cache.get(inviter).tag;

      let inviterName = invv;

      let joins = await db.get(`invitesJoins_${member.guild.id}_${inviter}`) || 0;
      let regular = await db.get(`invitesRegular_${member.guild.id}_${inviter}`) || 0;
      let leaves = await db.get(`invitesLeaves_${member.guild.id}_${inviter}`) || 0;

      const joinEmbed = new Discord.EmbedBuilder()
        .setDescription(this.client.embeds.invitesJoined.description.replace("<user>", member.user)
          .replace("<members>", member.guild.memberCount)
          .replaceAll("<invitedBy>", inviterName)
          .replace("<leavesInvites>", leaves)
          .replace("<regularInvites>", regular)
          .replace("<joinsInvites>", joins)
          .replace("<createdAt>", member.user.createdAt.toLocaleString()))
        .setColor(this.client.embeds.invitesJoined.color);

      if(this.client.embeds.invitesJoined.title) joinEmbed.setTitle(this.client.embeds.invitesJoined.title
          .replace("<user>", member.user.username));
      if(this.client.embeds.invitesJoined.footer) joinEmbed.setFooter({ text: member.user.username, iconURL: member.user.displayAvatarURL({ dynamic: true }) });

      invitesChannel.send({ embeds: [joinEmbed] });
    }

    if(this.client.config.plugins.welcomer.save_roles == true) {
      const savedRoles = await db.get(`savedRoles_${member.id}`);
      if(savedRoles) {
        member.roles.add(savedRoles);
        await db.delete(`savedRoles_${member.id}`);
      }
    }

    if(this.client.config.plugins.welcomer.enabled == true && this.client.config.plugins.welcomer.send_message == true) {
      let wlcmChannel = this.client.utils.findChannel(member.guild, this.client.config.channels.welcome);
      if(this.client.config.plugins.welcomer.type == "EMBED") {
        if(wlcmChannel && this.client.embeds.welcome.description) {
          let wlcmEmbed = new Discord.EmbedBuilder()
            .setDescription(this.client.embeds.welcome.description.replace("<user>", member)
              .replace("<members>", member.guild.memberCount)
              .replace("<createdAt>", member.user.createdAt.toLocaleString())
              .replaceAll("<inviter>", inviter))
            .setColor(this.client.embeds.welcome.color);
    
          if(this.client.embeds.welcome.title) wlcmEmbed.setTitle(this.client.embeds.welcome.title
            .replace("<user>", member.user.username));
          if(this.client.embeds.welcome.thumbnail) wlcmEmbed.setThumbnail(member.user.displayAvatarURL({ dynamic: true }));
          if(this.client.embeds.welcome.footer) wlcmEmbed.setFooter({ text: member.user.username, iconURL: member.user.displayAvatarURL({ dynamic: true }) }).setTimestamp();
    
          wlcmChannel.send({ embeds: [wlcmEmbed] });
        }
      } else if(this.client.config.plugins.welcomer.type == "TEXT") {
        wlcmChannel.send({ content: this.client.config.plugins.welcomer.message.replace("<user>", member)
          .replace("<members>", member.guild.memberCount)
          .replace("<createdAt>", member.user.createdAt.toLocaleString())
          .replaceAll("<inviter>", inviter) });
      }
    }
 	}
};
