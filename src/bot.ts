import { Client, GatewayIntentBits, TextChannel } from 'discord.js';
import { getConfig } from './config.js';

let client: Client | null = null;

export function getClient(): Client {
  if (!client) throw new Error('Bot not initialized. Call initBot() first.');
  return client;
}

export function isConnected(): boolean {
  return client?.isReady() ?? false;
}

export async function initBot(): Promise<Client> {
  const config = getConfig();

  client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Bot connection timed out after 30s'));
    }, 30_000);

    client!.once('ready', (c) => {
      clearTimeout(timeout);
      console.log(`[bot] Logged in as ${c.user.tag}`);
      resolve(client!);
    });

    client!.on('error', (err) => {
      console.error('[bot] Error:', err.message);
    });

    client!.login(config.DISCORD_BOT_TOKEN).catch((err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

export async function getTextChannel(channelId: string): Promise<TextChannel> {
  const c = getClient();
  const channel = await c.channels.fetch(channelId);
  if (!channel?.isTextBased() || !(channel instanceof TextChannel)) {
    throw new Error(`Channel ${channelId} is not a text channel`);
  }
  return channel;
}

export async function destroyBot(): Promise<void> {
  if (client) {
    client.destroy();
    client = null;
    console.log('[bot] Disconnected');
  }
}
