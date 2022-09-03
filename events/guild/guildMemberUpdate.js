const Event = require("../../structures/Events");

module.exports = class GuildMemberUpdate extends Event {
	constructor(...args) {
		super(...args);
	}

	async run(oldMember, newMember) {
	  if(!oldMember.guild.members.me.permissions.has("ManageGuild")) return;

    if(oldMember.nickname !== newMember.nickname) {
      if(oldMember.nickname === null) {
        var oldNM = "N/A";
      } else {
        var oldNM = oldMember.nickname;
      }
      if(newMember.nickname === null) {
        var newNM = "N/A"; 
      } else {
        var newNM = newMember.nickname;
      }

      this.client.utils.logs(this.client, oldMember.guild, this.client.language.titles.logs.member_update, [{
        name: "User",
        desc: oldMember.tag
      },{
        name: "Old Nickname",
        desc: oldNM
      },{
        name: "New Nickname",
        desc: newNM
      },{
        name: "User ID",
        desc: newUser.id
      }], newMember.user, "GUILD_MEMBER_UPDATE");
    }
    if(oldMember.roles.cache.size < newMember.roles.cache.size) {
      var gainrole = newMember.roles.cache
        .map((r) => `${r}`)
        .filter((x) => !oldMember.roles.cache.map((r) => `${r}`).includes(x));
  
        this.client.utils.logs(this.client, oldMember.guild, this.client.language.titles.logs.member_update, [{
          name: "User",
          desc: oldMember.user.tag
        },{
          name: "Role Added",
          desc: gainrole
        }], oldMember.user, "GUILD_MEMBER_UPDATE");
    }
    if(oldMember.roles.cache.size > newMember.roles.cache.size) {
      var lostrole = oldMember.roles.cache
        .map((r) => `${r}`)
        .filter((x) => !newMember.roles.cache.map((r) => `${r}`).includes(x));

        this.client.utils.logs(this.client, oldMember.guild, this.client.language.titles.logs.member_update, [{
          name: "User",
          desc: oldMember.user.tag
        },{
          name: "Role Removed",
          desc: lostrole
        }], oldMember.user, "GUILD_MEMBER_UPDATE");
    }
	} 
};