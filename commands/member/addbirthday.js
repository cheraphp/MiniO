const Command = require("../../structures/Command");
const { ApplicationCommandOptionType } = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = class Avatar extends Command {
  constructor(client) {
    super(client, {
      name: "addbirthday",
      description: client.cmdConfig.addbirthday.description,
      usage: client.cmdConfig.addbirthday.usage,
      permissions: client.cmdConfig.addbirthday.permissions,
      aliases: client.cmdConfig.addbirthday.aliases,
      category: "member",
      listed: client.cmdConfig.addbirthday.enabled,
      slash: true,
      options: [{
        name: "date",
        type: ApplicationCommandOptionType.String,
        description: "Date of your format, ex. 24 July 2001",
        required: false
      }]
    });
  }

  async run(message, args) {
    let date = args.join(" ");

    const parseDate = new Date(Date.parse(`${date} GMT`));
    const bday = await db.get(`birthday_${message.author.id}`);

    if(parseDate && args[0] && !bday) {
      if(parseDate.toString() == "Invalid Date")
        return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.member.invalid_date, this.client.embeds.error_color)] });

      await db.set(`birthday_${message.author.id}`, date);
      message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.member.bday_set.replace("<date>", date), this.client.embeds.general_color)] });
    } else {
      if(!bday)
        return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.member.no_bday, this.client.embeds.error_color)] });

      await db.delete(`birthday_${message.author.id}`);
      message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.member.bday_reset, this.client.embeds.success_color)] });
    }
  }
  async slashRun(interaction, args) {
    let date = interaction.options.getString("date");

    const parseDate = new Date(Date.parse(`${date} GMT`));
    const bday = await db.get(`birthday_${interaction.user.id}`);

    if(parseDate && date && bday) {
      if(parseDate.toString() == "Invalid Date")
        return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.member.invalid_date, this.client.embeds.error_color)] });

      await db.set(`birthday_${interaction.user.id}`, date);
      interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.member.bday_set.replace("<date>", date), this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.addbirthday.ephemeral });
    } else {
      if(!bday)
        return interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.member.no_bday, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.addbirthday.ephemeral });
      
      await db.delete(`birthday_${interaction.user.id}`);
      interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.member.bday_reset, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.addbirthday.ephemeral });
    }
  }
};
