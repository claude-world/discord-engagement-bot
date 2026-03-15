/**
 * Knowledge engine — captures and organizes community knowledge.
 *
 * Features:
 * - Auto-classify: detects tech questions and suggests #help
 * - Pin collection: 📌 reaction saves to knowledge base
 * - FAQ generation: builds FAQ from frequent questions
 */
import { Message, MessageReaction, User, PartialMessageReaction, PartialUser } from 'discord.js';
import { appendFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';

const DATA_DIR = resolve(process.cwd(), 'data');
const PINS_FILE = resolve(DATA_DIR, 'pinned.jsonl');
const FAQ_FILE = resolve(DATA_DIR, 'faq.json');

export interface PinnedEntry {
  timestamp: string;
  messageId: string;
  userId: string;
  username: string;
  channel: string;
  content: string;
  pinnedBy: string;
}

// Question indicators
const QUESTION_PATTERNS = [
  /怎麼/,
  /如何/,
  /為什麼/,
  /可以.*嗎/,
  /有人.*過嗎/,
  /請問/,
  /求助/,
  /不知道.*怎/,
  /有沒有/,
  /能不能/,
  /\?$/,
  /？$/,
  /how\s+(to|do|can)/i,
  /what\s+(is|are|does)/i,
  /why\s+(does|is|do)/i,
  /anyone\s+(know|tried)/i,
  /help/i,
  /error/i,
  /bug/i,
  /failed/i,
];

// Technical content indicators
const TECH_PATTERNS = [
  /claude\s*(code|\.md|-p|--)/i,
  /mcp/i,
  /\.claude\//,
  /CLAUDE\.md/,
  /hook/i,
  /agent/i,
  /skill/i,
  /npm|pnpm|yarn/i,
  /```/,
  /error:|Error:/,
  /TypeError|SyntaxError|ReferenceError/,
  /import\s+/,
  /function\s+/,
  /const\s+/,
];

/**
 * Check if a message looks like a technical question.
 */
export function isTechQuestion(content: string): boolean {
  const isQuestion = QUESTION_PATTERNS.some(p => p.test(content));
  const isTech = TECH_PATTERNS.some(p => p.test(content));
  return isQuestion && isTech;
}

/**
 * Handle auto-classification.
 * If a tech question is posted in #general, suggest #help.
 */
export async function handleAutoClassify(msg: Message): Promise<void> {
  if (msg.author.bot) return;

  const channelName = (msg.channel as any).name;

  // Only suggest redirect if in #general and it's a tech question
  if (channelName !== 'general') return;
  if (msg.content.length < 20) return;
  if (!isTechQuestion(msg.content)) return;

  try {
    await msg.reply(
      `💡 這看起來是技術問題！可以考慮發到 #help，那裡更容易得到回答。`
    );
  } catch {
    // Silently fail
  }
}

/**
 * Handle 📌 reaction — save to pinned knowledge.
 */
export async function handlePinReaction(
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser,
): Promise<void> {
  if (reaction.emoji.name !== '📌') return;

  // Fetch full message if partial
  const msg = reaction.message.partial
    ? await reaction.message.fetch()
    : reaction.message;

  if (!msg.content || msg.author.bot) return;

  const entry: PinnedEntry = {
    timestamp: new Date().toISOString(),
    messageId: msg.id,
    userId: msg.author.id,
    username: msg.author.username,
    channel: (msg.channel as any).name ?? 'unknown',
    content: msg.content,
    pinnedBy: user.id,
  };

  mkdirSync(dirname(PINS_FILE), { recursive: true });
  appendFileSync(PINS_FILE, JSON.stringify(entry) + '\n');

  console.log(`[knowledge] Pinned message by ${msg.author.username} in #${entry.channel}`);

  // React with ✅ to confirm
  try {
    await msg.react('✅');
  } catch {}
}

/**
 * Get all pinned entries.
 */
export function getPinnedEntries(): PinnedEntry[] {
  try {
    if (!existsSync(PINS_FILE)) return [];
    return readFileSync(PINS_FILE, 'utf-8')
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line));
  } catch {
    return [];
  }
}

/**
 * Get pinned entries formatted as FAQ-style content.
 */
export function getPinnedSummary(): string {
  const pins = getPinnedEntries();
  if (pins.length === 0) return '';

  let summary = '社群精華收錄（📌 標記的訊息）：\n';
  for (const pin of pins.slice(-10)) {
    const preview = pin.content.slice(0, 100).replace(/\n/g, ' ');
    summary += `- [${pin.channel}] ${pin.username}: ${preview}\n`;
  }
  return summary;
}
