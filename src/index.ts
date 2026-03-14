/**
 * CLI entry point - run the bot without Electron.
 * Usage: npx tsx src/index.ts [--trigger <jobId>] [--command "text"]
 */
import { getConfig } from './config.js';
import { initBot, destroyBot, isConnected } from './bot.js';
import { startScheduler, stopScheduler, getSchedule, triggerJob } from './scheduler.js';
import { parseCommand, executeCommand } from './commander.js';
import { getTodayCount, getLastRecord } from './history.js';
import { startApiServer } from './api-server.js';
import * as readline from 'readline';

async function main() {
  const args = process.argv.slice(2);

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

  // One-shot: trigger a specific job
  const triggerIdx = args.indexOf('--trigger');
  if (triggerIdx !== -1) {
    const jobId = args[triggerIdx + 1];
    if (!jobId) {
      console.error('Usage: --trigger <jobId>');
      process.exit(1);
    }
    console.log(`[main] Triggering job: ${jobId}`);
    await triggerJob(jobId);
    console.log('[main] Done');
    await destroyBot();
    process.exit(0);
  }

  // One-shot: execute a natural language command
  const cmdIdx = args.indexOf('--command');
  if (cmdIdx !== -1) {
    const text = args[cmdIdx + 1];
    if (!text) {
      console.error('Usage: --command "text"');
      process.exit(1);
    }
    console.log(`[main] Parsing command: ${text}`);
    const result = await parseCommand(text);
    console.log(`\n--- Preview ---`);
    console.log(`Channel: #${result.channel}`);
    console.log(`Type: ${result.intent}`);
    console.log(`Content:\n${result.content}`);
    console.log(`--- End Preview ---\n`);

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await new Promise<string>(resolve => {
      rl.question('Send to Discord? (y/N) ', resolve);
    });
    rl.close();

    if (answer.toLowerCase() === 'y') {
      await executeCommand(result);
      console.log('[main] Sent!');
    } else {
      console.log('[main] Cancelled');
    }

    await destroyBot();
    process.exit(0);
  }

  // Default: start scheduler + API server + interactive mode
  startScheduler();
  startApiServer();

  const schedule = getSchedule();
  console.log('\n=== Schedule ===');
  for (const job of schedule) {
    console.log(`  ${job.enabled ? '✅' : '⏸ '} ${job.name} (${job.cron}) → #${job.channel}`);
  }
  console.log('================\n');

  console.log(`Today's posts: ${getTodayCount()}`);
  const last = getLastRecord();
  if (last) {
    console.log(`Last post: ${last.timestamp} → #${last.channel}`);
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
        const schedule = getSchedule();
        for (const job of schedule) {
          console.log(`  ${job.enabled ? '✅' : '⏸ '} ${job.name} → #${job.channel}`);
        }
      } else if (input.startsWith('trigger ')) {
        const jobId = input.slice(8).trim();
        await triggerJob(jobId);
        console.log('Done');
      } else if (input.startsWith('send ')) {
        const text = input.slice(5).trim();
        const result = await parseCommand(text);
        console.log(`\n--- Preview (→ #${result.channel}) ---`);
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
    process.on(sig, async () => {
      console.log(`\n[main] Received ${sig}, shutting down...`);
      stopScheduler();
      await destroyBot();
      process.exit(0);
    });
  }
}

main().catch((err) => {
  console.error('[main] Fatal:', err);
  process.exit(1);
});
