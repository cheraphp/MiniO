const Event = require("../../structures/Events");
const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const chalk = require("chalk");
const { channelRoleCheck } = require("../../utils/utils.js");
const cron = require("cron");

module.exports = class Ready extends Event {
	constructor(client) {
	  super(client, "ready");
		this.client = client;
	}

	async run() {
		const config = this.client.config;
		let error = false;
		let foundErrors = [];
		let foundWarn = [];
		let usedGuild = this.client.guilds.cache.get(config.general.guild);

    //== Look for Missing Directories and Files ==//
		channelRoleCheck(this.client, usedGuild, foundWarn);
		
		//== Check NodeJS Version ==//
		let nodeVersion = process.version.replace("v", "");
		if(nodeVersion.split(".")[1].length == 1) nodeVersion = nodeVersion.split(".")[0] + ".0" + nodeVersion.split(".")[1];
		
		if(nodeVersion < "16.09" && !process.version.replace("v", "").includes("16.9")) {
		  error = true;
			this.client.utils.sendError("Detected NodeJS Version (" + process.version + ") but expected v16.6+. Please Upgrade.");
			foundErrors.push("UnSupported NodeJS Version");
		}
		
		if(!this.client.config.general.guild || !this.client.guilds.cache.get(this.client.config.general.guild)) {
			error = true;
			this.client.utils.sendError("Config Field (general.guild) contains invalid Guild ID. Slash Commands won't work properly without this!");
			foundErrors.push("Invalid Guild ID");
		}

		//== Look for Invalid Channel & Roles in Config ==//
		channelRoleCheck(this.client, usedGuild, foundWarn);
		
		if(config.autoAnnounce.enabled == true) {
		  setInterval(() => {
		    const annRand = Math.floor(Math.random() * (config.autoAnnounce.list.length - 1) + 1);
  		  if (this.client.config.autoAnnounce.type == "EMBED") {
  		    let annEmbed = new Discord.EmbedBuilder()
  		      .setTitle(this.client.language.titles.auto_announce)
  		      .setColor(this.client.embeds.general_color)
  		      .setDescription(this.client.language.general.auto_announce.replace("<message>", this.client.config.autoAnnounce.list[annRand]));
  
  		    if (this.client.embeds.autoAnnounce.footer) annEmbed.setFooter({ text: this.client.embeds.footer, iconURL: this.client.user.displayAvatarURL({ dynamic: true }) }).setTimestamp();
  
  		    let annChannel = this.client.channels.cache.get(config.channels.announce);
  		    annChannel.send({ embeds: [annEmbed] });
  		  } else if (this.client.config.autoAnnounce.type == "TEXT") {
  		    let annChannel = this.client.channels.cache.get(config.channels.announce);
  		    annChannel.send({ content: this.client.config.autoAnnounce.list[annRand] });
  		  } else {
  		    this.client.utils.sendWarn("Invalid Message Type for Auto Announcements Message Provided.");
  		  }
		  }, config.autoAnnounce.interval * 1000);
		}
		
		if(config.status.change_random == true) {
			const rand = Math.floor(Math.random() * (config.status.messages.length - 1) + 1);
      
			this.client.user.setActivity(config.status.messages[rand].replace("<members>", this.client.users.cache.size)
			  .replace("<channels>", this.client.channels.cache.size)
			  .replace("<prefix>", this.client.config.general.prefix), { type: Discord.ActivityType[config.status.type] });
			
			setInterval(() => {
				const index = Math.floor(Math.random() * (config.status.messages.length - 1) + 1);
					this.client.user.setActivity(config.status.messages[index].replace("<members>", this.client.users.cache.size)
			      .replace("<channels>", this.client.channels.cache.size)
			      .replace("<prefix>", this.client.config.general.prefix), { type: Discord.ActivityType[config.status.type] });
			}, config.status.interval * 1000);
		} else {
			this.client.user.setActivity(this.client.config.status.message.replace("<members>", this.client.users.cache.size)
			  .replace("<channels>", this.client.channels.cache.size)
			  .replace("<prefix>", this.client.config.general.prefix), { type: Discord.ActivityType[config.status.type] });
		}
		this.client.guilds.cache.forEach((g) => {
			setInterval(() => {
				this.client.utils.updateStats(this.client, g)
			}, 180000);
		});

		(await db.all()).forEach(async(x) => {
      if(typeof x.value == "string") {
        if(x?.value?.startsWith("{") || x?.value?.startsWith("[") || x?.value?.startsWith("\"")) {
          try {
            const parseOld = JSON.parse(x.value);
            await db.set(x.id, parseOld)
          } catch(err) { }
        }
      }
    });

		//== CHECK BIRTHDAYS ==//
		const checkBirthdays = async() => {
			const isToday = (d) => d ? new Date().getDate() === new Date(d).getDate() &&
				new Date().getMonth() === new Date(d).getMonth() : false;
	
			let birthdays = (await db.all())
				.filter((i) => i.id.startsWith(`birthday_`))
				.sort((a, b) => b.value - a.value);
	
			let birthEmbed = birthdays
				.filter((b) => isToday(b.value))
				.map((s) => {
					let birthdayUsr = client.users.cache.get(s.id.split("_")[1]) || "N/A";
					return `${birthdayUsr}\n`;
				});
			
			const bdayChannel = this.client.utils.findChannel(usedGuild, config.channels.birthday);
			if(!bdayChannel) this.client.utils.sendError("Announce Birthdays options is enabled but Birthdays Channel is not setuped.")
	
			if (bdayChannel && birthEmbed.length > 0)
				bdayChannel.send({ embeds: [this.client.embedBuilder(this.client, null, this.client.language.titles.birthdays, this.client.language.member.bday_ann.replace("<birthdays>", birthEmbed), this.client.embeds.error_color)], ephemeral: this.client.cmdConfig.bet.ephemeral });
		}
	
		let bdayCron = new cron.CronJob("10 00 00 * * *", () => checkBirthdays(), {
			timezone: "Europe/Belgrade",
		});
	
		if(this.client.config.plugins.birthday.announce_birthdays == true) bdayCron.start();

		await this.client.utils.unbanChecker(this.client, usedGuild);

		//== UPDATE GIVEAWAYS ==//
		this.client.guilds.cache.forEach(g => {
      setInterval(async() => {
        await this.client.gw.checkGiveaway(this.client, g);
      }, 30000);
    });

    if(this.client.config.general.slash == true) {
			try {
				await this.client.guilds.cache.get(this.client.config.general.guild).commands.set(this.client.slashArray); 
				// await this.client.application.commands.set([]);
			} catch(e) {
				error = true;
				this.client.utils.sendError("Bot haven't been invited with applications.commands scope. Please ReInvite Bot with Required Scope(s).");
				foundErrors.push("Invalid Scopes");
			}
    } else {
			try {
				await this.client.guilds.cache.get(this.client.config.general.guild).commands.set([]);
				// await this.client.application.commands.set([]);
			} catch(e) {
				error = true;
				this.client.utils.sendError("Bot haven't been invited with applications.commands scope. Please ReInvite Bot with Required Scope(s).");
				foundErrors.push("Invalid Scopes");
			}
    }

		if(error || foundErrors.length > 0) {
			console.log("");
			console.log(chalk.gray("▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃"));
			console.log("")
			console.log(chalk.red.bold(`${config.general.name.toUpperCase()} ${config.version.toUpperCase()}`));
			console.log("");
			console.log(chalk.white(`There was an error while starting bot, please look above for detailed error.`));
			console.log(chalk.white(`Bot should be online if it's not an important error.`));
			console.log("");
			console.log(chalk.red(`Startup Errors (${foundErrors.length}): `) + chalk.white(foundErrors.join(", ").trim() + "."));
			console.log("")
			console.log(chalk.gray("▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃"));
			console.log(" ");
		} else {
			let addons = chalk.greenBright(`Loaded (${this.client.addonList.length}) Addons: `) + this.client.addonList.join(", ") + ".";
			let warns = chalk.green(`Startup Warnings (${foundWarn.length}): `) + foundWarn.join(", ").trim() + "."
			console.log("");
			console.log(chalk.gray("▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃"));
			console.log("")
			console.log(chalk.blue.bold(`${config.general.name.toUpperCase()} ${config.version.toUpperCase()}`));
			console.log("");
			console.log(chalk.white(`Thank you for using MiniO! Bot developed by cheraph#2358 - Void Development`));
			console.log("")
			console.log(this.client.addonList.length > 0 ? addons : "No Addons Loaded");
			console.log(foundWarn.length > 0 ? warns : "No Warnings or Errors on startup, good job!")
			console.log("")
			console.log(chalk.gray("▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃"));
			console.log(" ");
		}
	}
};
