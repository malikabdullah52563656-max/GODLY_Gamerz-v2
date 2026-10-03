const {
  Client,
  GatewayIntentBits,
  EmbedBuilder
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ]
});

const giveaways = new Map();

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // $giveaway <seconds> <winners> <prize>
  if (message.content.startsWith('$giveaway')) {
    const args = message.content.split(' ').slice(1);

    const duration = Number(args[0]);
    const winners = Number(args[1]);
    const prize = args.slice(2).join(' ');

    if (!duration || !winners || !prize) {
      return message.reply(
        '❌ Usage: `$giveaway <seconds> <winners> <prize>`\nExample: `$giveaway 60 1 Nitro`'
      );
    }

    const endTime = Date.now() + duration * 1000;

    const embed = new EmbedBuilder()
      .setTitle('🎉 GIVEAWAY 🎉')
      .setDescription(
        `**Prize:** ${prize}\n` +
        `**Winners:** ${winners}\n\n` +
        `React with 🎉 to enter!\n\n` +
        `Ends <t:${Math.floor(endTime / 1000)}:R>`
      )
      .setFooter({ text: `Hosted by ${message.author.tag}` })
      .setTimestamp();

    const giveawayMessage = await message.channel.send({
      embeds: [embed]
    });

    await giveawayMessage.react('🎉');

    giveaways.set(giveawayMessage.id, {
      channelId: message.channel.id,
      prize,
      winners,
      ended: false
    });

    setTimeout(async () => {
      const giveaway = giveaways.get(giveawayMessage.id);
      if (!giveaway) return;

      giveaway.ended = true;

      const msg = await message.channel.messages
        .fetch(giveawayMessage.id)
        .catch(() => null);

      if (!msg) return;

      const reaction = msg.reactions.cache.get('🎉');

      if (!reaction) {
        return message.channel.send('😢 No one entered the giveaway.');
      }

      const users = await reaction.users.fetch();
      const entries = users.filter(user => !user.bot);

      if (entries.size === 0) {
        return message.channel.send('😢 No one entered the giveaway.');
      }

      const userArray = [...entries.values()];
      const selected = [];

      for (let i = 0; i < Math.min(winners, userArray.length); i++) {
        const randomIndex = Math.floor(Math.random() * userArray.length);
        selected.push(userArray.splice(randomIndex, 1)[0]);
      }

      giveaway.winnerIds = selected.map(user => user.id);

      const mentions = selected.map(user => `<@${user.id}>`).join(', ');

      await message.channel.send(
        `🎉 Congratulations ${mentions}! You won **${prize}**!`
      );
    }, duration * 1000);
  }

  // $reroll <message ID>
  if (message.content.startsWith('$reroll')) {
    const args = message.content.split(' ').slice(1);
    const messageId = args[0];

    if (!messageId) {
      return message.reply(
        '❌ Usage: `$reroll MESSAGE_ID`'
      );
    }

    const giveaway = giveaways.get(messageId);

    if (!giveaway || !giveaway.ended) {
      return message.reply(
        '❌ I could not find an ended giveaway with that message ID.'
      );
    }

    const channel = await client.channels.fetch(giveaway.channelId);
    const giveawayMessage = await channel.messages.fetch(messageId);

    const reaction = giveawayMessage.reactions.cache.get('🎉');

    if (!reaction) {
      return message.reply('❌ No giveaway entries found.');
    }

    const users = await reaction.users.fetch();
    const entries = users.filter(user => !user.bot);

    const available = [...entries.values()].filter(
      user => !giveaway.winnerIds.includes(user.id)
    );

    if (available.length === 0) {
      return message.reply('❌ There are no other eligible entrants.');
    }

    const newWinner =
      available[Math.floor(Math.random() * available.length)];

    giveaway.winnerIds.push(newWinner.id);

    await message.channel.send(
      `🔄 **Giveaway rerolled!**\n🎉 New winner: <@${newWinner.id}>\n🏆 Prize: **${giveaway.prize}**`
    );
  }
});

client.login(process.env.MTU1Mzc5Njk5NTUyODAwMzYwNA.Gm4G3H.MT-J3SA-oZaeIPxas6W7VwjqSV6s0MYfAvT8bo);


