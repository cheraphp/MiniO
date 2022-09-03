const Event = require("../../structures/Events");

module.exports = class RoleCreate extends Event {
	constructor(...args) {
		super(...args);
	}

	async run(role) {
	  if(!role.guild.members.me.permissions.has("ManageGuild")) return;
   	const fetchedLogs = await role.guild.fetchAuditLogs({
    	limit: 1,
    	type: 'ROLE_CREATE',
    });
    	
    const log = fetchedLogs.entries.first();
    
    if (!log) return;
    	
    const { executor, target } = log;
    
    this.client.utils.logs(this.client, role.guild, this.client.language.titles.logs.role_create, [{
      name: "User",
      desc: executor.tag
    },{
      name: "Role Name",
      desc: role.name
    },{
      name: "Role ID",
      desc: role.id
    }], executor, "ROLE_CREATE");
	} 
};