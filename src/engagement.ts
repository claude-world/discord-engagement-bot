/**
 * Engagement engine — promotes interaction among members.
 *
 * Features:
 * - Topic mention alerts: notifies interested users when their topics come up
 * - Achievement tracking: first message, streak, helper badges
 */
import { Message, TextChannel } from 'discord.js';
import { getUserProfile, getActiveUsers } from './chat-logger.js';
import { getTextChannel } from './bot.js';
import { getChannelId } from './config.js';

// Cooldown: don't spam topic mentions (per topic, 1 hour)
const topicMentionCooldown = new Map<string, number>();
const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

// Achievement definitions
const ACHIEVEMENTS: Record<string, { name: string; check: (stats: MemberStats) => boolean }> = {
  first_message: {
    name: '初次發言',
    check: (s) => s.messageCount === 1,
  },
  active_3: {
    name: '活躍新星',
    check: (s) => s.messageCount >= 10,
  },
  helper: {
    name: '好幫手',
    check: (s) => s.replyCount >= 5,
  },
  streak_7: {
    name: '連續 7 天',
    check: (s) => s.streakDays >= 7,
  },
  topic_expert: {
    name: '話題專家',
    check: (s) => s.topTopicCount >= 20,
  },
};

interface MemberStats {
  messageCount: number;
  replyCount: number;
  streakDays: number;
  topTopicCount: number;
}

// Track daily activity for streak calculation
const dailyActive = new Map<string, Set<string>>(); // date → Set<userId>

function getMemberStats(userId: string, isReply: boolean): MemberStats {
  const profile = getUserProfile(userId);
  if (!profile) return { messageCount: 0, replyCount: 0, streakDays: 0, topTopicCount: 0 };

  // Track daily activity
  const today = new Date().toISOString().slice(0, 10);
  if (!dailyActive.has(today)) dailyActive.set(today, new Set());
  dailyActive.get(today)!.add(userId);

  // Calculate streak
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 30; i++) {
    const dateStr = d.toISOString().slice(0, 10);
    if (dailyActive.get(dateStr)?.has(userId)) {
      streak++;
    } else if (i > 0) {
      break;
    }
    d.setDate(d.getDate() - 1);
  }

  // Top topic count
  const topTopicCount = Math.max(0, ...Object.values(profile.topics));

  return {
    messageCount: profile.messageCount,
    replyCount: Object.values(profile.channels).reduce((a, b) => a + b, 0), // approximate
    streakDays: streak,
    topTopicCount,
  };
}

/**
 * Check for achievements after a message.
 * Returns achievement name if newly earned, null otherwise.
 */
export function checkAchievements(userId: string, isReply: boolean): string | null {
  const stats = getMemberStats(userId, isReply);

  for (const [id, achievement] of Object.entries(ACHIEVEMENTS)) {
    if (achievement.check(stats)) {
      // Simple dedup: only trigger on exact threshold
      if (id === 'first_message' && stats.messageCount !== 1) continue;
      if (id === 'active_3' && stats.messageCount !== 10) continue;
      if (id === 'streak_7' && stats.streakDays !== 7) continue;
      if (id === 'topic_expert' && stats.topTopicCount !== 20) continue;
      if (id === 'helper' && stats.replyCount !== 5) continue;

      return achievement.name;
    }
  }
  return null;
}

/**
 * Handle engagement for a message.
 * - Check achievements
 * - Announce if earned
 */
export async function handleEngagement(msg: Message): Promise<void> {
  if (msg.author.bot) return;

  const isReply = !!msg.reference?.messageId;
  const achievement = checkAchievements(msg.author.id, isReply);

  if (achievement) {
    try {
      await msg.reply(`🏅 恭喜 ${msg.author} 獲得成就：**${achievement}**！`);
    } catch {
      // Reply may fail if message is deleted
    }
  }
}

/**
 * Build a daily engagement prompt that includes polls/votes.
 */
export function buildDailyPollPrompt(): string {
  const topics = [
    '你今天用 Claude Code 做了什麼？',
    '最近有沒有發現什麼好用的 MCP server？',
    '你的 CLAUDE.md 有多長？',
    '你最常用的 Claude Code slash command 是什麼？',
    'Claude Code 讓你效率提升了多少？',
    '你用 Claude Code 寫過最大的專案是什麼？',
    '你偏好 Opus 還是 Sonnet？',
    '你有用過 Agent Teams 嗎？',
    '你的 .claude/ 目錄有多少 agents 和 skills？',
    '你覺得 Claude Code 最需要改進的地方是什麼？',
  ];

  const idx = new Date().getDate() % topics.length;
  return topics[idx]!;
}
