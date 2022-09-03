const fs = require("fs");
const BotClient = require("./structures/Client");
const yaml = require('js-yaml');

const config = yaml.load(fs.readFileSync('./configs/config.yml', 'utf8'));

const client = new BotClient(config.general.token)
client.login(config.general.token);

["commands", "events", "addons"].forEach(handler => {
  require(`./handlers/${handler}`).init(client);
});