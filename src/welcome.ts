/**
 * New member welcome system.
 * - Sends welcome message in #general when someone joins
 * - DMs the new member with community guide
 * - Tracks join events
 */
import { GuildMember, TextChannel } from 'discord.js';
import { getConfig, getChannelId } from './config.js';
import { getTextChannel } from './bot.js';
import { getPopularTopics } from './chat-logger.js';

const WELCOME_CHANNEL = 'general';

// Track recently welcomed members to suppress duplicate first-message achievement.
// Note: in-memory only — a bot restart within the TTL window may allow the achievement through.
const recentlyWelcomed = new Set<string>();
const WELCOME_SUPPRESS_TTL_MS = 5 * 60 * 1000; // 5 min

export function wasRecentlyWelcomed(userId: string): boolean {
  return recentlyWelcomed.has(userId);
}

/**
 * Handle new member join.
 */
export async function handleMemberJoin(member: GuildMember): Promise<void> {
  if (member.user.bot) return;

  console.log(`[welcome] New member: ${member.displayName}`);

  // Set BEFORE awaited sends so the guard is active even if channel/DM send fails
  recentlyWelcomed.add(member.id);
  setTimeout(() => recentlyWelcomed.delete(member.id), WELCOME_SUPPRESS_TTL_MS);

  // 1. Public welcome in #general
  try {
    const channelId = getChannelId(WELCOME_CHANNEL);
    const channel = await getTextChannel(channelId);

    const popularTopics = getPopularTopics(3)
      .map(t => t.topic)
      .join('、');

    await channel.send(
      `歡迎 ${member} 加入 **Claude World Taiwan**！👋\n\n` +
      `這裡是台灣最大的 Claude Code 進階使用者社群。` +
      `最近大家都在聊 **${popularTopics || 'Claude Code'}**。\n\n` +
      `有任何問題歡迎在 #help 發問，或直接在這裡聊！`
    );
  } catch (err) {
    console.error('[welcome] Failed to send public welcome:', (err as Error).message);
  }

  // 2. DM with community guide
  try {
    await member.send(
      `嗨 ${member.displayName}！歡迎加入 Claude World Taiwan 🎉\n\n` +
      `**快速上手：**\n` +
      `- 💬 #general — 主要聊天區，有什麼都可以問\n` +
      `- ❓ #help — 技術問題 Q&A\n` +
      `- 📢 #announcements — 重要公告\n` +
      `- 📰 #news — Claude Code 版本更新\n` +
      `- 🏆 #showcase — 分享你的專案\n` +
      `- 🎧 #cowork — 每週三線上 Cowork\n\n` +
      `**學習資源：**\n` +
      `- 🌐 網站：https://claude-world.com\n` +
      `- 📚 24 門免費課程：https://claude-world.com/tutorials\n` +
      `- 🛠️ 開源工具：https://github.com/claude-world\n\n` +
      `有任何問題隨時問，社群裡大家都很友善！`
    );
  } catch {
    // DM may be disabled — that's OK
    console.log(`[welcome] Could not DM ${member.displayName} (DM disabled)`);
  }
}
