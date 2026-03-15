import { TextChannel, ForumChannel } from 'discord.js';
import { getTextChannel, getForumChannel } from './bot.js';
import { getChannelId, getConfig } from './config.js';
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

export interface ForumPostResult {
  threadId: string;
  messageId: string;
  channel: string;
  threadName: string;
}

/**
 * Create a forum post (thread) in a forum channel.
 */
export async function postToForum(
  channelName: string,
  title: string,
  content: string,
  opts?: { tags?: string[] }
): Promise<ForumPostResult> {
  const channelId = getChannelId(channelName);
  const forum = await getForumChannel(channelId);

  // Resolve tag names to IDs
  let appliedTags: string[] | undefined;
  if (opts?.tags?.length) {
    const available = forum.availableTags;
    appliedTags = opts.tags
      .map(name => available.find(t => t.name.toLowerCase() === name.toLowerCase()))
      .filter((t): t is NonNullable<typeof t> => t !== undefined)
      .map(t => t.id);
  }

  const chunks = sendChunked(content);
  const thread = await forum.threads.create({
    name: title.slice(0, 100),
    message: { content: chunks[0]! },
    appliedTags,
  });

  // Send remaining chunks as follow-up messages
  for (const chunk of chunks.slice(1)) {
    await thread.send(chunk);
  }

  console.log(`[poster] Created forum post "${title}" in #${channelName} (${content.length} chars)`);

  return {
    threadId: thread.id,
    messageId: thread.id,
    channel: channelName,
    threadName: title,
  };
}

/**
 * List available tags for a forum channel.
 */
export async function getForumTags(channelName: string): Promise<Array<{ id: string; name: string }>> {
  const channelId = getChannelId(channelName);
  const forum = await getForumChannel(channelId);
  return forum.availableTags.map(t => ({ id: t.id, name: t.name }));
}

/**
 * Post to the bot-logs channel (best-effort, won't throw).
 */
export async function logToBot(message: string): Promise<void> {
  try {
    const config = getConfig();
    const channelId = config.CHANNEL_BOT_LOGS;
    if (!channelId) return;
    const channel = await getTextChannel(channelId);
    const timestamp = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
    await channel.send(`\`${timestamp}\` ${message}`);
  } catch {
    // Best-effort logging
  }
}
