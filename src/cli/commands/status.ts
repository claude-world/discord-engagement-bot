/**
 * bot status — show today's post count, last post, schedule config.
 * Offline: reads data files only.
 */
import { getTodayCount, getLastRecord } from '../../history.js';
import { getScheduleConfig } from '../../scheduler.js';
import type { Formatter } from '../output.js';

export function runStatus(fmt: Formatter): void {
  const todayCount = getTodayCount();
  const last = getLastRecord();
  const schedule = getScheduleConfig();

  const data = {
    todayCount,
    lastPost: last
      ? { timestamp: last.timestamp, channel: last.channel, type: last.type }
      : null,
    schedule: schedule.map(j => ({
      id: j.id,
      name: j.name,
      cron: j.cron,
      channel: j.channel,
      enabled: j.enabled,
    })),
  };

  if (fmt.json) {
    fmt.result(data);
    return;
  }

  fmt.info(`Today's posts: ${todayCount}`);
  if (last) {
    fmt.info(`Last post: ${last.timestamp} → #${last.channel} (${last.type})`);
  } else {
    fmt.info('Last post: (none)');
  }

  fmt.info('');
  fmt.info('Schedule:');
  for (const job of schedule) {
    const icon = job.enabled ? 'ON ' : 'OFF';
    fmt.info(`  [${icon}] ${job.name} (${job.cron}) → #${job.channel}`);
  }
}
