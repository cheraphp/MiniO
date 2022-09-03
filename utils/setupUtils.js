const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const ms = require('ms');

async function submitGiveaway(client, message, data) {
  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('createGw')
        .setEmoji(client.config.emojis.giveaway.start || {})
        .setLabel(client.language.buttons.giveaway.start)
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('cancelGw')
        .setEmoji(client.config.emojis.giveaway.cancel || {})
        .setLabel(client.language.buttons.giveaway.cancel)
        .setStyle(ButtonStyle.Danger));

  let gwConfirm = new EmbedBuilder()
    .setTitle(client.embeds.gwConfirm.title)
    .setDescription(client.embeds.gwConfirm.description.replace("<duration>", client.utils.formatTime(ms(data.duration)))
      .replace("<channel>", data.channel)
      .replace("<winners>", data.winners)
      .replace("<messages>", data.messages)
      .replace("<invites>", data.invites)
      .replace("<prize>", data.prize))
    .setColor(client.embeds.gwConfirm.color)

  let msg = await message.channel.send({ embeds: [gwConfirm], components: [row] });

  let filter = m => m.user.id == message.member.id;
  const collector = message.channel.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 30000, errors: ["time"] });

  collector.on("collect", async i => {
    if(i.customId == "createGw") {
      await i.deferUpdate();
      let giveawayObject = client.utils.giveawayObject(
        message.guild.id, 
        0, 
        ms(data.duration), 
        data.channel.id, 
        parseInt(data.winners), 
        parseInt(data.messages), 
        parseInt(data.invites), 
        (Date.now() + ms(data.duration)), 
        message.member.id,
        data.prize,
      );
      client.gw.startGiveaway(client, message, giveawayObject);

      row.components[0].setDisabled(true);
      row.components[1].setDisabled(true);

      await msg.edit({ embeds: [gwConfirm], components: [row] });

      message.channel.send({ embeds: [ client.embedBuilder(client, message.member.user, client.language.giveaway.titles.setup, client.language.giveaway.create.done.replace("<channel>", data.channel), client.embeds.success_color)] });
      collector.stop();
    } else if(i.customId == "cancelGw") {
      await i.deferUpdate();
      client.gwCreation.set(message.member.id, false);

      row.components[0].setDisabled(true);
      row.components[1].setDisabled(true);

      await msg.edit({ embeds: [gwConfirm], components: [row] });

      message.channel.send({ embeds: [ client.embedBuilder(client, message.member.user, client.language.giveaway.titles.setup, client.language.giveaway.create.canceled, client.embeds.error_color)] });
      collector.stop();
    }
  });

  collector.on("end", (collected, reason) => {
    if(reason != "time") return;
    client.gwCreation.set(message.member.id, false);
    let endEmbed = new EmbedBuilder()
      .setColor(client.embeds.error_color)
      .setDescription(client.language.giveaway.create.expired)
      .setAuthor({ name: client.language.giveaway.titles.setup, iconURL: client.user.displayAvatarURL() });
    message.channel.send({ embeds: [endEmbed] });
  })
}

async function prizeSetup(client, message, embed, filter, data) {
  embed.setDescription(client.language.giveaway.create.prize);
  message.channel.send({ embeds: [embed] });

  let prizeCollector = message.channel.createMessageCollector({ filter, time: 60000, errors: ["time"] });

  prizeCollector.on("collect", async (msg) => {
    let cancelEmbed = new EmbedBuilder()
      .setColor(client.embeds.general_color)
      .setDescription(client.language.giveaway.create.canceled)
      .setAuthor({ name: client.language.giveaway.titles.setup, iconURL: client.user.displayAvatarURL() });
    if(msg.content.toLowerCase() == "cancel") {
      client.gwCreation.set(message.member.id, false);
      message.channel.send({ embeds: [cancelEmbed] });
      prizeCollector.stop()
      return;
    }

    let prizeArg = msg.content;

    if(!prizeArg || prizeArg.length < 3 || prizeArg.length > 32) return message.channel.send({ embeds: [ client.embedBuilder(client, message.member.user, client.language.giveaway.titles.setup, client.language.giveaway.create.errors.prize, client.embeds.error_color)] });
    data.prize = msg.content;
    await submitGiveaway(client, message, data);
    prizeCollector.stop();
  });

  prizeCollector.on("end", (collected, reason) => {
    if(reason != "time") return;
    client.gwCreation.set(message.member.id, false);
    let endEmbed = new EmbedBuilder()
      .setColor(client.embeds.error_color)
      .setDescription(client.language.giveaway.create.expired)
      .setAuthor({ name: client.language.giveaway.titles.setup, iconURL: client.user.displayAvatarURL() });
    message.channel.send({ embeds: [endEmbed] });
  });
}

async function invitesSetup(client, message, embed, filter, data) {
  embed.setDescription(client.language.giveaway.create.invites);
  message.channel.send({ embeds: [embed] });

  let invCollector = message.channel.createMessageCollector({ filter, time: 60000, errors: ["time"] });

  invCollector.on("collect", async (msg) => {
    let cancelEmbed = new EmbedBuilder()
      .setColor(client.embeds.general_color)
      .setDescription(client.language.giveaway.create.canceled)
      .setAuthor({ name: client.language.giveaway.titles.setup, iconURL: client.user.displayAvatarURL() });
    if(msg.content.toLowerCase() == "cancel") {
      client.gwCreation.set(message.member.id, false);
      message.channel.send({ embeds: [cancelEmbed] });
      invCollector.stop()
      return;
    }

    if(isNaN(msg.content)) return message.channel.send({ embeds: [ client.embedBuilder(client, message.member.user, client.language.giveaway.titles.setup, client.language.giveaway.create.errors.invites, client.embeds.error_color)] });
    data.invites = msg.content;
    await prizeSetup(client, message, embed, filter, data);
    invCollector.stop();
  });

  invCollector.on("end", (collected, reason) => {
    if(reason != "time") return;
    client.gwCreation.set(message.member.id, false);
    let endEmbed = new EmbedBuilder()
      .setColor(client.embeds.error_color)
      .setDescription(client.language.giveaway.create.expired)
      .setAuthor({ name: client.language.giveaway.titles.setup, iconURL: client.user.displayAvatarURL() });
    message.channel.send({ embeds: [endEmbed] });
  });
}

async function messagesSetup(client, message, embed, filter, data) {
  embed.setDescription(client.language.giveaway.create.messages);
  message.channel.send({ embeds: [embed] });

  let msgCollector = message.channel.createMessageCollector({ filter, time: 60000, errors: ["time"] });

  msgCollector.on("collect", async (msg) => {
    let cancelEmbed = new EmbedBuilder()
      .setColor(client.embeds.general_color)
      .setDescription(client.language.giveaway.create.canceled)
      .setAuthor({ name: client.language.giveaway.titles.setup, iconURL: client.user.displayAvatarURL() });
    if(msg.content.toLowerCase() == "cancel") {
      client.gwCreation.set(message.member.id, false);
      message.channel.send({ embeds: [cancelEmbed] });
      msgCollector.stop()
      return;
    }

    if(isNaN(msg.content)) return message.channel.send({ embeds: [ client.embedBuilder(client, message.member.user, client.language.giveaway.titles.setup, client.language.giveaway.create.errors.messages, client.embeds.error_color)] });
    data.messages = msg.content;
    await invitesSetup(client, message, embed, filter, data);
    msgCollector.stop();
  });

  msgCollector.on("end", (collected, reason) => {
    if(reason != "time") return;
    client.gwCreation.set(message.member.id, false);
    let endEmbed = new EmbedBuilder()
      .setColor(client.embeds.error_color)
      .setDescription(client.language.giveaway.create.expired)
      .setAuthor({ name: client.language.giveaway.titles.setup, iconURL: client.user.displayAvatarURL() });
    message.channel.send({ embeds: [endEmbed] });
  });
}

async function winnersSetup(client, message, embed, filter, data) {
  embed.setDescription(client.language.giveaway.create.winners);
  message.channel.send({ embeds: [embed] });

  let winnerCollector = message.channel.createMessageCollector({ filter, time: 60000, errors: ["time"] });

  winnerCollector.on("collect", async (msg) => {
    let cancelEmbed = new EmbedBuilder()
      .setColor(client.embeds.general_color)
      .setDescription(client.language.giveaway.create.canceled)
      .setAuthor({ name: client.language.giveaway.titles.setup, iconURL: client.user.displayAvatarURL() });
    if(msg.content.toLowerCase() == "cancel") {
      client.gwCreation.set(message.member.id, false);
      message.channel.send({ embeds: [cancelEmbed] });
      winnerCollector.stop()
      return;
    }

    if(isNaN(msg.content)) return message.channel.send({ embeds: [ client.embedBuilder(client, message.member.user, client.language.giveaway.titles.setup, client.language.giveaway.create.errors.winners, client.embeds.error_color)] });
    data.winners = msg.content;
    await messagesSetup(client, message, embed, filter, data);
    winnerCollector.stop();
  });

  winnerCollector.on("end", (collected, reason) => {
    if(reason != "time") return;
    client.gwCreation.set(message.member.id, false);
    let endEmbed = new EmbedBuilder()
      .setColor(client.embeds.error_color)
      .setDescription(client.language.giveaway.create.expired)
      .setAuthor({ name: client.language.giveaway.titles.setup, iconURL: client.user.displayAvatarURL() });
    message.channel.send({ embeds: [endEmbed] });
  });
}

async function channelSetup(client, message, embed, filter, data) {
  embed.setDescription(client.language.giveaway.create.channel);
  message.channel.send({ embeds: [embed] });

  let channelCollector = message.channel.createMessageCollector({ filter, time: 60000, errors: ["time"] });

  channelCollector.on("collect", async (msg) => {
    let cancelEmbed = new EmbedBuilder()
      .setColor(client.embeds.general_color)
      .setDescription(client.language.giveaway.create.canceled)
      .setAuthor({ name: client.language.giveaway.titles.setup, iconURL: client.user.displayAvatarURL() });
    if(msg.content.toLowerCase() == "cancel") {
      client.gwCreation.set(message.member.id, false);
      message.channel.send({ embeds: [cancelEmbed] });
      channelCollector.stop()
      return;
    }

    if(!msg.mentions.channels.first()) return message.channel.send({ embeds: [ client.embedBuilder(client, message.member.user, client.language.giveaway.titles.setup, client.language.giveaway.create.errors.channel, client.embeds.error_color)] });
    data.channel = msg.mentions.channels.first();
    await winnersSetup(client, message, embed, filter, data);
    channelCollector.stop();
  });

  channelCollector.on("end", (collected, reason) => {
    if(reason != "time") return;
    client.gwCreation.set(message.member.id, false);
    let endEmbed = new EmbedBuilder()
      .setColor(client.embeds.error_color)
      .setDescription(client.language.giveaway.create.expired)
      .setAuthor({ name: client.language.giveaway.titles.setup, iconURL: client.user.displayAvatarURL() });
    message.channel.send({ embeds: [endEmbed] });
  });
}

async function durationSetup(client, message, embed, filter, inter) {
  let currentData = {
    duration: null,
    winners: 0,
    messages: 0,
    invites: 0,
    channel: null,
    prize: "N/A",
    interaction: inter
  };

  embed.setDescription(client.language.giveaway.create.duration)
  message.channel.send({ embeds: [embed] }); 

  let durationCollector = message.channel.createMessageCollector({ filter, time: 60000, errors: ["time"] });

  durationCollector.on("collect", async (msg) => {
    let cancelEmbed = new EmbedBuilder()
      .setColor(client.embeds.general_color)
      .setDescription(client.language.giveaway.create.canceled)
      .setAuthor({ name: client.language.giveaway.titles.setup, iconURL: client.user.displayAvatarURL() });
    if(msg.content.toLowerCase() == "cancel") {
      client.gwCreation.set(message.member.id, false);
      message.channel.send({ embeds: [cancelEmbed] });
      durationCollector.stop()
      return;
    }

    currentData.duration = msg.content;
    await channelSetup(client, message, embed, filter, currentData);
    durationCollector.stop();
  });

  durationCollector.on("end", (collected, reason) => {
    if(reason != "time") return;
    client.gwCreation.set(message.member.id, false);
    let endEmbed = new EmbedBuilder()
      .setColor(client.embeds.error_color)
      .setDescription(client.language.giveaway.create.expired)
      .setAuthor({ name: client.language.giveaway.titles.setup, iconURL: client.user.displayAvatarURL() });
    message.channel.send({ embeds: [endEmbed] });
  });
}

module.exports = {
  durationSetup,
}
