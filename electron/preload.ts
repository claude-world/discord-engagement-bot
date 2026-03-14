import { contextBridge, ipcRenderer } from 'electron';

export interface BotAPI {
  // Bot control
  getStatus(): Promise<{
    connected: boolean;
    todayCount: number;
    lastPost?: { timestamp: string; channel: string; content: string };
    schedule: Array<{
      id: string;
      name: string;
      cron: string;
      channel: string;
      enabled: boolean;
      type: string;
    }>;
  }>;

  // Commander
  parseCommand(input: string): Promise<{
    intent: string;
    channel: string;
    content: string;
  }>;
  executeCommand(cmd: { intent: string; channel: string; content: string }): Promise<void>;

  // Scheduler
  getSchedule(): Promise<Array<{
    id: string;
    name: string;
    cron: string;
    channel: string;
    enabled: boolean;
    type: string;
  }>>;
  updateJob(id: string, updates: { cron?: string; channel?: string; enabled?: boolean }): Promise<void>;
  triggerJob(id: string): Promise<void>;

  // History
  getHistory(opts?: { limit?: number; type?: string; channel?: string }): Promise<Array<{
    id: string;
    timestamp: string;
    channel: string;
    content: string;
    type: string;
    source: string;
    messageId?: string;
  }>>;

  // Settings
  getChannels(): Promise<string[]>;

  // App control
  openCommandCenter(): void;
  quit(): void;

  // Events
  onStatusUpdate(callback: (status: string) => void): () => void;
}

const api: BotAPI = {
  getStatus: () => ipcRenderer.invoke('bot:status'),
  parseCommand: (input) => ipcRenderer.invoke('commander:parse', input),
  executeCommand: (cmd) => ipcRenderer.invoke('commander:execute', cmd),
  getSchedule: () => ipcRenderer.invoke('schedule:list'),
  updateJob: (id, updates) => ipcRenderer.invoke('schedule:update', id, updates),
  triggerJob: (id) => ipcRenderer.invoke('schedule:trigger', id),
  getHistory: (opts) => ipcRenderer.invoke('history:list', opts),
  getChannels: () => ipcRenderer.invoke('config:channels'),
  openCommandCenter: () => ipcRenderer.send('app:open-command-center'),
  quit: () => ipcRenderer.send('app:quit'),

  onStatusUpdate: (callback) => {
    const handler = (_event: Electron.IpcRendererEvent, status: string) => callback(status);
    ipcRenderer.on('bot:status-update', handler);
    return () => ipcRenderer.removeListener('bot:status-update', handler);
  },
};

contextBridge.exposeInMainWorld('botAPI', api);
