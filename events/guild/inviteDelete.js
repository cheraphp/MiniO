const Event = require("../../structures/Events");

module.exports = class InviteDelete extends Event {
  constructor(...args) {
    super(...args);
  }

  async run(invite) {
    if(!invite.guild.members.me.permissions.has("ManageGuild")) return;
    invite.guild.invites.fetch().then(guildInvites => {
      this.client.invites[invite.guild.id] = guildInvites;
    });
  }
};