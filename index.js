index.js
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const prefix = "$";

client.once("ready", () => {
  console.log(`${client.user.tag} is online!`);
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  if (message.content === `${prefix}ping`) {
    message.reply("🏓 Pong! Bot is working!"); }
