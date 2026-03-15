/**
 * bot command <text> — natural language command → generate → post.
 * parseCommand needs env vars (CLAUDE_CLI_PATH) but not Discord WebSocket.
 * executeCommand needs Discord connection.
 */
import { getConfig } from '../../config.js';
import { parseCommand, executeCommand } from '../../commander.js';
import { withBot } from '../connection.js';
import { confirm } from '../prompt.js';
import type { Formatter } from '../output.js';

export async function runCommand(fmt: Formatter, text: string, preview: boolean, yes: boolean): Promise<void> {
  if (!text) {
    fmt.error('Usage: engagement-bot command <text> [--preview] [--yes]');
    process.exit(1);
  }

  // parseCommand only needs config (for CLAUDE_CLI_PATH), not Discord WebSocket
  getConfig();
  fmt.info(`Parsing command: ${text}`);
  const result = await parseCommand(text);

  if (preview) {
    fmt.result({
      intent: result.intent,
      channel: result.channel,
      content: result.content,
    });
    return;
  }

  if (!yes) {
    fmt.info(`\n--- Preview ---`);
    fmt.info(`Channel: #${result.channel}`);
    fmt.info(`Type: ${result.intent}`);
    fmt.info(`Content:\n${result.content}`);
    fmt.info(`--- End Preview ---\n`);

    const confirmed = await confirm('Send to Discord?');
    if (!confirmed) {
      fmt.info('Cancelled.');
      return;
    }
  }

  // Only connect to Discord for the actual send
  await withBot(async () => {
    await executeCommand(result);
  });

  if (fmt.json) {
    fmt.result({ intent: result.intent, channel: result.channel, sent: true });
  } else {
    fmt.info('Sent!');
  }
}
