const Command = require("../../structures/Command");
const Discord = require("discord.js");
const paginateSelect = require("../../embeds/paginateSelect.js");

module.exports = class Help extends Command {
	constructor(client) {
		super(client, {
			name: "help",
			description: client.cmdConfig.help.description,
			usage: client.cmdConfig.help.usage,
			permissions: client.cmdConfig.help.permissions,
      aliases: client.cmdConfig.help.aliases,
			category: "member",
			listed: false,
      slash: true,
      options: [{
        name: "command",
        type: Discord.ApplicationCommandOptionType.User,
        description: "Command to get Info About",
        required: false
      }]
		});
	}
	async run(message, args) {
    const config = this.client.config;
    let prefix = this.client.config.general.prefix
    let user = message.author;
    let commandArg = args[0];
    
    if(!commandArg) {
      let commandsArray = this.client.commands.filter(
          c => c.listed == true
        );
      let loadedCommands = [...commandsArray.values()];
      
      let helpMenu = new Discord.EmbedBuilder()
        .setColor(this.client.embeds.help.color);

      if(this.client.embeds.help.title) helpMenu.setTitle(this.client.embeds.help.title);
      let field = this.client.embeds.help.fields;
      for(let i = 0; i < this.client.embeds.help.fields.length; i++) {
        helpMenu.addFields([{ name: field[i].title, value: field[i].description
          .replace("<commandsCount>", loadedCommands.length)
          .replace("<prefix>", prefix) }])
      }
      
      if(this.client.embeds.help.footer == true) helpMenu.setFooter({ text: `Total Commands ${loadedCommands.length}`, iconURL: this.client.user.displayAvatarURL({ size: 1024, dynamic: true }) }).setTimestamp();
      if(this.client.embeds.help.thumbnail == true) helpMenu.setThumbnail(user.displayAvatarURL({ dynamic: true }));

      if(this.client.embeds.help.description) helpMenu.setDescription(this.client.embeds.help.description
        .replace("<commandsCount>", loadedCommands.length)
        .replace("<prefix>", prefix));

      let contentMember = this.client.utils.commandsList(this.client, "member");
      let memberEmbed = this.client.embedBuilder(this.client, message.author, this.client.language.titles.help.member, contentMember, this.client.embeds.general_color, true);  
      let contentEco = this.client.utils.commandsList(this.client, "economy");
      let ecoEmbed = this.client.embedBuilder(this.client, message.author, this.client.language.titles.help.economy, contentEco, this.client.embeds.general_color, true);  
      let contentUtility = this.client.utils.commandsList(this.client, "utility");
      let utilityEmbed = this.client.embedBuilder(this.client, message.author, this.client.language.titles.help.utility, contentUtility, this.client.embeds.general_color, true);  
      let contentMod = this.client.utils.commandsList(this.client, "moderation");
      let modEmbed = this.client.embedBuilder(this.client, message.author, this.client.language.titles.help.mod, contentMod, this.client.embeds.general_color, true);  
      let contentMusic = this.client.utils.commandsList(this.client, "music");
      let musicEmbed = this.client.embedBuilder(this.client, message.author, this.client.language.titles.help.music, contentMusic, this.client.embeds.general_color, true);  
      let contentFun = this.client.utils.commandsList(this.client, "fun");
      let funEmbed = this.client.embedBuilder(this.client, message.author, this.client.language.titles.help.fun, contentFun, this.client.embeds.general_color, true);  
      let contentGw = this.client.utils.commandsList(this.client, "giveaway");
      let gwEmbed = this.client.embedBuilder(this.client, message.author, this.client.language.titles.help.giveaway, contentGw, this.client.embeds.general_color, true);  
      
      let data = [];
      let embeds = [helpMenu, memberEmbed, ecoEmbed, utilityEmbed, modEmbed, musicEmbed, funEmbed, gwEmbed];
      let embedNames = ["main_menu", "member", "economy",
       "utility", "moderation", "music", "fun", "giveaway"];

      let helpList = this.client.config.general.help.list;

      for(const list of helpList) {
        data.push({
          label: list.name,
          value: "val_" + list.category.toLowerCase(),
          emoji: list.emoji,
          embed: embeds[embedNames.indexOf(list.category.toLowerCase())],
        })
      }
      
      paginateSelect(this.client, message, helpMenu, {
        id: "help",
        placeholder: this.client.language.titles.help.placeholder,
        options: data
      });
    } else {
      let cmd = this.client.commands.get(commandArg);
      if (!cmd) return;

      let cmdInfo = new Discord.EmbedBuilder()
        .setColor(this.client.embeds.help.color);
        
      if(this.client.embeds.commandInfo.title) cmdInfo.setTitle(this.client.embeds.commandInfo.title);
      let field = this.client.embeds.commandInfo.fields;
      for(let i = 0; i < this.client.embeds.commandInfo.fields.length; i++) {
        cmdInfo.addFields([{ name: field[i].title, value: field[i].description.replace("<name>", `${cmd.name}`)
          .replace("<description>", `${cmd.description}`)
          .replace("<usage>", `${cmd.usage}`)
          .replace("<category>", `${this.client.utils.capitalizeFirstLetter(cmd.category)}`)
          .replace("<prefix>", prefix), inline: true }]);
      }
      
      if(this.client.embeds.commandInfo.footer == true) cmdInfo.setFooter({ text: user.username, iconURL: user.displayAvatarURL({ size: 1024, dynamic: true }) }).setTimestamp();
      if(this.client.embeds.commandInfo.thumbnail == true) cmdInfo.setThumbnail(user.displayAvatarURL({ dynamic: true }));
      
      if(this.client.embeds.commandInfo.description) cmdInfo.setDescription(this.client.embeds.commandInfo.description.replace("<name>", `${cmd.name}`)
        .replace("<description>", `${cmd.description}`)
        .replace("<usage>", `${cmd.usage}`)
        .replace("<category>", `${this.client.utils.capitalizeFirstLetter(cmd.category)}`)
        .replace("<prefix>", prefix));
  
      message.channel.send({ embeds: [cmdInfo] });
    }
  }
  async slashRun(interaction, args) {
    const config = this.client.config;
    let prefix = this.client.config.general.prefix
    let user = interaction.user;
    let commandArg = interaction.options.getString("command");
    
    if(!commandArg) {
      let commandsArray = this.client.commands.filter(
          c => c.listed === true
        );
      let loadedCommands = [...commandsArray.values()];
      
      let helpMenu = new Discord.EmbedBuilder()
        .setColor(this.client.embeds.help.color);
      
      if(this.client.embeds.help.title) helpMenu.setTitle(this.client.embeds.help.title);
      let field = this.client.embeds.help.fields;
      for(let i = 0; i < this.client.embeds.help.fields.length; i++) {
      helpMenu.addFields([{ name: field[i].title, value: field[i].description
        .replace("<commandsCount>", loadedCommands.length)
        .replace("<prefix>", prefix) }])
      }
      
      if(this.client.embeds.help.footer == true) helpMenu.setFooter({ text: `Total Commands ${loadedCommands.length}`, iconURL: this.client.user.displayAvatarURL({ size: 1024, dynamic: true }) }).setTimestamp();
      if(this.client.embeds.help.thumbnail == true) helpMenu.setThumbnail(user.displayAvatarURL({ dynamic: true }));
      
      if(this.client.embeds.help.description) helpMenu.setDescription(this.client.embeds.help.description
        .replace("<commandsCount>", loadedCommands.length)
        .replace("<prefix>", prefix));
      
      let contentMember = this.client.utils.commandsList(this.client, "member");
      let memberEmbed = this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.help.member, contentMember, this.client.embeds.general_color, true);  
      let contentEco = this.client.utils.commandsList(this.client, "economy");
      let ecoEmbed = this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.help.economy, contentEco, this.client.embeds.general_color, true);  
      let contentUtility = this.client.utils.commandsList(this.client, "utility");
      let utilityEmbed = this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.help.utility, contentUtility, this.client.embeds.general_color, true);  
      let contentMod = this.client.utils.commandsList(this.client, "moderation");
      let modEmbed = this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.help.mod, contentMod, this.client.embeds.general_color, true);  
      let contentMusic = this.client.utils.commandsList(this.client, "music");
      let musicEmbed = this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.help.music, contentMusic, this.client.embeds.general_color, true);  
      let contentFun = this.client.utils.commandsList(this.client, "fun");
      let funEmbed = this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.help.fun, contentFun, this.client.embeds.general_color, true);  
      let contentGw = this.client.utils.commandsList(this.client, "giveaway");
      let gwEmbed = this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.help.giveaway, contentGw, this.client.embeds.general_color, true);  
      
      let data = [];
      let embeds = [helpMenu, memberEmbed, ecoEmbed, utilityEmbed, modEmbed, musicEmbed, funEmbed, gwEmbed];
      let embedNames = ["main_menu", "member", "economy",
       "utility", "moderation", "music", "fun", "giveaway"];

      let helpList = this.client.config.general.help.list;

      for(const list of helpList) {
        data.push({
          label: list.name,
          value: "val_" + list.category.toLowerCase(),
          emoji: list.emoji,
          embed: embeds[embedNames.indexOf(list.category.toLowerCase())],
        })
      }
      
      paginateSelect(this.client, interaction, helpMenu, {
        id: "help",
        placeholder: this.client.language.titles.help.placeholder,
        options: data
      });
    } else {
      let cmd = this.client.commands.get(commandArg);
      if (!cmd) return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, `Error`
        , `You have entered invalid command/category.`, this.client.embeds.error_color)] });

      let cmdInfo = new Discord.EmbedBuilder()
        .setColor(this.client.embeds.help.color);
        
      if(this.client.embeds.commandInfo.title) cmdInfo.setTitle(this.client.embeds.commandInfo.title);
      let field = this.client.embeds.commandInfo.fields;
      for(let i = 0; i < this.client.embeds.commandInfo.fields.length; i++) {
        cmdInfo.addFields([{ name: field[i].title, value: field[i].description.replace("<name>", `${cmd.name}`)
          .replace("<description>", `${cmd.description}`)
          .replace("<usage>", `${cmd.usage}`)
          .replace("<category>", `${this.client.utils.capitalizeFirstLetter(cmd.category)}`)
          .replace("<prefix>", prefix), inline: true }]);
      }
      
      if(this.client.embeds.commandInfo.footer == true) cmdInfo.setFooter({ text: user.username, iconURL: user.displayAvatarURL({ size: 1024, dynamic: true }) }).setTimestamp();
      if(this.client.embeds.commandInfo.thumbnail == true) cmdInfo.setThumbnail(user.displayAvatarURL({ dynamic: true }));
      
      if(this.client.embeds.commandInfo.description) cmdInfo.setDescription(this.client.embeds.commandInfo.description.replace("<name>", `${cmd.name}`)
        .replace("<description>", `${cmd.description}`)
        .replace("<usage>", `${cmd.usage}`)
        .replace("<category>", `${this.client.utils.capitalizeFirstLetter(cmd.category)}`)
        .replace("<prefix>", prefix));
  
      interaction.reply({ embeds: [cmdInfo], ephemeral: this.client.cmdConfig.help.ephemeral });
    }
  }
};
