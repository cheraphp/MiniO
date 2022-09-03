const Command = require("../../structures/Command");
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const ms = require("ms");
const remindList = new Map();

module.exports = class RemindMe extends Command {
  constructor(client) {
    super(client, {
      name: "remindme",
      description: client.cmdConfig.remindme.description,
      usage: client.cmdConfig.remindme.usage,
      permissions: client.cmdConfig.remindme.permissions,
      aliases: client.cmdConfig.remindme.aliases,
      category: "member",
      listed: client.cmdConfig.remindme.enabled,
      slash: true,
      options: [{
        name: "action",
        type: ApplicationCommandOptionType.String,
        description: "Do you want to add, cancel or list reminders",
        choices: [{
          name: "Add Reminder",
          value: "add"
        }, {
          name: "Cancel Reminder",
          value: "cancel"
        }, {
          name: "List Reminders",
          value: "list"
        }],
        required: true
      }, {
        name: "time_or_id",
        type: ApplicationCommandOptionType.String,
        description: "After how much time to Remind you / ID for Cancel",
        required: false
      }, {
        name: "reason",
        type: ApplicationCommandOptionType.String,
        description: "About what to remind you",
        requried: false
      }]
    });
  }

  async run(message, args) {
    const action = args[0];
    const time = args[1];
    const reason = args.slice(2).join(" ");

    const remindActions = ['add', 'cancel', 'list'];
    if(!action || !remindActions.includes(args[0]?.toLowerCase()))
      return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.member.reminder_action, this.client.embeds.error_color)] });
    
    if(action.toLowerCase() == "add") {
      const parsedTime = ms(time || 0);
      if(!parsedTime || parsedTime == 0 || !time)
        return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.member.invalid_time, this.client.embeds.error_color)] });
      
      const remindTimer = setTimeout(() => {
        message.reply({ content: `${message.author}`, embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.member.reminder.replace("<reason>", reason || "/").replace("<user>", message.author), this.client.embeds.general_color)] });
        remindList.set(message.author.id, remindList.get(message.author.id).filter((x) => x.timer != remindTimer));
      }, parsedTime);

      const newReminder = {
        time: parsedTime,
        reason,
        timer: remindTimer
      };
  
      if(!remindList.get(message.author.id)) remindList.set(message.author.id, [newReminder])
      else remindList.get(message.author.id).push(newReminder);

      message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.member.reminder_added.replace("<reason>", reason || "/").replace("<time>", this.client.utils.formatTime(parsedTime)), this.client.embeds.general_color)] });
    } else if(action.toLowerCase() == "cancel") {
      if(!remindList.get(message.author.id) || remindList.get(message.author.id)?.length == 0)
        return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.member.reminder_empty, this.client.embeds.error_color)] });
      if(!time)
        return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.member.reminder_id, this.client.embeds.error_color)] });

      let cancelReminder = remindList.get(message.author.id) || [];

      if(!cancelReminder[time] || cancelReminder?.length == 0)
        return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.member.reminder_invalid, this.client.embeds.error_color)] });

      clearTimeout(cancelReminder.timer);
      remindList.set(message.author.id, remindList.get(message.author.id).filter((x) => x != cancelReminder[time]));

      message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.member.reminder_canceled.replace("<id>", time), this.client.embeds.general_color)] });
    } else if(action.toLowerCase() == "list") {
      const reminders = remindList.get(message.author.id) || [];
      let remindString = "";
      for(let i = 0; i < reminders.length; i++) {
        remindString += `> **#${i}** ${reminders[i].reason || "/"}\n`
      };

      if(reminders.length == 0) remindString = this.client.language.member.reminder_empty;

      message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.member.reminder_list.replace("<reminders>", remindString), this.client.embeds.general_color)] });
    }
  }
  async slashRun(interaction, args) {
    const action = interaction.options.getString("action");
    const time = interaction.options.getString("time_or_id");
    const reason = interaction.options.getString("reason");
  
    const remindActions = ['add', 'cancel', 'list'];
    if(!action || !remindActions.includes(args[0]?.toLowerCase()))
      return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.member.reminder_action, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.remindme.ephemeral });
    
    if(action.toLowerCase() == "add") {
      const parsedTime = ms(time || 0);
      if(!parsedTime || parsedTime == 0 || !time)
        return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.member.invalid_time, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.remindme.ephemeral });
      
      const remindTimer = setTimeout(() => {
        interaction.channel.send({ content: `${interaction.user}`, embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.member.reminder.replace("<reason>", reason || "/").replace("<user>", interaction.user), this.client.embeds.general_color)] });
        remindList.set(interaction.user.id, remindList.get(interaction.user.id).filter((x) => x.timer != remindTimer));
      }, parsedTime);
  
      const newReminder = {
        time: parsedTime,
        reason,
        timer: remindTimer
      };
  
      if(!remindList.get(interaction.user.id)) remindList.set(interaction.user.id, [newReminder])
      else remindList.get(interaction.user.id).push(newReminder);
  
      interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.member.reminder_added.replace("<reason>", reason || "/").replace("<time>", this.client.utils.formatTime(parsedTime)), this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.remindme.ephemeral });
    } else if(action.toLowerCase() == "cancel") {
      if(!remindList.get(interaction.user.id) || remindList.get(interaction.user.id)?.length == 0)
        return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.member.reminder_empty, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.remindme.ephemeral });
      if(!time)
        return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.member.reminder_id, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.remindme.ephemeral });
  
      let cancelReminder = remindList.get(interaction.user.id) || [];
  
      if(!cancelReminder[time] || cancelReminder?.length == 0)
        return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.member.reminder_invalid, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.remindme.ephemeral });
  
      clearTimeout(cancelReminder.timer);
      remindList.set(interaction.user.id, remindList.get(interaction.user.id).filter((x) => x != cancelReminder[time]));
  
      interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.member.reminder_canceled.replace("<id>", time), this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.remindme.ephemeral });
    } else if(action.toLowerCase() == "list") {
      const reminders = remindList.get(interaction.user.id) || [];
      let remindString = "";
      for(let i = 0; i < reminders.length; i++) {
        remindString += `> **#${i}** ${reminders[i].reason || "/"}\n`
      };
  
      if(reminders.length == 0) remindString = this.client.language.member.reminder_empty;
  
      interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.member.reminder_list.replace("<reminders>", remindString), this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.remindme.ephemeral });
    }
  }
};
