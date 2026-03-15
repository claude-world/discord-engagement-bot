import { Client, GatewayIntentBits, TextChannel, Events, Partials } from 'discord.js';
import { getConfig } from './config.js';
import { logMessage, logReaction } from './chat-logger.js';
import { handleMemberJoin } from './welcome.js';
import { handleEngagement } from './engagement.js';
import { handleAutoClassify, handlePinReaction } from './knowledge-engine.js';

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
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMessageReactions,
    ],
    partials: [
      Partials.Message,
      Partials.Reaction,
    ],
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

    // New member welcome
    client!.on(Events.GuildMemberAdd, (member) => {
      handleMemberJoin(member).catch(err =>
        console.error('[bot] Welcome error:', err.message)
      );
    });

    // Message handling: log + engagement + auto-classify
    client!.on(Events.MessageCreate, (msg) => {
      try { logMessage(msg); } catch {}

      // Don't process bot messages for engagement
      if (msg.author.bot) return;

      handleEngagement(msg).catch(() => {});
      handleAutoClassify(msg).catch(() => {});
    });

    // Reaction handling: log + pin collection
    client!.on(Events.MessageReactionAdd, (reaction, user) => {
      if (user.bot) return;

      try { logReaction(user.id, reaction.emoji.name ?? '?'); } catch {}

      handlePinReaction(reaction, user).catch(() => {});
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
