import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import cron from 'node-cron';
import { getSchedule, getScheduleConfig, startScheduler, stopScheduler, updateJob } from '../src/scheduler.js';

after(() => stopScheduler());

test('every default job has a valid cron expression', () => {
  for (const job of getScheduleConfig()) {
    assert.ok(cron.validate(job.cron), `${job.id}: ${job.cron}`);
  }
});

test('runs one task per enabled job and does not leak tasks on restart', () => {
  const enabled = getScheduleConfig().filter(j => j.enabled).length;
  startScheduler();
  assert.equal(getSchedule().filter(j => j.running).length, enabled);
  assert.equal(cron.getTasks().size, enabled);

  // updateJob restarts the live scheduler
  updateJob('dailyTip', { enabled: false });
  assert.equal(getSchedule().find(j => j.id === 'dailyTip')?.running, false);
  assert.equal(cron.getTasks().size, enabled - 1);

  stopScheduler();
  assert.equal(cron.getTasks().size, 0);
});

test('updateJob returns a copy and ignores unknown ids', () => {
  const updated = updateJob('discussion', { cron: '30 12 * * 1-5' });
  assert.ok(updated);
  updated.cron = 'mutated';
  assert.equal(getScheduleConfig().find(j => j.id === 'discussion')?.cron, '30 12 * * 1-5');
  assert.equal(updateJob('nope', { enabled: false }), null);
});
