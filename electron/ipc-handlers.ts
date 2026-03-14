import { ipcMain, app } from 'electron';
import { initBot, isConnected, destroyBot } from '../src/bot.js';
import { startScheduler, stopScheduler, getSchedule, updateJob, triggerJob } from '../src/scheduler.js';
import { parseCommand, executeCommand } from '../src/commander.js';
import { getRecords, getTodayCount, getLastRecord } from '../src/history.js';
import { getChannelNames } from '../src/config.js';

let botInitialized = false;

async function ensureBot() {
  if (!botInitialized) {
    await initBot();
    startScheduler();
    botInitialized = true;
  }
}

export function registerIpcHandlers(): void {
  // Initialize bot on first status request
  ipcMain.handle('bot:status', async () => {
    await ensureBot();
    const last = getLastRecord();
    return {
      connected: isConnected(),
      todayCount: getTodayCount(),
      lastPost: last ? { timestamp: last.timestamp, channel: last.channel, content: last.content } : undefined,
      schedule: getSchedule(),
    };
  });

  // Commander
  ipcMain.handle('commander:parse', async (_event, input: string) => {
    await ensureBot();
    return parseCommand(input);
  });

  ipcMain.handle('commander:execute', async (_event, cmd: { intent: string; channel: string; content: string }) => {
    await ensureBot();
    await executeCommand(cmd as any);
  });

  // Schedule
  ipcMain.handle('schedule:list', async () => {
    return getSchedule();
  });

  ipcMain.handle('schedule:update', async (_event, id: string, updates: any) => {
    updateJob(id, updates);
  });

  ipcMain.handle('schedule:trigger', async (_event, id: string) => {
    await ensureBot();
    await triggerJob(id);
  });

  // History
  ipcMain.handle('history:list', async (_event, opts?: any) => {
    return getRecords(opts);
  });

  // Config
  ipcMain.handle('config:channels', async () => {
    return getChannelNames();
  });

  // App control
  ipcMain.on('app:open-command-center', () => {
    const { openCommandCenter } = require('./main.js');
    openCommandCenter();
  });

  ipcMain.on('app:quit', async () => {
    stopScheduler();
    await destroyBot();
    app.quit();
  });

  // Scheduler pause/resume
  ipcMain.on('scheduler:pause', () => {
    stopScheduler();
    console.log('[ipc] Scheduler paused');
  });

  ipcMain.on('scheduler:resume', () => {
    startScheduler();
    console.log('[ipc] Scheduler resumed');
  });
}
