import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigSchema } from '../src/config.js';

const REQUIRED = {
  DISCORD_BOT_TOKEN: 'token',
  DISCORD_GUILD_ID: 'guild',
  CHANNEL_DAILY_TIPS: '1',
  CHANNEL_GENERAL: '2',
  CHANNEL_ANNOUNCEMENTS: '3',
};

test('applies defaults for optional settings', () => {
  const config = ConfigSchema.parse(REQUIRED);
  assert.equal(config.CLAUDE_CLI_PATH, 'claude');
  assert.equal(config.CONTENT_TIMEOUT, 60_000);
  assert.equal(config.CHANNEL_NEWS, '');
});

test('names missing and empty required variables', () => {
  const result = ConfigSchema.safeParse({ ...REQUIRED, DISCORD_BOT_TOKEN: undefined, DISCORD_GUILD_ID: '' });
  assert.ok(!result.success);
  assert.deepEqual(
    result.error.issues.map(i => i.message).sort(),
    ['DISCORD_BOT_TOKEN is required', 'DISCORD_GUILD_ID is required'],
  );
});

test('parses CONTENT_TIMEOUT as a bounded integer', () => {
  assert.equal(ConfigSchema.parse({ ...REQUIRED, CONTENT_TIMEOUT: '120000' }).CONTENT_TIMEOUT, 120_000);
  assert.equal(ConfigSchema.safeParse({ ...REQUIRED, CONTENT_TIMEOUT: '100' }).success, false);
  assert.equal(ConfigSchema.safeParse({ ...REQUIRED, CONTENT_TIMEOUT: 'soon' }).success, false);
});
