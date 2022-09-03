const { ChannelType } = require("discord.js");
const Event = require("../../structures/Events");
const channelData = new Map();

module.exports = class VoiceStateUpdate extends Event {
  constructor(...args) {
    super(...args);
  }

  async run(oldState, newState) {
    let mkChannel = this.client.utils.findChannel(oldState.member.guild, this.client.config.channels.temporary.voice);
    if(!mkChannel) return;
    if (!oldState.channelId && newState.channelId) {
      if(newState.channelId != mkChannel.id) return;
      await createTemporaryVC(this.client, newState);
    }
    if (oldState.channelId && !newState.channelId) {
      if (channelData.get(`temp_${oldState.channelId}`)) {
        let vc = oldState.guild.channels.cache.get(channelData.get(`temp_${oldState.channelId}`));
        if (vc.members.size < 1) { 
          channelData.delete(`temp_${oldState.channelId}`); 
          return vc.delete(); 
        }
      }
    }
    if (oldState.channelId && newState.channelId) {
      if (oldState.channelId !== newState.channelId) {
        if(newState.channelId == mkChannel.id) 
          await createTemporaryVC(this.client, oldState);
        if (channelData.get(`temp_${oldState.channelId}`)) {
          let vc = oldState.guild.channels.cache.get(channelData.get(`temp_${oldState.channelId}`));
          if (vc.members.size < 1) { 
            channelData.delete(`temp_${oldState.channelId}`); 
            return vc.delete(); 
          }
        }
      }
    }
  }
};

async function createTemporaryVC(client, user) {
  let category = client.utils.findChannel(user.guild, client.config.channels.temporary.category);
  await user.guild.channels.create({
    name: client.language.temporary.temp_name.replace("<user>", user.member.user.username),
    type: ChannelType.GuildVoice,
    parent: category,
    userLimit: client.config.channels.temporary.limit,
  }).then(async(vc) => {
    user.setChannel(vc);
    channelData.set(`temp_${vc.id}`, vc.id);
    await vc.permissionOverwrites.set([
      {
        id: user.id,
        allow: ['ManageChannels'],
      },
      {
        id: user.guild.id,
        allow: ['Speak', 'Connect'],
      },
    ]);
  })
}