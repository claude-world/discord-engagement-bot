/**
 * Backfill chat history from Discord.
 * Fetches all messages from all channels and stores them.
 * Usage: npx tsx src/backfill.ts
 */
import { Client, GatewayIntentBits, TextChannel, Collection, Message } from 'discord.js';
import { getConfig, getChannelNames } from './config.js';
import { logMessage } from './chat-logger.js';

async function fetchAllMessages(channel: TextChannel): Promise<number> {
  let count = 0;
  let lastId: string | undefined;

  while (true) {
    const options: { limit: number; before?: string } = { limit: 100 };
    if (lastId) options.before = lastId;

    const messages: Collection<string, Message> = await channel.messages.fetch(options);
    if (messages.size === 0) break;

    for (const msg of messages.values()) {
      logMessage(msg);
      count++;
    }

    lastId = messages.last()?.id;

    // Rate limit protection
    await new Promise(r => setTimeout(r, 500));
  }

  return count;
}

async function main() {
  const config = getConfig();

  console.log('[backfill] Starting chat history backfill...');

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  await new Promise<void>((resolve, reject) => {
    client.once('ready', () => resolve());
    client.login(config.DISCORD_BOT_TOKEN).catch(reject);
  });

  console.log(`[backfill] Connected as ${client.user?.tag}`);

  const guild = client.guilds.cache.first();
  if (!guild) {
    console.error('[backfill] No guild found');
    process.exit(1);
  }

  const channels = guild.channels.cache.filter(
    (ch): ch is TextChannel => ch instanceof TextChannel
  );

  let totalMessages = 0;

  for (const [, channel] of channels) {
    console.log(`[backfill] Fetching #${channel.name}...`);
    try {
      const count = await fetchAllMessages(channel);
      console.log(`[backfill]   → ${count} messages`);
      totalMessages += count;
    } catch (err) {
      console.error(`[backfill]   → Error: ${(err as Error).message}`);
    }
  }

  console.log(`\n[backfill] Done! Total: ${totalMessages} messages archived.`);

  client.destroy();
  process.exit(0);
}

main().catch((err) => {
  console.error('[backfill] Fatal:', err);
  process.exit(1);
});
