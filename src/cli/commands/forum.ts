/**
 * engagement-bot forum — create posts in Discord Forum channels.
 * Connected: requires Discord WebSocket.
 */
import { postToForum, getForumTags } from '../../poster.js';
import { withBot } from '../connection.js';
import { confirm } from '../prompt.js';
import type { Formatter } from '../output.js';

export async function runForumPost(
  fmt: Formatter,
  channel: string,
  title: string,
  body: string,
  tags: string[],
  yes: boolean,
): Promise<void> {
  if (!channel || !title || !body) {
    fmt.error('Usage: engagement-bot forum <channel> <title> <body> [--tag X] [--yes]');
    process.exit(1);
  }

  if (!yes) {
    fmt.info(`Forum: #${channel}`);
    fmt.info(`Title: ${title}`);
    fmt.info(`Tags: ${tags.length ? tags.join(', ') : '(none)'}`);
    fmt.info(`Body: ${body.slice(0, 200)}${body.length > 200 ? '...' : ''}`);
    const confirmed = await confirm('Create forum post?');
    if (!confirmed) {
      fmt.info('Cancelled.');
      return;
    }
  }

  await withBot(async () => {
    const result = await postToForum(channel, title, body, { tags });
    fmt.result({
      threadId: result.threadId,
      channel: result.channel,
      threadName: result.threadName,
    });
  });
}

export async function runForumTags(fmt: Formatter, channel: string): Promise<void> {
  if (!channel) {
    fmt.error('Usage: engagement-bot forum tags <channel>');
    process.exit(1);
  }

  await withBot(async () => {
    const tags = await getForumTags(channel);
    if (fmt.json) {
      fmt.result(tags);
    } else {
      if (tags.length === 0) {
        fmt.info('No tags available.');
        return;
      }
      fmt.table(tags.map(t => ({ id: t.id, name: t.name })));
    }
  });
}
