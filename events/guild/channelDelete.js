const { QuickDB } = require("quick.db");
const db = new QuickDB();
const Event = require("../../structures/Events");

module.exports = class ChannelDelete extends Event {
	constructor(...args) {
		super(...args);
	}

	async run(channel) {
	  if(!channel.guild.members.me.permissions.has("ManageGuild")) return;
    if(!channel.guild) return;
    
		let dataRemove = db
			.all()
			.filter((i) => i.id.includes(channel.id));

		dataRemove.forEach(async(x) => await db.delete(x.id))

		const fetchedLogs = await channel.guild.fetchAuditLogs({
      limit: 1,
     	type: 'CHANNEL_DELETE',
    });
    	
    const log = fetchedLogs.entries.first();
    
    if (!log) return;
    	
    const { executor, target } = log;

    this.client.utils.logs(this.client, channel.guild, this.client.language.titles.logs.channel_delete, [{
      name: "User",
      desc: executor.tag
    },{
      name: "Channel Name",
      desc: channel.name
    },{
      name: "Channel ID",
      desc: channel.id
    },{
      name: "Channel Type",
      desc: channel.type
    }], executor, "CHANNEL_DELETE");
	} 
};
