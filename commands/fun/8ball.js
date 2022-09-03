const Command = require("../../structures/Command");
const Discord = require("discord.js");

module.exports = class EightBall extends Command {
  constructor(client) {
    super(client, {
      name: "8ball",
      description: client.cmdConfig.eightball.description,
      usage: client.cmdConfig.eightball.usage,
      permissions: client.cmdConfig.eightball.permissions,
      usage: client.cmdConfig.eightball.usage,
      category: "fun",
      listed: client.cmdConfig.eightball.enabled,
      slash: true,
      options: [{
        name: "question",
        type: Discord.ApplicationCommandOptionType.String,
        description: "Question to ask",
        required: true
      }]
    });
  }

  async run(message, args) {
    let query = args.join(" ");
    if(!args[0]) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.eightball.usage)] });

    let embed = new Discord.EmbedBuilder()
      .setTitle(this.client.embeds.eightball.title)
      .addFields([{ name: this.client.embeds.eightball.question, value: query }])
      .addFields([{ name: this.client.embeds.eightball.answer, value: this.client.config.plugins.fun.eightball.answers[Math.floor(Math.random() * this.client.config.plugins.fun.eightball.answers.length)] }])
      .setColor(this.client.embeds.eightball.color);

    message.channel.send({ embeds: [embed] });
  }

  async slashRun(interaction, args) {
    let query = interaction.options.getString("question");

    let embed = new Discord.EmbedBuilder()
      .setTitle(this.client.embeds.eightball.title)
      .addFields([{ name: this.client.embeds.eightball.question, value: query }])
      .addFields([{ name: this.client.embeds.eightball.answer, value: this.client.config.plugins.fun.eightball.answers[Math.floor(Math.random() * this.client.config.plugins.fun.eightball.answers.length)] }])
      .setColor(this.client.embeds.eightball.color);

    interaction.reply({ embeds: [embed], ephemeral: this.client.cmdConfig.eightball.ephemeral });
  }
};
