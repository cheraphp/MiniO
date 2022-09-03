const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const { Player } = require("discord-player");
const { QuickDB } = require("quick.db");
const yaml = require('js-yaml');
const fs = require("fs");

module.exports = class BotClient extends Client {
  constructor() {
    super({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildBans,
      GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMembers, GatewayIntentBits.DirectMessages,
      GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.GuildPresences, GatewayIntentBits.MessageContent], 
      partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User, Partials.GuildMember]});

    // Files
    
    this.config = yaml.load(fs.readFileSync('./configs/config.yml', 'utf8'));
    this.language = yaml.load(fs.readFileSync('./configs/language.yml', 'utf8'));
    this.cmdConfig = yaml.load(fs.readFileSync('./configs/commands.yml', 'utf8'));
    this.embeds = yaml.load(fs.readFileSync('./configs/embeds.yml', 'utf8'));
    this.utils = require("../utils/utils.js");
    this.setupUtils = require("../utils/setupUtils.js");
    this.paginateContent = require("../embeds/paginateContent.js");
    this.gw = require("../managers/giveawayManager.js");
    this.embedBuilder = require("../embeds/embedBuilder.js");
   
    // End Of Files
    // Other //
    
    this.player = new Player(this, {
      leaveOnEnd: true,
      leaveOnStop: true,
      leaveOnEmpty: true,
      leaveOnEmptyCooldown: 60000,
      autoSelfDeaf: true,
      initialVolume: 100
    });

    this.db = new QuickDB();
    
    this.aliases = new Collection();
    this.commands = new Collection();
    this.slashCommands = new Collection();
    this.gwCreation = new Map();
    this.talkedRecently = new Set();
    this.slashArray = [];
    this.addonList = [];
    this.invites = {};
  }
  async login(token = this.config.general.token) {
    super.login(token);
  }
}