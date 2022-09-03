const Event = require("../../structures/Events");

module.exports = class RoleUpdate extends Event {
	constructor(...args) {
		super(...args);
	}

	async run(oldRole, newRole) {
	  if(!oldRole.guild.members.me.permissions.has("ManageGuild")) return;
   	const fetchedLogs = await oldRole.guild.fetchAuditLogs({
    	limit: 1,
    	type: 'ROLE_UPDATE',
    });
    	
    const log = fetchedLogs.entries.first();
    
    if (!log) return;
    	
    const { executor, target } = log;

    if(oldRole.name !== newRole.name) {
      this.client.utils.logs(this.client, oldRole.guild, this.client.language.titles.logs.role_update, [{
        name: "User",
        desc: executor.tag
      },{
        name: "Old Role Name",
        desc: oldRole.name
      },{
        name: "New Role Name",
        desc: newRole.name
      },{
        name: "Role ID",
        desc: newRole.id
      }], executor, "ROLE_UPDATE");
    }
    
    if (oldRole.hexColor !== newRole.hexColor && oldRole.name === newRole.name) {
    
      if(oldRole.hexColor === '#000000') {  
        var oldColor = '`Default`';  
      } else {
        var oldColor = oldRole.hexColor;
      }    
      if(newRole.hexColor === '#000000') {  
        var newColor = '`Default`';  
      } else {
        var newColor = newRole.hexColor;  
      }  

      this.client.utils.logs(this.client, oldRole.guild, this.client.language.titles.logs.role_update, [{
        name: "User",
        desc: executor.tag
      },{
        name: "Old Role Color",
        desc: oldColor
      },{
        name: "New Role Color",
        desc: newColor
      },{
        name: "Role ID",
        desc: newRole.id
      }], executor, "ROLE_UPDATE");
    } 
  }
};