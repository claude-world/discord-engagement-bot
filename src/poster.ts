import { TextChannel } from 'discord.js';
import { getTextChannel } from './bot.js';
import { getChannelId } from './config.js';
import { addRecord } from './history.js';

const DISCORD_LIMIT = 2000;

/**
 * Split text into chunks that fit within Discord's 2000-char limit.
 * Prefers splitting at newlines; falls back to hard limit.
 */
export function sendChunked(text: string, limit = DISCORD_LIMIT): string[] {
  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= limit) {
      chunks.push(remaining);
      break;
    }

    let splitAt = remaining.lastIndexOf('\n', limit);
    if (splitAt < limit / 2) splitAt = limit; // Hard limit if no good break

    chunks.push(remaining.slice(0, splitAt));
    remaining = remaining.slice(splitAt).replace(/^\n/, '');
  }

  return chunks;
}

export interface PostResult {
  messageId: string;
  channel: string;
  contentLength: number;
  chunks: number;
}

/**
 * Post content to a named channel (e.g., 'daily-tips', 'general').
 */
export async function postToChannel(
  channelName: string,
  content: string,
  opts?: { type?: string; source?: 'scheduled' | 'manual' }
): Promise<PostResult> {
  const channelId = getChannelId(channelName);
  const channel = await getTextChannel(channelId);

  const chunks = sendChunked(content);
  const firstMsg = await channel.send(chunks[0]!);

  for (const chunk of chunks.slice(1)) {
    await channel.send(chunk);
  }

  // Record in history
  addRecord({
    channel: channelName,
    content,
    type: (opts?.type ?? 'other') as 'tip' | 'discussion' | 'roundup' | 'command' | 'other',
    source: opts?.source ?? 'manual',
    messageId: firstMsg.id,
  });

  console.log(`[poster] Sent ${chunks.length} chunk(s) to #${channelName} (${content.length} chars)`);

  return {
    messageId: firstMsg.id,
    channel: channelName,
    contentLength: content.length,
    chunks: chunks.length,
  };
}

/**
 * Post to the bot-logs channel (best-effort, won't throw).
 */
export async function logToBot(message: string): Promise<void> {
  try {
    const channelId = getChannelId('bot-logs');
    if (!channelId) return;
    const channel = await getTextChannel(channelId);
    const timestamp = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
    await channel.send(`\`${timestamp}\` ${message}`);
  } catch {
    // Best-effort logging
  }
}
