/**
 * bot serve — start bot + scheduler + API + REPL.
 * This is the refactored main() from the original index.ts.
 */
import { getConfig } from '../../config.js';
import { initBot, destroyBot, isConnected } from '../../bot.js';
import { startScheduler, stopScheduler, getSchedule, triggerJob } from '../../scheduler.js';
import { parseCommand, executeCommand } from '../../commander.js';
import { getTodayCount, getLastRecord } from '../../history.js';
import { startApiServer } from '../../api-server.js';
import * as readline from 'readline';

export async function startServer(): Promise<void> {
  // Validate config first
  try {
    getConfig();
  } catch (err) {
    console.error((err as Error).message);
    console.error('\nCopy .env.example to .env and fill in your values.');
    process.exit(1);
  }

  console.log('[main] Starting Discord Engagement Bot...');
  await initBot();
  console.log('[main] Bot connected');

  // Start scheduler + API server
  startScheduler();
  startApiServer();

  const schedule = getSchedule();
  console.log('\n=== Schedule ===');
  for (const job of schedule) {
    const icon = job.enabled ? (job.running ? '\u2705' : '\u23f8 ') : '\u274c';
    console.log(`  ${icon} ${job.name} (${job.cron}) \u2192 #${job.channel}`);
  }
  console.log('================\n');

  console.log(`Today's posts: ${getTodayCount()}`);
  const last = getLastRecord();
  if (last) {
    console.log(`Last post: ${last.timestamp} \u2192 #${last.channel}`);
  }

  console.log('\nInteractive mode. Commands:');
  console.log('  trigger <jobId>  - Run a scheduled job now');
  console.log('  send <text>      - Parse & send a command');
  console.log('  status           - Show bot status');
  console.log('  quit             - Exit\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();
    if (!input) { rl.prompt(); return; }

    try {
      if (input === 'quit' || input === 'exit') {
        console.log('[main] Shutting down...');
        stopScheduler();
        await destroyBot();
        process.exit(0);
      }

      if (input === 'status') {
        console.log(`  Connected: ${isConnected()}`);
        console.log(`  Today's posts: ${getTodayCount()}`);
        const sched = getSchedule();
        for (const job of sched) {
          console.log(`  ${job.enabled ? '\u2705' : '\u23f8 '} ${job.name} \u2192 #${job.channel}`);
        }
      } else if (input.startsWith('trigger ')) {
        const jobId = input.slice(8).trim();
        await triggerJob(jobId);
        console.log('Done');
      } else if (input.startsWith('send ')) {
        const text = input.slice(5).trim();
        const result = await parseCommand(text);
        console.log(`\n--- Preview (\u2192 #${result.channel}) ---`);
        console.log(result.content);
        console.log('--- End ---');

        const answer = await new Promise<string>(resolve => {
          rl.question('Send? (y/N) ', resolve);
        });
        if (answer.toLowerCase() === 'y') {
          await executeCommand(result);
          console.log('Sent!');
        }
      } else {
        console.log('Unknown command. Try: trigger, send, status, quit');
      }
    } catch (err) {
      console.error('Error:', (err as Error).message);
    }

    rl.prompt();
  });

  // Graceful shutdown
  for (const sig of ['SIGINT', 'SIGTERM'] as const) {
    process.once(sig, async () => {
      console.log(`\n[main] Received ${sig}, shutting down...`);
      stopScheduler();
      await destroyBot();
      process.exit(0);
    });
  }
}
