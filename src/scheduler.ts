import cron from 'node-cron';
import { generateContent } from './content-generator.js';
import { postToChannel, logToBot } from './poster.js';
import { buildDailyTipPrompt, DAILY_TIP_FALLBACKS } from './prompts/daily-tip.js';
import { buildDiscussionPrompt, DISCUSSION_FALLBACKS } from './prompts/discussion.js';
import { buildWeeklyRoundupPrompt } from './prompts/weekly-roundup.js';
import { checkVersion } from './version-checker.js';

export interface ScheduleJob {
  id: string;
  name: string;
  cron: string;
  channel: string;
  enabled: boolean;
  type: 'tip' | 'discussion' | 'roundup' | 'command' | 'other';
}

const DEFAULT_SCHEDULE: ScheduleJob[] = [
  { id: 'dailyTip', name: '每日技巧', cron: '0 9 * * 1-5', channel: 'daily-tips', enabled: true, type: 'tip' },
  { id: 'discussion', name: '午間討論', cron: '0 12 * * 1-5', channel: 'daily-tips', enabled: true, type: 'discussion' },
  { id: 'coworkRemind', name: 'Cowork 提醒', cron: '0 20 * * 3', channel: 'general', enabled: true, type: 'other' },
  { id: 'weeklyRoundup', name: '週五週報', cron: '0 18 * * 5', channel: 'announcements', enabled: true, type: 'roundup' },
  { id: 'weekendChallenge', name: '週末挑戰', cron: '0 9 * * 6', channel: 'daily-tips', enabled: true, type: 'other' },
  { id: 'versionCheck', name: '版本檢查', cron: '0 */4 * * *', channel: 'news', enabled: true, type: 'other' },
];

const activeTasks = new Map<string, cron.ScheduledTask>();
let scheduleConfig: ScheduleJob[] = [...DEFAULT_SCHEDULE];

type ContentGenerator = () => Promise<string>;

const GENERATORS: Record<string, ContentGenerator> = {
  dailyTip: () => generateContent(buildDailyTipPrompt()),
  discussion: () => generateContent(buildDiscussionPrompt()),
  coworkRemind: async () => `**Cowork 提醒** 🔔

明天（週三）晚上的 Cowork session 準備好了嗎？

帶上你的專案，一起線上寫 code！
不管是新功能、修 bug、還是學新東西，都歡迎。

> Cowork 不需要報名，時間到了就上線，各做各的，有問題隨時問。

明天見！`,
  weeklyRoundup: () => generateContent(buildWeeklyRoundupPrompt()),
  versionCheck: async () => { await checkVersion(); return ''; },
  weekendChallenge: async () => `**週末挑戰** 🏆

這週末試試看：

用 Claude Code 完成一個你一直想做但沒時間做的小專案。

不管是：
- 一個 CLI 工具
- 一個 MCP server
- 重構一段陳年程式碼
- 自動化一個日常流程

週一來 #general 分享你的成果！

💬 你打算做什麼？`,
};

async function executeJob(job: ScheduleJob): Promise<void> {
  console.log(`[scheduler] Executing: ${job.name} → #${job.channel}`);
  try {
    const generator = GENERATORS[job.id];
    if (!generator) {
      console.error(`[scheduler] No generator for job: ${job.id}`);
      return;
    }

    const content = await generator();
    if (!content) return; // Some jobs handle posting internally (e.g., versionCheck)
    await postToChannel(job.channel, content, { type: job.type, source: 'scheduled' });
    await logToBot(`✅ ${job.name} → #${job.channel}`);
  } catch (err) {
    const msg = (err as Error).message;
    console.error(`[scheduler] Failed: ${job.name} -`, msg);
    await logToBot(`❌ ${job.name} 失敗: ${msg.slice(0, 100)}`);
  }
}

export function startScheduler(): void {
  stopScheduler(); // Clear existing

  for (const job of scheduleConfig) {
    if (!job.enabled) continue;

    if (!cron.validate(job.cron)) {
      console.error(`[scheduler] Invalid cron for ${job.id}: ${job.cron}`);
      continue;
    }

    const task = cron.schedule(job.cron, () => executeJob(job), {
      timezone: 'Asia/Taipei',
    });

    activeTasks.set(job.id, task);
    console.log(`[scheduler] Scheduled: ${job.name} (${job.cron})`);
  }

  console.log(`[scheduler] Started ${activeTasks.size} jobs`);
}

export function stopScheduler(): void {
  for (const [id, task] of activeTasks) {
    task.stop();
  }
  activeTasks.clear();
}

export function getSchedule(): ScheduleJob[] {
  return scheduleConfig.map(job => ({
    ...job,
    enabled: job.enabled && activeTasks.has(job.id),
  }));
}

export function updateJob(id: string, updates: Partial<Pick<ScheduleJob, 'cron' | 'channel' | 'enabled'>>): ScheduleJob | null {
  const job = scheduleConfig.find(j => j.id === id);
  if (!job) return null;

  if (updates.cron !== undefined) job.cron = updates.cron;
  if (updates.channel !== undefined) job.channel = updates.channel;
  if (updates.enabled !== undefined) job.enabled = updates.enabled;

  // Restart scheduler to apply changes
  startScheduler();
  return job;
}

export function getNextRun(job: ScheduleJob): Date | null {
  // Simple next-run calculation using node-cron's validate
  // For display purposes only
  try {
    const interval = cron.schedule(job.cron, () => {}, { timezone: 'Asia/Taipei' });
    interval.stop();
    // node-cron doesn't expose next run time directly, return null for now
    return null;
  } catch {
    return null;
  }
}

/**
 * Trigger a job immediately (for testing or manual execution).
 */
export async function triggerJob(id: string): Promise<void> {
  const job = scheduleConfig.find(j => j.id === id);
  if (!job) throw new Error(`Unknown job: ${id}`);
  await executeJob(job);
}
