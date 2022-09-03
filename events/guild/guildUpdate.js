const Event = require("../../structures/Events");

module.exports = class GuildUpdate extends Event {
	constructor(...args) {
		super(...args);
	}

	async run(oldGuild, newGuild) {
	  if(!oldGuild.members.me.permissions.has("ManageGuild")) return;

    if(oldGuild.name !== newGuild.name) {
      this.client.utils.logs(this.client, oldGuild, this.client.language.titles.logs.guild_update, [{
        name: "Old Guild Name",
        desc: oldGuild.name
      }, {
        name: "New Guild Name",
        desc: newGuild.name
      }], this.client.user, "GUILD_UPDATE");
    }
    if(oldGuild.ownerId != newGuild.ownerId) {
      this.client.utils.logs(this.client, oldGuild, this.client.language.titles.logs.guild_update, [{
        name: "Old Owner ID",
        desc: oldGuild.ownerId
      }, {
        name: "New Owner ID",
        desc: newGuild.ownerId
      }], this.client.user, "GUILD_UPDATE");
    }
	} 
};