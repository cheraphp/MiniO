const Command = require("../../structures/Command");
const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const fs = require("fs");

module.exports = class LoadBackup extends Command {
  constructor(client) {
    super(client, {
      name: "loadbackup",
      description: client.cmdConfig.loadbackup.description,
      usage: client.cmdConfig.loadbackup.usage,
      permissions: client.cmdConfig.loadbackup.permissions,
      aliases: client.cmdConfig.loadbackup.aliases,
      category: "utility",
      listed: client.cmdConfig.loadbackup.enabled,
      slash: true,
      options: [{
        name: "id",
        type: Discord.ApplicationCommandOptionType.String,
        description: "Backup ID",
        required: true,
      }]
    });
  }

  async run(message, args) {
    let backupId = args[0];
    if(!backupId) return message.channel.send({ embeds: [this.client.utils.validUsage(this.client, message, this.client.cmdConfig.loadbackup.usage)] });

    fs.exists("./backups/" + backupId + ".json", async (exists) => {
      if(exists) {
        let backupEmbed = new Discord.EmbedBuilder()
          .setTitle(this.client.embeds.backup.load.title)
          .setDescription(this.client.embeds.backup.load.description)
          .setColor(this.client.embeds.backup.load.color);

        if(this.client.embeds.backup.load.footer) backupEmbed.setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

        const row = new Discord.ActionRowBuilder()
          .addComponents(
            new Discord.ButtonBuilder()
              .setEmoji(this.client.config.emojis.backup.load_all || {})
              .setCustomId("load_all")
              .setLabel(this.client.embeds.backup.load.buttons.all)
              .setStyle(Discord.ButtonStyle.Primary),
          )
          .addComponents(
            new Discord.ButtonBuilder()
              .setEmoji(this.client.config.emojis.backup.load_roles || {})
              .setCustomId("load_roles")
              .setLabel(this.client.embeds.backup.load.buttons.roles)
              .setStyle(Discord.ButtonStyle.Primary),
          )
          .addComponents(
            new Discord.ButtonBuilder()
              .setEmoji(this.client.config.emojis.backup.load_channels || {})
              .setCustomId("load_channels")
              .setLabel(this.client.embeds.backup.load.buttons.channels)
              .setStyle(Discord.ButtonStyle.Primary),
          );

        let m = await message.channel.send({ embeds: [backupEmbed], components: [row] });

        const filter = i => i.user.id == message.author.id;
        let collector = m.createMessageComponentCollector({ filter, type: Discord.ComponentType.Button, time: 120000 });

        collector.on("collect", async(b) => {
          if(b.customid == "load_all") {
            message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.backup.title, this.client.language.backup.loading.replace("<id>", backupId), this.client.embeds.general_color)] });    
            setTimeout(async() => {
              await loadRoles(this.client, message, backupId);
              this.client.utils.log("Started Restoring Roles from Backup.");
            }, 4000);
            setTimeout(async() => {
              await loadChannels(message, backupId);
              this.client.utils.log("Started Restoring Channels from Backup.");
              collector.stop("claimed");
            }, 10000);
          } else if(b.customId == "load_roles") {
            message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.backup.title, this.client.language.backup.loading.replace("<id>", backupId), this.client.embeds.general_color)] });    
            setTimeout(async() => {
              await loadRoles(this.client, message, backupId);
              this.client.utils.log("Started Restoring Roles from Backup.");
            }, 4000);
          } else if(b.customId == "load_channels") {
            message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.backup.title, this.client.language.backup.loading.replace("<id>", backupId), this.client.embeds.general_color)] });    
            setTimeout(async() => {
              await loadChannels(message, backupId);
              this.client.utils.log("Started Restoring Channels from Backup.");
              collector.stop("claimed");
            }, 4000);
          }
        });

        collector.on("end", (collected, reason) => {
          if(reason != "time") return;
          row.components[0].setStyle(Discord.ButtonStyle.Secondary).setDisabled(true);
          row.components[1].setStyle(Discord.ButtonStyle.Secondary).setDisabled(true);
          row.components[2].setStyle(Discord.ButtonStyle.Secondary).setDisabled(true);
            
          m.edit({ embeds: [backupEmbed], components: [row] });
        });
      } else {
        message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.backup.title, this.client.language.backup.invalid_id.replace("<id>", backupId), this.client.embeds.error_color)] });    
      }
    });
  }
  async slashRun(interaction, args) {
    let backupId = interaction.options.getString("id");
    
    fs.exists("./backups/" + backupId + ".json", async (exists) => {
      if(exists) {
        let backupEmbed = new Discord.EmbedBuilder()
          .setTitle(this.client.embeds.backup.load.title)
          .setDescription(this.client.embeds.backup.load.description)
          .setColor(this.client.embeds.backup.load.color);
    
        if(this.client.embeds.backup.load.footer) backupEmbed.setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });
    
        const row = new Discord.ActionRowBuilder()
          .addComponents(
            new Discord.ButtonBuilder()
              .setEmoji(this.client.config.emojis.backup.load_all || {})
              .setCustomId("load_all")
              .setLabel(this.client.embeds.backup.load.buttons.all)
              .setStyle(Discord.ButtonStyle.Primary),
          )
          .addComponents(
            new Discord.ButtonBuilder()
              .setEmoji(this.client.config.emojis.backup.load_roles || {})
              .setCustomId("load_roles")
              .setLabel(this.client.embeds.backup.load.buttons.roles)
              .setStyle(Discord.ButtonStyle.Primary),
          )
          .addComponents(
            new Discord.ButtonBuilder()
              .setEmoji(this.client.config.emojis.backup.load_channels || {})
              .setCustomId("load_channels")
              .setLabel(this.client.embeds.backup.load.buttons.channels)
              .setStyle(Discord.ButtonStyle.Primary),
          );
    
        let m = await interaction.reply({ embeds: [backupEmbed], components: [row], ephemeral: this.client.cmdConfig.loadbackup.ephemeral });
    
        const filter = i => i.user.id == interaction.user.id;
        let collector = m.createMessageComponentCollector({ filter, type: Discord.ComponentType.Button, time: 120000 });
    
        collector.on("collect", async(b) => {
          if(b.customid == "load_all") {
            interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.backup.title, this.client.language.backup.loading.replace("<id>", backupId), this.client.embeds.general_color)] });    
            setTimeout(async() => {
              await loadRoles(this.client, message, backupId);
              this.client.utils.log("Started Restoring Roles from Backup.");
            }, 4000);
            setTimeout(async() => {
              await loadChannels(this.client, message, backupId);
              this.client.utils.log("Started Restoring Channels from Backup.");
              collector.stop("claimed");
            }, 10000)
          } else if(b.customId == "load_roles") {
            interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.backup.title, this.client.language.backup.loading.replace("<id>", backupId), this.client.embeds.general_color)] });    
            setTimeout(async() => {
              await loadRoles(this.client, message, backupId);
              this.client.utils.log("Started Restoring Roles from Backup.");
            }, 4000);
          } else if(b.customId == "load_channels") {
            interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.backup.title, this.client.language.backup.loading.replace("<id>", backupId), this.client.embeds.general_color)] });    
            setTimeout(async() => {
              await loadChannels(message, backupId);
              this.client.utils.log("Started Restoring Channels from Backup.");
              collector.stop("claimed");
            }, 4000);
          }
        });
    
        collector.on("end", (collected, reason) => {
          if(reason != "time") return;
          row.components[0].setStyle(Discord.ButtonStyle.Secondary).setDisabled(true);
          row.components[1].setStyle(Discord.ButtonStyle.Secondary).setDisabled(true);
          row.components[2].setStyle(Discord.ButtonStyle.Secondary).setDisabled(true);
            
          m.edit({ embeds: [backupEmbed], components: [row] });
        });
      } else {
        interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.backup.title, this.client.language.backup.invalid_id.replace("<id>", backupId), this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.loadbackup.ephemeral });    
      }
    });
  }
};

const loadRoles = async(client, message, id) => {
  let data = await fs.readFileSync('./backups/' + id + '.json', {
    encoding: 'utf-8'
  });

  if(data) {
    data = JSON.parse(data);
    return new Promise(async (resolve) => {
      await message.guild.roles.cache.forEach(async(r) => {
        if(r.id == message.guild.id) return;
        try {
          await r.delete()
        } catch (e) { }
      });

      setTimeout(async() => {
        await data.rolesList.forEach(async b => {
          await message.guild.roles.create({
            name: b.name,
            color: b.hexColor,
            mentionable: b.mentionable,
            permissions: b.permissions,
            hoist: b.hoisted
          }).then(async(c) => {
            client.utils.log(`Restored Role ${c.name} from Backup.`);
          }).catch(err => { });
        });
        resolve();
      }, 7000);
    })
  }
}

const loadChannels = async(message, id) => {
  let data = await fs.readFileSync('./backups/' + id + '.json', {
    encoding: 'utf-8'
  });

  if(data) {
    data = JSON.parse(data);
    return new Promise(async (resolve) => {
      message.guild.channels.cache.forEach(async(c) => {
        await c.delete();
      });

      setTimeout(async() => {
        await data.channelList.filter(c => c.type == Discord.ChannelType.GuildCategory).concat(data.channelList.filter(c => c.type != Discord.ChannelType.GuildCategory))
          .forEach((channel, i) => {
            message.guild.channels.create(channel.name, { type: channel.type }).then(ch => {
              ch.setPosition(channel.position);
              if(channel.parent != null && channel.type != Discord.ChannelType.GuildCategory) {
                let chCategory = message.guild.channels.cache.find(ct => ct.name == channel.parent);
                setTimeout(async() => {
                  ch.setParent(chCategory);
                }, 1000);
              }
            })
        })
        resolve();
      }, 7000);
    })
  }
}
