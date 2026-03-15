/**
 * bot chat — recent messages, popular topics, active users.
 * Offline: reads data/chat-log.jsonl + data/users.json.
 */
import { getRecentChats, getPopularTopics, getActiveUsers } from '../../chat-logger.js';
import type { Formatter } from '../output.js';

export function runChatRecent(fmt: Formatter, limit: number): void {
  const chats = getRecentChats(limit);

  if (fmt.json) {
    fmt.result(chats);
    return;
  }

  if (chats.length === 0) {
    fmt.info('No chat messages found.');
    return;
  }

  fmt.table(chats.map(c => ({
    time: c.timestamp.slice(0, 16).replace('T', ' '),
    user: c.displayName,
    channel: '#' + c.channel,
    message: c.content.slice(0, 60).replace(/\n/g, ' '),
  })));
}

export function runChatTopics(fmt: Formatter): void {
  const topics = getPopularTopics(20);

  if (fmt.json) {
    fmt.result(topics);
    return;
  }

  if (topics.length === 0) {
    fmt.info('No topic data available.');
    return;
  }

  fmt.table(topics.map(t => ({
    topic: t.topic,
    mentions: t.count,
  })));
}

export function runChatUsers(fmt: Formatter, limit = 20): void {
  const users = getActiveUsers(limit);

  if (fmt.json) {
    fmt.result(users);
    return;
  }

  if (users.length === 0) {
    fmt.info('No user data available.');
    return;
  }

  fmt.table(users.map(u => ({
    user: u.displayName,
    messages: u.messageCount,
    lastSeen: u.lastSeen.slice(0, 10),
    topChannels: Object.entries(u.channels)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([ch]) => '#' + ch)
      .join(', '),
  })));
}
