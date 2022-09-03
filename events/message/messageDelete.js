const Event = require("../../structures/Events");

module.exports = class MessageDelete extends Event {
	constructor(...args) {
		super(...args);
	}

	async run(message) {
	  if (message.channel.type == 'DM') return;
    if (!message.author) return;
	  if (message.author.bot) return;
    if (message.partial) await message.fetch();
    
    let guild = this.client.guilds.cache.get(message.guildId);
	  
    let content = message.content;
    if (content.length > 1024) {
      content = content.slice(0, 896) + '...';
    }
    
    let attachments = '';
    if (message.attachments.size > 0) {
      for (const attachment of message.attachments) {
        attachments += '\n' + attachment[1].url + '\n';
      }
    }
    
    this.client.utils.logs(this.client, guild, this.client.language.titles.logs.message_delete, [{
      name: "User",
      desc: message.author.tag
    },{
      name: "Channel",
      desc: `<#${message.channel.id}>`
    },{
      name: "Message Content",
      desc: (message.content.length > 0 ? content : 'N/A') + (message.attachments.size > 0 ? attachments : '')
    }], message.author, "MESSAGE_DELETE");
	} 
};