const { set: setCommand } = require("../../handlers/commands");
const { set: setEvent } = require("../../handlers/events");
const fs = require("fs");
const yaml = require("js-yaml");
// Load Addon's Configuration, 'example' = addon name
const config = yaml.load(fs.readFileSync('./addons/example/addon_config.yml', 'utf8'));

module.exports.run = (client) => {
  setCommand(client, {
    name: "example",
    description: "Example Description",
    usage: "Example Usage",
    permissions: [],
    aliases: [],
    category: "addon",
    listed: false,
    slash: true,
    async run(message, args) {
      message.channel.send({ content: "Example Addon - Normal Command." });
    },
    async slashRun(interaction, args) {
      interaction.reply({ content: "Example Addon - Slash Command." })
    }
  });

  setEvent(client, {
    name: 'ready',
    async run() {
      console.log("Example Addon - ready Event")
    }
  });
}