import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ROOT = resolve(__dirname, '..');
const TSX = require.resolve('tsx/cli');

// Offline commands run in an empty workspace so a local data/ or .env cannot leak in.
// The .env still makes dotenv load something, which must not print anything.
const workspace = mkdtempSync(join(tmpdir(), 'engagement-bot-cli-'));
writeFileSync(join(workspace, '.env'), 'CLAUDE_CLI_PATH=claude\n');

function run(args: string[]) {
  const { status, stdout, stderr } = spawnSync(process.execPath, args, { cwd: workspace, encoding: 'utf8' });
  return { status, stdout, stderr };
}

const cli = (...args: string[]) => run([TSX, join(ROOT, 'src/cli.ts'), ...args]);

test('help lists the commands', () => {
  const { status, stdout } = cli('help');
  assert.equal(status, 0);
  assert.match(stdout, /Usage: engagement-bot <command>/);
});

test('--json prints a clean JSON envelope on stdout', () => {
  for (const args of [['channels'], ['schedule', 'list'], ['status']]) {
    const { status, stdout, stderr } = cli(...args, '--json');
    assert.equal(status, 0, stderr);
    assert.equal(JSON.parse(stdout).ok, true);
    assert.doesNotMatch(stderr, /injected env|dotenv/);
  }
});

test('status works offline before any post', () => {
  const { data } = JSON.parse(cli('status', '--json').stdout);
  assert.equal(data.todayCount, 0);
  assert.equal(data.lastPost, null);
  assert.equal(data.schedule.length, 6);
});

test('rejects unknown flags and invalid cron expressions', () => {
  const flag = cli('status', '--limite', '5');
  assert.equal(flag.status, 1);
  assert.match(flag.stderr, /Unknown flag: --limite/);

  const badCron = cli('schedule', 'update', 'dailyTip', '--cron', '99 99 * * *');
  assert.equal(badCron.status, 1);
  assert.match(badCron.stderr, /Invalid cron expression/);
});

test('bin/bot.js launches the CLI', () => {
  const { status, stdout } = run([join(ROOT, 'bin/bot.js'), 'help']);
  assert.equal(status, 0);
  assert.match(stdout, /Usage: engagement-bot/);
});
