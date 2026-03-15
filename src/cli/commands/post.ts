/**
 * bot post <channel> <text> — post to a Discord channel.
 * Connected: requires Discord WebSocket.
 */
import { postToChannel } from '../../poster.js';
import { withBot } from '../connection.js';
import { confirm } from '../prompt.js';
import type { Formatter } from '../output.js';

export async function runPost(fmt: Formatter, channel: string, text: string, yes: boolean): Promise<void> {
  if (!channel || !text) {
    fmt.error('Usage: engagement-bot post <channel> <text> [--yes]');
    process.exit(1);
  }

  if (!yes) {
    fmt.info(`Channel: #${channel}`);
    fmt.info(`Content: ${text.slice(0, 200)}${text.length > 200 ? '...' : ''}`);
    const confirmed = await confirm('Send to Discord?');
    if (!confirmed) {
      fmt.info('Cancelled.');
      return;
    }
  }

  await withBot(async () => {
    const result = await postToChannel(channel, text, { source: 'manual' });
    fmt.result({
      messageId: result.messageId,
      channel: result.channel,
      contentLength: result.contentLength,
      chunks: result.chunks,
    });
  });
}
