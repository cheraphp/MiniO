const Command = require("../../structures/Command");
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = class BirthdaysComing extends Command {
  constructor(client) {
    super(client, {
      name: "birthdayscoming",
      description: client.cmdConfig.birthdayscoming.description,
      usage: client.cmdConfig.birthdayscoming.usage,
      permissions: client.cmdConfig.birthdayscoming.permissions,
      aliases: client.cmdConfig.birthdayscoming.aliases,
      category: "member",
      listed: client.cmdConfig.birthdayscoming.enabled,
      slash: true,
    });
  }

  async run(message, args) {
    const isToday = (d) => d ? new Date().getMonth() === new Date(d).getMonth() 
      && new Date().getDate() <= new Date(d).getDate() : false;

    let birthdays = (await db.all())
      .filter((i) => i.id.startsWith(`birthday_`))
      .sort((a, b) => b.value - a.value);

    birthdays = birthdays
      .filter((b) => isToday(Date.parse(`${b.value} GMT`)))
      .map((s) => {
        let bUser = this.client.users.cache.get(s.id.split("_")[1]) || "N/A";
        return `> **${s.value.slice(1, -1).trim()}** - ${bUser}\n`;
      });

    if(birthdays.length == 0)
      return message.channel.send({ embeds: [this.client.embedBuilder(this.client, message.author, this.client.embeds.title, this.client.language.member.bday_list_empty, this.client.embeds.error_color)] });

    this.client.paginateContent(this.client, birthdays, 10, 1, message, this.client.language.titles.birthdays_mon, this.client.embeds.general_color);
  }
  async slashRun(interaction, args) {
    const isToday = (d) => d ? new Date().getMonth() === new Date(d).getMonth() 
      && new Date().getDate() <= new Date(d).getDate() : false;

    let birthdays = (await db.all())
      .filter((i) => i.id.startsWith(`birthday_`))
      .sort((a, b) => b.value - a.value);

    birthdays = birthdays
      .filter((b) => isToday(Date.parse(`${b.value} GMT`)))
      .map((s) => {
        let bUser = this.client.users.cache.get(s.id.split("_")[1]) || "N/A";
        return `> **${s.value.slice(1, -1).trim()}** - ${bUser}\n`;
      });

    if(birthdays.length == 0)
      return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.member.bday_list_empty, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.birthdayscoming.ephemeral });

    this.client.paginateContent(this.client, birthdays, 10, 1, interaction, this.client.language.titles.birthdays_mon, this.client.embeds.general_color);
  }
};
