const fs = require('fs');
const categories = fs.readdirSync('./commands/');
const chalk = require("chalk");

module.exports.init = (client) => {
  try {
    console.log(chalk.green("[MiniO] ") + "Loading Commands");
    categories.forEach(async (category) => {
      fs.readdir(`./commands/${category}/`, (err) => {
        if (err) return console.error(err);
        const init = async () => {
          const commands = fs.readdirSync(`./commands/${category}`).filter(file => file.endsWith('.js'));
          for (const file of commands) {
            const f = require(`../commands/${category}/${file}`);
            const command = new f(client);
            client.commands.set(command.name.toLowerCase(), command);
            if(command.slash == true) {
              client.slashCommands.set(command.name.toLowerCase(), command);
              client.slashArray.push(command);
            }
            if (command.aliases && Array.isArray(command.aliases)) command.aliases.forEach(alias => client.aliases.set(alias, command.name));
          }
        };
        init();
      });
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports.set = (client, command) => {
  client.commands.set(command.name.toLowerCase(), command);
  if(command.slash == true) {
    client.slashCommands.set(command.name.toLowerCase(), command);
    client.slashArray.push(command);
  }
}