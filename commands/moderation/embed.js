const Command = require("../../structures/Command");
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");

module.exports = class Embed extends Command {
  constructor(client) {
    super(client, {
      name: "embed",
      description: client.cmdConfig.embed.description,
      usage: client.cmdConfig.embed.usage,
      permissions: client.cmdConfig.embed.permissions,
      aliases: client.cmdConfig.embed.aliases,
      category: "moderation",
      listed: client.cmdConfig.embed.enabled,
      slash: true,
      options: [{
        name: 'title',
        type: ApplicationCommandOptionType.String,
        description: 'Title for Embed',
        required: true,
      },{
        name: 'description',
        type: ApplicationCommandOptionType.String,
        description: 'Description for Embed',
        required: true,
      },{
        name: 'color',
        type: ApplicationCommandOptionType.String,
        description: 'Color for Embed',
        required: true,
      },{
        name: 'image',
        type: ApplicationCommandOptionType.String,
        description: 'Image for Embed',
        required: false,
      }]
    });
  }
  async run(message, args) {
    const parsed = this.client.utils.parseArgs(args, ['t:', 'c:']);
    let title = parsed.options.t;
    let color = parsed.options.c;
    let image = parsed.options.i;
    let desc = parsed.leftover.join(' ');

    if (!desc || desc == "") return message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.titles.error, this.client.language.utility.no_desc, this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.embed.ephemeral });

    let embed = new EmbedBuilder()
      .setDescription(desc);
      
    if(color != undefined) {
      if(!color.startsWith("#")) color = `#${color}`; 
      
      if (!/^#[a-fA-F0-9]{6}$/.test(color)) {
        return message.channel.send({ content: '>>> You need to use HEX Color (#001776).'});
      }
    }

    if (title != undefined) embed.setTitle(title);
    if (color != undefined) embed.setColor(color);
    if (image != undefined) embed.setThumbnail(image);

    message.channel.send({ embeds: [embed] });
  }
  async slashRun(interaction, args) {
    let title = interaction.options.getString("title");
    let description = interaction.options.getString("description");
    let color = interaction.options.getString("color");
    let image = interaction.options.getString("image");

    let embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description.replaceAll("/n", "\n")
        .replace("\\**", "**"))
      .setColor(color);

    if(image) embed.setThumbnail(image);

    interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, "Embed", `Embed created.`, "Yellow")], ephemeral: true });
    interaction.channel.send({ embeds: [embed] });
  }
};
