const Event = require("../../structures/Events");

module.exports = class ChannelCreate extends Event {
	constructor(...args) {
		super(...args);
	}

	async run(channel) {
	  if(!channel.guild.members.me.permissions.has("ManageGuild")) return;
    const fetchedLogs = await channel.guild.fetchAuditLogs({
      limit: 1,
     	type: 'CHANNEL_CREATE',
    });
    	
    const log = fetchedLogs.entries.first();
    
    if (!log) return;
    	
    const { executor, target } = log;

    this.client.utils.logs(this.client, channel.guild, this.client.language.titles.logs.channel_create, [{
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
    }], executor, "CHANNEL_CREATE");
	}
};
