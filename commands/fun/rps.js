const Command = require("../../structures/Command");
const { ButtonBuilder, ActionRowBuilder, ButtonStyle, ComponentType, ApplicationCommandOptionType } = require("discord.js");
const playingList = new Map();

module.exports = class RPS extends Command {
  constructor(client) {
    super(client, {
      name: "rps",
      description: client.cmdConfig.rps.description,
      usage: client.cmdConfig.rps.usage,
      permissions: client.cmdConfig.rps.permissions,
      usage: client.cmdConfig.rps.usage,
      category: "fun",
      listed: client.cmdConfig.rps.enabled,
      options: [{
        name: "user",
        description: "User against which you want to play RPS",
        type: ApplicationCommandOptionType.User,
        required: true
      }]
    });
  }

  async run(message, args) {
    const user = message.mentions.users.first();

    if(!user)
      return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.rps.usage)] });
    
    // if(user.id == message.author.id) return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.cannot_self, this.client.embeds.error_color)] });
    if(playingList.has(message.author.id) || playingList.has(user.id)) return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.general.rps_already, this.client.embeds.error_color)] });

    const localeOptions = [this.client.language.buttons.rps.rock, this.client.language.buttons.rps.paper, this.client.language.buttons.rps.scissors];
    const rpsOptions = ["rps_rock", "rps_paper", "rps_scissors"];

    const playNotPlay = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel(this.client.language.buttons.rps.yes)
          .setEmoji(this.client.config.emojis.rps.yes || {})
          .setCustomId("rps_accept")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setLabel(this.client.language.buttons.rps.no)
          .setEmoji(this.client.config.emojis.rps.no || {})
          .setCustomId("rps_deny")
          .setStyle(ButtonStyle.Danger),
      )

    let msg = await message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.general.rps_request.replace("<user>", user).replace("<author>", message.author), this.client.embeds.general_color)], components: [playNotPlay] })

    const choiceFilter = (i) => i.user.id == user.id;
    let firstPick, secondPick;
    await msg.awaitMessageComponent({ choiceFilter, time: 60_000 }).then(async(i) => {
      await i.deferUpdate();
      if(i.customId == "rps_accept") {
        playingList.set(message.author.id, true);
        playingList.set(user.id, true);

        const choiceRow = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setLabel(this.client.language.buttons.rps.rock)
              .setEmoji(this.client.config.emojis.rps.rock || {})
              .setCustomId("rps_rock")
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setLabel(this.client.language.buttons.rps.paper)
              .setEmoji(this.client.config.emojis.rps.paper || {})
              .setCustomId("rps_paper")
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setLabel(this.client.language.buttons.rps.scissors)
              .setEmoji(this.client.config.emojis.rps.scissors || {})
              .setCustomId("rps_scissors")
              .setStyle(ButtonStyle.Primary)
          );

        await msg.edit({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.general.rps_start, this.client.embeds.general_color)], components: [choiceRow] })
    
        const filter = (i) => (i.user.id == message.author.id || i.user.id == user.id) && (["rps_rock", "rps_paper", "rps_scissors"].includes(i.customId));
        const collector = await message.channel.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 120_000 });
    
        collector.on("collect", async(bttn) => {
          if(bttn.user.id == message.author.id && firstPick) return bttn.deferUpdate();
          else if(bttn.user.id == user.id && secondPick) return bttn.deferUpdate();

          if(bttn.user.id == message.author.id) {
            firstPick = bttn.customId;
            bttn.reply({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.general.rps_chose.replace("<option>", localeOptions[rpsOptions.indexOf(bttn.customId)]), this.client.embeds.success_color)], ephemeral: true });
          } else if(bttn.user.id == user.id) {
            secondPick = bttn.customId;
            bttn.reply({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.general.rps_chose.replace("<option>", localeOptions[rpsOptions.indexOf(bttn.customId)]), this.client.embeds.success_color)], ephemeral: true });
          };
    
          if(firstPick && secondPick) {
            if((firstPick == "rps_rock" && secondPick == "rps_scissors") || (firstPick == "rps_paper" && secondPick == "rps_rock") || (firstPick == "rps_scissors" && secondPick == "rps_paper")) {
              message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.general.rps_won.replace("<winner>", message.author).replace("<winnerChoice>", localeOptions[rpsOptions.indexOf(firstPick)]).replace("<loser>", user).replace("<loserChoice>", localeOptions[rpsOptions.indexOf(secondPick)]), this.client.embeds.general_color)] });
            } else if((secondPick == "rps_rock" && firstPick == "rps_scissors") || (secondPick == "rps_paper" && firstPick == "rps_rock") || (secondPick == "rps_scissors" && firstPick == "rps_rock")) {
              message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.general.rps_won.replace("<winner>", user).replace("<winnerChoice>", localeOptions[rpsOptions.indexOf(secondPick)]).replace("<loser>", message.author).replace("<loserChoice>", localeOptions[rpsOptions.indexOf(firstPick)]), this.client.embeds.general_color)] });
            } else if(firstPick == secondPick) {
              message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.general.rps_won.replace("<firstPlayer>", message.author).replace("<secondPlayer>", user).replace("<choice>", localeOptions[rpsOptions.indexOf(firstPick)]), this.client.embeds.general_color)] });
            }
          }
        });

        collector.on("end", async(collected, reason) => {
          playingList.delete(message.author.id);
          playingList.delete(user.id);

          choiceRow.components[0].setDisabled(true);
          choiceRow.components[1].setDisabled(true);
          choiceRow.components[2].setDisabled(true);
          if(reason == "time" && (!firstPick || !secondPick)) {
            message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.general.rps_expired, this.client.embeds.general_color)] })
          }
        });
      } else {
        choiceRow.components[0].setDisabled(true);
        choiceRow.components[1].setDisabled(true);
        choiceRow.components[2].setDisabled(true);
        message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.general.rps_denied.replace("<player>", user), this.client.embeds.general_color)] })
      }
    }).catch(async(err) => {
      playingList.delete(message.author.id);
      playingList.delete(user.id);

      playNotPlay.components[0].setDisabled(true);
      playNotPlay.components[1].setDisabled(true);
      await msg.edit({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.general.rps_start, this.client.embeds.general_color)], components: [playNotPlay] })
    })
  }

  async slashRun(interaction, args) {
    const user = interaction.options.getUser("user");
    if(user.id == interaction.user.id) return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.cannot_self, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.rps.ephemeral });
    if(playingList.has(interaction.user.id) || playingList.has(user.id)) return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.rps_already, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.rps.ephemeral });

    const localeOptions = [this.client.language.buttons.rps.rock, this.client.language.buttons.rps.paper, this.client.language.buttons.rps.scissors];
    const rpsOptions = ["rps_rock", "rps_paper", "rps_scissors"];

    const playNotPlay = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel(this.client.language.buttons.rps.yes)
          .setEmoji(this.client.config.emojis.rps.yes || {})
          .setCustomId("rps_accept")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setLabel(this.client.language.buttons.rps.no)
          .setEmoji(this.client.config.emojis.rps.no || {})
          .setCustomId("rps_deny")
          .setStyle(ButtonStyle.Danger),
      )

    let msg = await interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.general.rps_request.replace("<user>", user).replace("<author>", interaction.user), this.client.embeds.general_color)], components: [playNotPlay], fetchReply: true })

    const choiceFilter = (i) => i.user.id == user.id;
    let firstPick, secondPick;
    await msg.awaitMessageComponent({ choiceFilter, time: 60_000 }).then(async(i) => {
      if(i.customId == "rps_accept") {
        playingList.set(interaction.user.id, true);
        playingList.set(user.id, true);

        const choiceRow = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setLabel(this.client.language.buttons.rps.rock)
              .setEmoji(this.client.config.emojis.rps.rock || {})
              .setCustomId("rps_rock")
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setLabel(this.client.language.buttons.rps.paper)
              .setEmoji(this.client.config.emojis.rps.paper || {})
              .setCustomId("rps_paper")
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setLabel(this.client.language.buttons.rps.scissors)
              .setEmoji(this.client.config.emojis.rps.scissors || {})
              .setCustomId("rps_scissors")
              .setStyle(ButtonStyle.Primary)
          );

        await interaction.editReply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.general.rps_start, this.client.embeds.general_color)], components: [choiceRow] })
    
        const filter = (i) => (i.user.id == interaction.user.id || i.user.id == user.id) && (rpsOptions.includes(i.customId));
        const collector = await msg.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 120_000 });
    
        collector.on("collect", async(bttn) => {
          if(bttn.user.id == interaction.user.id && firstPick) return bttn.deferUpdate();
          else if(bttn.user.id == user.id && secondPick) return bttn.deferUpdate();

          if(bttn.user.id == interaction.user.id) {
            firstPick = bttn.customId;
            bttn.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.general.rps_chose.replace("<option>", localeOptions[rpsOptions.indexOf(bttn.customId)]), this.client.embeds.success_color)], ephemeral: true });
          } else if(bttn.user.id == user.id) {
            secondPick = bttn.customId;
            bttn.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.general.rps_chose.replace("<option>", localeOptions[rpsOptions.indexOf(bttn.customId)]), this.client.embeds.success_color)], ephemeral: true });
          };
    
          if(firstPick && secondPick) {
            if((firstPick == "rps_rock" && secondPick == "rps_scissors") || (firstPick == "rps_paper" && secondPick == "rps_rock") || (firstPick == "rps_scissors" && secondPick == "rps_paper")) {
              interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.general.rps_won.replace("<winner>", interaction.user).replace("<winnerChoice>", localeOptions[rpsOptions.indexOf(firstPick)]).replace("<loser>", user).replace("<loserChoice>", localeOptions[rpsOptions.indexOf(secondPick)]), this.client.embeds.general_color)] });
            } else if((secondPick == "rps_rock" && firstPick == "rps_scissors") || (secondPick == "rps_paper" && firstPick == "rps_rock") || (secondPick == "rps_scissors" && firstPick == "rps_rock")) {
              interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.general.rps_won.replace("<winner>", user).replace("<winnerChoice>", localeOptions[rpsOptions.indexOf(secondPick)]).replace("<loser>", interaction.user).replace("<loserChoice>", localeOptions[rpsOptions.indexOf(firstPick)]), this.client.embeds.general_color)] });
            } else if(firstPick == secondPick) {
              interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.general.rps_won.replace("<firstPlayer>", interaction.user).replace("<secondPlayer>", user).replace("<choice>", localeOptions[rpsOptions.indexOf(firstPick)]), this.client.embeds.general_color)] });
            }
          }
        });

        collector.on("end", async(collected, reason) => {
          playingList.delete(interaction.user.id);
          playingList.delete(user.id);

          choiceRow.components[0].setDisabled(true);
          choiceRow.components[1].setDisabled(true);
          choiceRow.components[2].setDisabled(true);
          if(reason == "time" && (!firstPick || !secondPick)) {
            interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.general.rps_expired, this.client.embeds.general_color)] })
          }
        });
      } else {
        choiceRow.components[0].setDisabled(true);
        choiceRow.components[1].setDisabled(true);
        choiceRow.components[2].setDisabled(true);
        interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.general.rps_denied.replace("<player>", user), this.client.embeds.general_color)] })
      }
    }).catch(async(err) => {
      if(playingList.has(interaction.user.id) || playingList.has(user.id)) {
        playingList.delete(interaction.user.id);
        playingList.delete(user.id);
      }

      playNotPlay.components[0].setDisabled(true);
      playNotPlay.components[1].setDisabled(true);
      await interaction.editReply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.general.rps_start, this.client.embeds.general_color)], components: [playNotPlay] })
    });
  }
};
