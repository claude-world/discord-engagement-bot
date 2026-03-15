/**
 * CLI entry point — parses argv and dispatches to command handlers.
 * Usage: tsx src/cli.ts <command> [options]
 */
import { parseArgs } from 'node:util';
import { createFormatter, jsonError } from './cli/output.js';
import { runHelp } from './cli/commands/help.js';

function parseLimit(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const n = parseInt(raw, 10);
  if (isNaN(n) || n < 1) {
    console.error('--limit must be a positive number');
    process.exit(1);
  }
  return n;
}

async function main() {
  // Extract subcommand(s) and flags from argv
  const argv = process.argv.slice(2);

  // Parse global flags first (allow unknown for subcommand-specific flags)
  const { values: globalFlags, positionals } = parseArgs({
    args: argv,
    options: {
      json: { type: 'boolean', default: false },
      help: { type: 'boolean', default: false },
      limit: { type: 'string' },
      type: { type: 'string' },
      yes: { type: 'boolean', default: false },
      preview: { type: 'boolean', default: false },
      enabled: { type: 'string' },
      cron: { type: 'string' },
      channel: { type: 'string' },
      tag: { type: 'string', multiple: true },
      title: { type: 'string' },
      body: { type: 'string' },
    },
    allowPositionals: true,
    strict: false,
  });

  // --help at any position shows help
  if (globalFlags.help) {
    runHelp();
    return;
  }

  // Detect unknown flags (strict:false lets them through silently)
  const KNOWN_FLAGS = new Set(['json', 'help', 'limit', 'type', 'yes', 'preview', 'enabled', 'cron', 'channel', 'tag', 'title', 'body']);
  for (const key of Object.keys(globalFlags)) {
    if (!KNOWN_FLAGS.has(key)) {
      console.error(`Unknown flag: --${key}`);
      console.error('Run "engagement-bot help" to see available options.');
      process.exit(1);
    }
  }

  const jsonMode = globalFlags.json === true;
  const fmt = createFormatter(jsonMode);

  const command = positionals[0] ?? 'serve';

  try {
    switch (command) {
      case 'help': {
        runHelp();
        break;
      }

      case 'serve': {
        const { startServer } = await import('./cli/commands/serve.js');
        await startServer();
        break;
      }

      case 'status': {
        const { runStatus } = await import('./cli/commands/status.js');
        runStatus(fmt);
        break;
      }

      case 'history': {
        const { runHistory } = await import('./cli/commands/history.js');
        runHistory(fmt, {
          limit: parseLimit(globalFlags.limit as string | undefined),
          type: globalFlags.type as string | undefined,
        });
        break;
      }

      case 'schedule': {
        const sub = positionals[1];
        const { runScheduleList, runScheduleTrigger, runScheduleUpdate } = await import('./cli/commands/schedule.js');

        if (!sub || sub === 'list') {
          runScheduleList(fmt);
        } else if (sub === 'trigger') {
          await runScheduleTrigger(fmt, positionals[2] ?? '');
        } else if (sub === 'update') {
          runScheduleUpdate(fmt, positionals[2] ?? '', {
            enabled: globalFlags.enabled as string | undefined,
            cron: globalFlags.cron as string | undefined,
            channel: globalFlags.channel as string | undefined,
          });
        } else {
          fmt.error(`Unknown schedule command: ${sub}`);
          fmt.error('Available: list, trigger <id>, update <id>');
          process.exit(1);
        }
        break;
      }

      case 'post': {
        const { runPost } = await import('./cli/commands/post.js');
        const channel = positionals[1] ?? '';
        const text = positionals.slice(2).join(' ');
        await runPost(fmt, channel, text, globalFlags.yes === true);
        break;
      }

      case 'command': {
        const { runCommand } = await import('./cli/commands/command.js');
        const text = positionals.slice(1).join(' ');
        await runCommand(fmt, text, globalFlags.preview === true, globalFlags.yes === true);
        break;
      }

      case 'chat': {
        const sub = positionals[1] ?? 'recent';
        const { runChatRecent, runChatTopics, runChatUsers } = await import('./cli/commands/chat.js');
        const limit = parseLimit(globalFlags.limit as string | undefined);

        if (sub === 'recent') {
          runChatRecent(fmt, limit ?? 50);
        } else if (sub === 'topics') {
          runChatTopics(fmt);
        } else if (sub === 'users') {
          runChatUsers(fmt, limit ?? 20);
        } else {
          fmt.error(`Unknown chat command: ${sub}`);
          fmt.error('Available: recent, topics, users');
          process.exit(1);
        }
        break;
      }

      case 'pins': {
        const { runPins } = await import('./cli/commands/pins.js');
        runPins(fmt);
        break;
      }

      case 'forum': {
        const sub = positionals[1];
        const { runForumPost, runForumTags } = await import('./cli/commands/forum.js');

        if (sub === 'tags') {
          await runForumTags(fmt, positionals[2] ?? '');
        } else {
          // forum <channel> --title "..." --body "..."  OR  forum <channel> <title> <body>
          const channel = sub ?? '';
          const title = (globalFlags.title as string) ?? positionals[2] ?? '';
          const body = (globalFlags.body as string) ?? positionals.slice(3).join(' ');
          const tags = (globalFlags.tag as string[] | undefined) ?? [];
          await runForumPost(fmt, channel, title, body, tags, globalFlags.yes === true);
        }
        break;
      }

      case 'channels': {
        const { runChannels } = await import('./cli/commands/channels.js');
        runChannels(fmt);
        break;
      }

      default: {
        if (jsonMode) {
          jsonError(`Unknown command: ${command}`, 'UNKNOWN_COMMAND');
        } else {
          fmt.error(`Unknown command: ${command}`);
          fmt.error('Run "engagement-bot help" to see available commands.');
        }
        process.exit(1);
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (jsonMode) {
      jsonError(message, 'ERROR');
    } else {
      fmt.error(`Error: ${message}`);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[cli] Fatal:', err);
  process.exit(1);
});
