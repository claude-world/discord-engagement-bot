/**
 * bot schedule — list, trigger, update schedule jobs.
 * list: offline. trigger/update: connected.
 */
import cron from 'node-cron';
import { getScheduleConfig, triggerJob, updateJob, type ScheduleJob } from '../../scheduler.js';
import { withBot } from '../connection.js';
import type { Formatter } from '../output.js';

export function runScheduleList(fmt: Formatter): void {
  const schedule = getScheduleConfig();

  if (fmt.json) {
    fmt.result(schedule);
    return;
  }

  fmt.table(schedule.map(j => ({
    id: j.id,
    name: j.name,
    cron: j.cron,
    channel: '#' + j.channel,
    enabled: j.enabled ? 'ON' : 'OFF',
  })));
}

export async function runScheduleTrigger(fmt: Formatter, jobId: string): Promise<void> {
  if (!jobId) {
    fmt.error('Usage: engagement-bot schedule trigger <id>');
    process.exit(1);
  }

  await withBot(async () => {
    fmt.info(`Triggering job: ${jobId}...`);
    await triggerJob(jobId);
    if (!fmt.json) fmt.info('Done.');
    fmt.result({ triggered: jobId });
  });
}

interface UpdateOpts {
  enabled?: string;
  cron?: string;
  channel?: string;
}

export function runScheduleUpdate(fmt: Formatter, jobId: string, opts: UpdateOpts): void {
  if (!jobId) {
    fmt.error('Usage: engagement-bot schedule update <id> [--enabled true|false] [--cron "..."] [--channel ...]');
    process.exit(1);
  }

  const updates: Partial<Pick<ScheduleJob, 'cron' | 'channel' | 'enabled'>> = {};
  if (opts.enabled !== undefined) {
    if (opts.enabled !== 'true' && opts.enabled !== 'false') {
      fmt.error('--enabled must be "true" or "false"');
      process.exit(1);
    }
    updates.enabled = opts.enabled === 'true';
  }
  if (opts.cron !== undefined) {
    if (!cron.validate(opts.cron)) {
      fmt.error(`Invalid cron expression: ${opts.cron}`);
      process.exit(1);
    }
    updates.cron = opts.cron;
  }
  if (opts.channel !== undefined) updates.channel = opts.channel;

  const result = updateJob(jobId, updates);
  if (!result) {
    fmt.error(`Unknown job: ${jobId}`);
    process.exit(1);
  }

  fmt.result({ updated: result });
}
