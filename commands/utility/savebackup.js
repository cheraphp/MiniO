const Command = require("../../structures/Command");
const Discord = require("discord.js");
const crypto = require("crypto");
const fs = require("fs");

module.exports = class SaveBackup extends Command {
  constructor(client) {
    super(client, {
      name: "savebackup",
      description: client.cmdConfig.savebackup.description,
      usage: client.cmdConfig.savebackup.usage,
      permissions: client.cmdConfig.savebackup.permissions,
      aliases: client.cmdConfig.savebackup.aliases,
      category: "utility",
      listed: client.cmdConfig.savebackup.enabled,
      slash: true
    });
  }

  async run(message, args) {
    const bId = crypto.randomBytes(3).toString("hex");

    message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.backup.title, this.client.language.backup.started, this.client.embeds.general_color)] });

    const backup = {
      id: message.guild.id,
      channelList: message.guild.channels.cache.map(ch => {
        return {
          name: ch.name,
          id: ch.id,
          type: ch.type,
          parent: ch.parent == null ? null : ch.parent.name,
          permissions: ch.permissionOverwrites.cache.map(o => {
            return {
              id: o.id,
              type: o.type,
              allowed: [...new Discord.PermissionsBitField(o.allow)],
              denied: [...new Discord.PermissionsBitField(o.deny)]
            }
          })
        }
      }),
      rolesList: message.guild.roles.cache.filter(t => t.id != message.guild.id)
        .sort((a, b) => b.position - a.position).map(o => {
          return {
            name: o.name,
            id: o.id,
            color: o.color,
            position: o.position,
            mentionable: o.mentionable,
            hexColor: o.hexColor,
            hoisted: o.hoisted,
            permissions: o.permissions
          }
      })
    }

    await saveBackup(backup, bId);

    message.channel.send({ embeds: [ this.client.embedBuilder(this.client, message.author, this.client.language.backup.title, this.client.language.backup.done.replace("<id>", bId), this.client.embeds.general_color)] });    
  }
  async slashRun(interaction, args) {
    const bId = crypto.randomBytes(3).toString("hex");

    interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.backup.title, this.client.language.backup.started, this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.savebackup.ephemeral });

    const backup = {
      id: interaction.guild.id,
      channelList: interaction.guild.channels.cache.map(ch => {
        return {
          name: ch.name,
          id: ch.id,
          type: ch.type,
          parent: ch.parent == null ? null : ch.parent.name,
          permissions: ch.permissionOverwrites.cache.map(o => {
            return {
              id: o.id,
              type: o.type,
              allowed: [...new Discord.PermissionsBitField(o.allow)],
              denied: [...new Discord.PermissionsBitField(o.deny)]
            }
          })
        }
      }),
      rolesList: interaction.guild.roles.cache.filter(t => t.id != interaction.guild.id && !t.managed)
        .sort((a, b) => b.position - a.position).map(o => {
          return {
            name: o.name,
            id: o.id,
            color: o.color,
            position: o.position,
            mentionable: o.mentionable,
            hexColor: o.hexColor,
            hoisted: o.hoisted,
            permissions: o.permissions
          }
      })
    }

    await saveBackup(backup, bId);

    interaction.reply({ embeds: [ this.client.embedBuilder(this.client, interaction.user, this.client.language.backup.title, this.client.language.backup.done.replace("<id>", bId), this.client.embeds.general_color)], ephemeral: this.client.cmdConfig.savebackup.ephemeral });  
  }
};

const saveBackup = async(data, id) => {
  fs.exists('./backups', exists => {
    if(exists) {
      writeData(data, id);
    } else {
      fs.mkdir('./backups', function (err) {
        writeData(data, id);
      })
    }
  })
}

const writeData = async(data, id) => {
  await fs.writeFileSync("backups/" + id + ".json", JSON.stringify(data));
}
