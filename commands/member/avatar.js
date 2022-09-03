const Command = require("../../structures/Command");
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");

module.exports = class Avatar extends Command {
  constructor(client) {
    super(client, {
      name: "avatar",
      description: client.cmdConfig.avatar.description,
      usage: client.cmdConfig.avatar.usage,
      permissions: client.cmdConfig.avatar.permissions,
      aliases: client.cmdConfig.avatar.aliases,
      category: "member",
      listed: client.cmdConfig.avatar.enabled,
      slash: true,
      options: [{
        name: "user",
        type: ApplicationCommandOptionType.User,
        description: "User whoes Avatar to View",
        required: false
      }]
    });
  }

  async run(message, args) {
    let user = message.mentions.users.first() || message.author;

    let embed = new EmbedBuilder()
      .setImage(user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) }).setTimestamp()
      .setColor(this.client.embeds.general_color);

    if(this.client.language.member.titles.avatar) embed.setTitle(this.client.language.member.titles.avatar);
    if(this.client.language.member.avatar) embed.setTitle(this.client.language.member.avatar.replace("<user>", user.username));

    message.channel.send({ embeds: [embed] });
  }
  async slashRun(interaction, args) {
    let user = interaction.options.getUser("user") || interaction.user;

    let embed = new EmbedBuilder()
      .setImage(user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) }).setTimestamp()
      .setColor(this.client.embeds.general_color);

    if(this.client.language.member.titles.avatar) embed.setTitle(this.client.language.member.titles.avatar);
    if(this.client.language.member.avatar) embed.setTitle(this.client.language.member.avatar.replace("<user>", user.username));

    interaction.reply({ embeds: [embed], ephemeral: this.client.cmdConfig.avatar.ephemeral });
  }
};
