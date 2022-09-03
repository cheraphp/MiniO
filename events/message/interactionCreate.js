const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const Event = require("../../structures/Events");

let cooldownList = [];

module.exports = class InteractionCreate extends Event {
	constructor(...args) {
		super(...args);
	}

	async run(interaction) {
    const message = interaction.message;
    const user = interaction.user;
    const config = this.client.config;
    const language = this.client.language;
    if(interaction.guild) interaction.member = interaction.guild.members.cache.get(interaction.user.id);
    
    if(user.bot) return;
    if (interaction.type == Discord.InteractionType.ApplicationCommand) {
      // await interaction.deferReply().catch(() => {});

      const cmd = this.client.slashCommands.get(interaction.commandName);
      if (!cmd) return interaction.reply({ content: "> Error occured, please contact Bot Developer." });
      
      if(this.client.utils.permissionsLength(interaction, interaction.member, cmd.permissions) > 0 && !this.client.utils.hasRole(this.client, interaction.guild, interaction.member, this.client.config.roles.bypass.permission)) return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.language.titles.error, this.client.language.general.no_perm, this.client.embeds.error_color)] });

      const args = [];
      for (let option of interaction.options.data) {
        if (option.type === Discord.ApplicationCommandOptionType.Subcommand) {
          if (option.name) args.push(option.name);
          option.options?.forEach((x) => {
            if (x.value) args.push(x.value);
          });
        } else if (option.value) args.push(option.value);
      }

      if(this.client.cmdConfig[cmd.name]) {
        let cmdConfig = this.client.cmdConfig[cmd.name];
        if(cmdConfig.enabled == false) return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.general.cmd_disabled, this.client.embeds.error_color)] });
        if(cmdConfig && cmdConfig.roles.length > 0 && !this.client.utils.hasRole(this.client, interaction.guild, interaction.member, this.client.config.roles.bypass.permission)) {
          let cmdRoles = cmdConfig.roles.map((x) => this.client.utils.findRoles(interaction.guild, x));
          if(!this.client.utils.hasRole(this.client, interaction.guild, interaction.member, cmdConfig.roles)) return interaction.followUp({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.general.no_role.replace("<role>", cmdRoles.join(", ")), this.client.embeds.error_color)] });
        }
        let findCooldown = cooldownList.find((c) => c.name == cmd.name && c.id == interaction.user.id);
        if(!this.client.utils.hasRole(this.client, interaction.guild, interaction.member, this.client.config.roles.bypass.cooldown, true)) {
          if(findCooldown) {
            let time = this.client.utils.formatTime(findCooldown.expiring - Date.now());
            return interaction.followUp({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.general.cooldown.replace("<cooldown>", time), this.client.embeds.error_color)] });
          } else if(!findCooldown && this.client.cmdConfig[cmd.name].cooldown > 0) {
            let cooldown = {
              id: interaction.user.id,
              name: cmd.name,
              expiring: Date.now() + (this.client.cmdConfig[cmd.name].cooldown * 1000),
            };
    
            cooldownList.push(cooldown);
    
            setTimeout(() => {
              cooldownList.splice(cooldownList.indexOf(cooldown), 1);
            }, this.client.cmdConfig[cmd.name].cooldown * 1000);
          }
        }
      }

      cmd.slashRun(interaction, args);
    }

    if (interaction.isButton() && interaction.guild) {
      // Suggestion Vote
      let suggestionData = await db.get(`suggestion_${interaction.guild.id}_${interaction.message.id}`);
      if(interaction.customId.startsWith("vote_") && suggestionData) {
        let voteType = interaction.customId.split("_")[1].toLowerCase();

        if(voteType == "yes") {
          if(suggestionData.voters.some((u) => u.user == interaction.user.id)) return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.general.suggestions.already_voted, this.client.embeds.error_color)], ephemeral: true });
          let newData = {
            text: suggestionData.text,
            date: suggestionData.date,
            decision: suggestionData.decision,
            author: suggestionData.author,
            yes: parseInt(suggestionData.yes) + 1,
            no: parseInt(suggestionData.no),
            voters: suggestionData.voters.concat({ user: interaction.user.id, type: "yes" }),
            status: 'none',
          };
          await db.set(`suggestion_${interaction.guild.id}_${interaction.message.id}`, newData);
          interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.general.suggestions.vote_yes, this.client.embeds.success_color)], ephemeral: true });
          await this.client.utils.updateSuggestionEmbed(this.client, interaction);
        } else if(voteType == "no") {
          if(suggestionData.voters.some((u) => u.user == interaction.user.id)) return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.general.suggestions.already_voted, this.client.embeds.error_color)], ephemeral: true });
          let newData = {
            text: suggestionData.text,
            date: suggestionData.date,
            decision: suggestionData.decision,
            author: suggestionData.author,
            yes: parseInt(suggestionData.yes),
            no: parseInt(suggestionData.no) + 1,
            voters: suggestionData.voters.concat({ user: interaction.user.id, type: "no" }),
            status: 'none',
          };
          await db.set(`suggestion_${interaction.guild.id}_${interaction.message.id}`, newData);
          interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.general.suggestions.vote_no, this.client.embeds.success_color)], ephemeral: true });
          await this.client.utils.updateSuggestionEmbed(this.client, interaction);
        } else if(voteType == "reset") {
          if(!suggestionData.voters.some((u) => u.user == interaction.user.id)) return interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.general.suggestions.not_voted, this.client.embeds.error_color)], ephemeral: true });
          let removeYes = suggestionData.voters.find((d) => d.type == "yes" && d.user == interaction.user.id);
          let removeNo = suggestionData.voters.find((d) => d.type == "no" && d.user == interaction.user.id);

          let newData = {
            text: suggestionData.text,
            date: suggestionData.date,
            decision: suggestionData.decision,
            author: suggestionData.author,
            yes: removeYes ? parseInt(suggestionData.yes) - 1 : parseInt(suggestionData.yes),
            no: removeNo ? parseInt(suggestionData.no) - 1 : parseInt(suggestionData.no),
            voters: suggestionData.voters.filter((v) => v.user != interaction.user.id),
            status: 'none',
          };
          await db.set(`suggestion_${interaction.guild.id}_${interaction.message.id}`, newData);
          interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.general.suggestions.vote_reset, this.client.embeds.success_color)], ephemeral: true });
          await this.client.utils.updateSuggestionEmbed(this.client, interaction);
        }
      }
    }

    // Suggestion Decision
    if(interaction.isSelectMenu() && interaction.guild) {
      let decisionData = await db.get(`suggestionDecision_${interaction.guild.id}_${interaction.message.id}`);
      if(interaction.customId == "decision_menu" && decisionData && this.client.config.general.sugg_decision == true) {
        let suggChannel = this.client.utils.findChannel(interaction.guild, this.client.config.channels.suggestions);
        let fetchSuggestion = await suggChannel.messages.fetch({ message: decisionData });
        if(!fetchSuggestion) return;
        let decidedChannel = this.client.utils.findChannel(interaction.guild, this.client.config.channels.sugg_logs);
        let value = interaction.values[0];

        if(value == "decision_accept") {
          let acceptEmbed = new Discord.EmbedBuilder()
            .setTitle(this.client.language.titles.sugg_accepted)
            .setDescription(this.client.language.general.suggestions.decision_yes)
            .setColor(this.client.embeds.success_color)
            .setFooter(fetchSuggestion.embeds[0].footer)
            .setTimestamp();
          
          if(fetchSuggestion.embeds[0].thumbnail) acceptEmbed.setThumbnail(fetchSuggestion.embeds[0].thumbnail.url);
          if(fetchSuggestion.embeds[0].fields[0]) acceptEmbed.addFields(fetchSuggestion.embeds[0].fields);

          await interaction.message.delete();
          await fetchSuggestion.delete();
          decidedChannel.send({ embeds: [acceptEmbed] });
          interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.general.suggestions.accepted, this.client.embeds.success_color)], ephemeral: true });
        } else if(value == "decision_deny") {
          let denyEmbed = new Discord.EmbedBuilder()
            .setTitle(this.client.language.titles.sugg_denied)
            .setDescription(this.client.language.general.suggestions.decision_no)
            .setColor(this.client.embeds.error_color)
            .setFooter(fetchSuggestion.embeds[0].footer)
            .setTimestamp();

          if(fetchSuggestion.embeds[0].thumbnail) denyEmbed.setThumbnail(fetchSuggestion.embeds[0].thumbnail.url);
          if(fetchSuggestion.embeds[0].fields[0]) denyEmbed.addFields(fetchSuggestion.embeds[0].fields);

          await interaction.message.delete();
          await fetchSuggestion.delete();
          decidedChannel.send({ embeds: [denyEmbed] });
          interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.general.suggestions.denied, this.client.embeds.success_color)], ephemeral: true });
        } else if(value == "decision_delete") {
          await interaction.message.delete();
          await fetchSuggestion.delete();
          interaction.reply({ embeds: [this.client.embedBuilder(this.client, interaction.user, this.client.embeds.title, this.client.language.general.suggestions.deleted, this.client.embeds.success_color)], ephemeral: true });
          await db.delete(`suggestion_${interaction.guild.id}_${decisionData}`);
        }
      }
    }
	}
};
