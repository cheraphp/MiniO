const fs = require('fs');
const addonCategories = fs.readdirSync('./addons/');
const chalk = require("chalk");

module.exports.init = (client) => {
  try {
    addonCategories.forEach(async (addon) => {
      fs.readdir(`./addons/${addon}/`, (err) => {
        if(!client.config.addons.disabled.includes(addon)) {
          console.log(chalk.green("[MiniO] ") + "Loading Addon " + addon);
          client.addonList.push(addon.charAt(0).toUpperCase() + "" + addon.slice(1));
        }
        if (err) return console.error(err);
        const init = async () => {
          const addons = fs.readdirSync(`./addons/${addon}`).filter(file => file.endsWith('.js'));
          for(const addonName of addons) {
            if(client.config.addons.disabled.includes(addon)) continue;
            const findFile = require(`../addons/${addon}/${addonName}`);
            if(typeof findFile.run != "function") continue;

            findFile.run(client);
          }
        };
        init();
      });
    });
  } catch (error) {
    console.log(error);
  }
}