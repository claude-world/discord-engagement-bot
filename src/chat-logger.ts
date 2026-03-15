/**
 * Chat logger — records all Discord messages and tracks user interests.
 * Stores in data/chat-log.jsonl (append-only, one JSON per line).
 * Stores user profiles in data/users.json.
 */
import { Message } from 'discord.js';
import { appendFileSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';

const DATA_DIR = resolve(process.cwd(), 'data');
const CHAT_LOG = resolve(DATA_DIR, 'chat-log.jsonl');
const USERS_FILE = resolve(DATA_DIR, 'users.json');

export interface ChatEntry {
  timestamp: string;
  userId: string;
  username: string;
  displayName: string;
  channel: string;
  channelId: string;
  content: string;
  attachments: number;
  replyTo?: string;
  messageId: string;
}

export interface UserProfile {
  userId: string;
  username: string;
  displayName: string;
  firstSeen: string;
  lastSeen: string;
  messageCount: number;
  channels: Record<string, number>;  // channel → message count
  topics: Record<string, number>;    // keyword → mention count
  reactions: Record<string, number>; // emoji → count
}

// Topic keywords to track
const TOPIC_KEYWORDS: Record<string, string[]> = {
  'claude-md': ['claude.md', 'claudemd', 'claude md'],
  'mcp': ['mcp', 'model context protocol', 'mcp server'],
  'hooks': ['hook', 'hooks', 'pretooluse', 'posttooluse'],
  'agents': ['agent', 'agents', 'sub-agent', 'subagent'],
  'skills': ['skill', 'skills', 'skill.md'],
  'commands': ['command', 'commands', 'slash command'],
  'workflow': ['workflow', 'auto-cycle', 'auto-loop'],
  'git': ['git', 'commit', 'pr', 'pull request', 'branch'],
  'testing': ['test', 'tests', 'tdd', 'vitest', 'jest'],
  'typescript': ['typescript', 'ts', 'type'],
  'python': ['python', 'pip', 'pypi'],
  'react': ['react', 'next.js', 'nextjs', 'astro'],
  'api': ['api', 'anthropic api', 'sdk', 'claude api'],
  'debug': ['debug', 'error', 'bug', 'fix'],
  'performance': ['performance', 'speed', 'optimize', 'cost'],
  'agent-teams': ['agent teams', 'team', 'multi-agent'],
  'worktree': ['worktree', 'isolation'],
  'plugins': ['plugin', 'plugins', 'marketplace'],
};

let users: Record<string, UserProfile> | null = null;

function ensureDir() {
  mkdirSync(DATA_DIR, { recursive: true });
}

function loadUsers(): Record<string, UserProfile> {
  if (users !== null) return users;
  try {
    if (existsSync(USERS_FILE)) {
      users = JSON.parse(readFileSync(USERS_FILE, 'utf-8'));
      return users!;
    }
  } catch {}
  users = {};
  return users;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

function saveUsers(): void {
  // Debounce writes to avoid blocking I/O on every message
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    ensureDir();
    writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    saveTimer = null;
  }, 5000);
}

function detectTopics(content: string): string[] {
  const lower = content.toLowerCase();
  const found: string[] = [];
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      found.push(topic);
    }
  }
  return found;
}

/**
 * Log a message and update user profile.
 */
export function logMessage(msg: Message): void {
  if (msg.author.bot) return;

  const entry: ChatEntry = {
    timestamp: msg.createdAt.toISOString(),
    userId: msg.author.id,
    username: msg.author.username,
    displayName: msg.member?.displayName ?? msg.author.displayName,
    channel: (msg.channel as any).name ?? 'unknown',
    channelId: msg.channelId,
    content: msg.content,
    attachments: msg.attachments.size,
    replyTo: msg.reference?.messageId,
    messageId: msg.id,
  };

  // Append to JSONL log
  ensureDir();
  appendFileSync(CHAT_LOG, JSON.stringify(entry) + '\n');

  // Update user profile
  const allUsers = loadUsers();
  const now = new Date().toISOString();
  let user = allUsers[msg.author.id];

  if (!user) {
    user = {
      userId: msg.author.id,
      username: msg.author.username,
      displayName: entry.displayName,
      firstSeen: now,
      lastSeen: now,
      messageCount: 0,
      channels: {},
      topics: {},
      reactions: {},
    };
    allUsers[msg.author.id] = user;
  }

  user.lastSeen = now;
  user.username = msg.author.username;
  user.displayName = entry.displayName;
  user.messageCount++;
  user.channels[entry.channel] = (user.channels[entry.channel] ?? 0) + 1;

  // Track topics
  const topics = detectTopics(msg.content);
  for (const topic of topics) {
    user.topics[topic] = (user.topics[topic] ?? 0) + 1;
  }

  saveUsers();
}

/**
 * Log a reaction and update user profile.
 */
export function logReaction(userId: string, emoji: string): void {
  const allUsers = loadUsers();
  const user = allUsers[userId];
  if (!user) return;
  user.reactions[emoji] = (user.reactions[emoji] ?? 0) + 1;
  saveUsers();
}

/**
 * Get top topics across all users (for content suggestions).
 */
export function getPopularTopics(limit = 10): Array<{ topic: string; count: number }> {
  const allUsers = loadUsers();
  const topicCounts: Record<string, number> = {};

  for (const user of Object.values(allUsers)) {
    for (const [topic, count] of Object.entries(user.topics)) {
      topicCounts[topic] = (topicCounts[topic] ?? 0) + count;
    }
  }

  return Object.entries(topicCounts)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Get most active users.
 */
export function getActiveUsers(limit = 10): UserProfile[] {
  const allUsers = loadUsers();
  return Object.values(allUsers)
    .sort((a, b) => b.messageCount - a.messageCount)
    .slice(0, limit);
}

/**
 * Get user profile.
 */
export function getUserProfile(userId: string): UserProfile | undefined {
  return loadUsers()[userId];
}

/**
 * Get recent chat entries (read from JSONL).
 */
export function getRecentChats(limit = 100): ChatEntry[] {
  try {
    if (!existsSync(CHAT_LOG)) return [];
    const lines = readFileSync(CHAT_LOG, 'utf-8').trim().split('\n');
    return lines
      .slice(-limit)
      .map(line => JSON.parse(line))
      .reverse();
  } catch {
    return [];
  }
}

/**
 * Get chat stats summary for content generation.
 */
export function getChatSummary(): string {
  const popular = getPopularTopics(5);
  const active = getActiveUsers(5);

  if (popular.length === 0) return '';

  let summary = '社群近期熱門話題（根據聊天記錄）：\n';
  for (const { topic, count } of popular) {
    summary += `- ${topic}: 被提及 ${count} 次\n`;
  }
  summary += `\n活躍成員: ${active.map(u => u.displayName).join(', ')}\n`;

  return summary;
}
