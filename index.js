});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  if (message.content === "$ping") {
    message.reply("🏓 Pong!");
  }
});

client.login(process.env.DISCORD_TOKEN)



