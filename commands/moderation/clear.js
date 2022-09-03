const Command = require("../../structures/Command");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const Discord = require("discord.js");

module.exports = class Clear extends Command {
	constructor(client) {
		super(client, {
			name: "clear",
			description: client.cmdConfig.clear.description,
			usage: client.cmdConfig.clear.usage,
			permissions: client.cmdConfig.clear.permissions,
      aliases: client.cmdConfig.clear.aliases,
			category: "moderation",
			listed: client.cmdConfig.clear.enabled,
      slash: true,
      options: [{
        name: 'number',
        type: Discord.ApplicationCommandOptionType.Number,
        description: 'Number of messages to clear, 100 max',
        required: true,
      }]
		});
	}
  
  async run(message, args) {
    let count = args[0];
    if(!count || (count > 100 || count < 1)) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.clear.usage)] });
  
    if(count > 100 || count < 1) 
      return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.moderation.invalid_count, this.client.embeds.error_color)] });
  
    let fetched = await message.channel.messages.fetch({ limit: count });
  
    message.channel.bulkDelete(fetched).then(async () => {
      message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.moderation.titles.clear, this.client.language.moderation.purged.replace("<count>", count), this.client.embeds.success_color)] }).then((m) => {
        setTimeout(() => {
          m.delete();
        }, 5000)
      });
      this.client.utils.logs(this.client, message.guild, "Messages Purged", [{
        name: this.client.language.titles.logs.fields.user,
        desc: message.author
      },{
        name: "Channel",
        desc: message.channel
      },{
        name: "Count",
        desc: count
      }], message.author, "PURGE");
    }).catch((error) => {
      message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, `Cannot purge messages older than 14 days.`, this.client.embeds.error_color)] });
    });
  
  }

  async slashRun(interaction, args) {
    let count = interaction.options.getInteger("number");

    if(count > 100 || count < 1) 
      return interaction.reply({ embeds: [this.client.utils.validUsage(this.client, interaction, this.client.cmdConfig.clear.usage)], ephemeral: this.client.cmdConfig.clear.ephemeral });

    let fetched = await interaction.channel.messages.fetch({ limit: count });

    interaction.channel.bulkDelete(fetched).then(async () => {
      interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.moderation.titles.clear, this.client.language.moderation.purged.replace("<count>", count), this.client.embeds.success_color)], ephemeral: this.client.cmdConfig.clear.ephemeral }).then((m) => {
        setTimeout(() => {
          m.delete();
        }, 5000)
      });
      this.client.utils.logs(this.client, interaction.guild, "Messages Purged", [{
        name: this.client.language.titles.logs.fields.user,
        desc: interaction.user
      },{
        name: "Channel",
        desc: interaction.channel
      },{
        name: "Count",
        desc: count
      }], interaction.user, "PURGE");
    }).catch(error => {
      interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, `Cannot purge messages older than 14 days.`, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.clear.ephemeral });
    });
  }
};
