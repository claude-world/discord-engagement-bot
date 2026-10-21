import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sendChunked } from '../src/poster.js';
import { parseCommandResult } from '../src/prompts/commander.js';
import { isTechQuestion } from '../src/knowledge-engine.js';
import { extractChangelogSection } from '../src/version-checker.js';

test('sendChunked keeps short posts in one message', () => {
  assert.deepEqual(sendChunked('hello'), ['hello']);
});

test('sendChunked splits long posts at line breaks within the 2000-char limit', () => {
  const text = Array.from({ length: 30 }, () => 'x'.repeat(150)).join('\n');
  const chunks = sendChunked(text);
  assert.ok(chunks.length > 1);
  for (const chunk of chunks) assert.ok(chunk.length <= 2000);
  assert.equal(chunks.join('\n'), text);
});

test('sendChunked hard-splits text without line breaks', () => {
  assert.deepEqual(sendChunked('y'.repeat(4500)).map(c => c.length), [2000, 2000, 500]);
});

test('parseCommandResult reads the JSON reply, even wrapped in prose', () => {
  const raw = 'Sure!\n{"intent":"tip","channel":"daily-tips","content":"**每日技巧**"}\nDone.';
  assert.deepEqual(parseCommandResult(raw), { intent: 'tip', channel: 'daily-tips', content: '**每日技巧**' });
});

test('parseCommandResult falls back to a custom #general post', () => {
  assert.deepEqual(parseCommandResult('just text'), { intent: 'custom', channel: 'general', content: 'just text' });
});

test('isTechQuestion needs both a question and a technical topic', () => {
  assert.equal(isTechQuestion('請問 Claude Code 的 hooks 要怎麼設定？'), true);
  assert.equal(isTechQuestion('How to configure an MCP server?'), true);
  assert.equal(isTechQuestion('今天天氣真好，大家午安'), false);
  assert.equal(isTechQuestion('我剛裝好 MCP server 了'), false);
});

test('extractChangelogSection returns exactly one version', () => {
  const changelog = ['# Changelog', '', '## 2.1.305', '', '- Added a', '- Fixed b', '', '## 2.1.30', '', '- Older'].join('\n');
  assert.equal(extractChangelogSection(changelog, '2.1.305'), '- Added a\n- Fixed b');
  assert.equal(extractChangelogSection(changelog, '2.1.30'), '- Older');
  assert.equal(extractChangelogSection(changelog, '9.9.9'), '');
});
