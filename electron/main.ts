import { app, BrowserWindow, ipcMain } from 'electron';
import { menubar } from 'menubar';
import { resolve } from 'path';
import { setupTray } from './tray.js';
import { registerIpcHandlers } from './ipc-handlers.js';

let mb: ReturnType<typeof menubar> | null = null;
let commandCenter: BrowserWindow | null = null;

function createMenubar() {
  mb = menubar({
    index: `file://${resolve(__dirname, '../ui/dist/index.html')}`,
    icon: resolve(__dirname, '../assets/icon.png'),
    browserWindow: {
      width: 380,
      height: 520,
      resizable: false,
      webPreferences: {
        preload: resolve(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
      },
    },
    preloadWindow: true,
    showDockIcon: false,
  });

  mb.on('ready', () => {
    console.log('[electron] Menubar ready');
    setupTray(mb!.tray, () => openCommandCenter());
  });

  mb.on('after-create-window', () => {
    // Dev tools in development
    if (process.env.NODE_ENV === 'development') {
      mb!.window?.webContents.openDevTools({ mode: 'detach' });
    }
  });
}

export function openCommandCenter() {
  if (commandCenter && !commandCenter.isDestroyed()) {
    commandCenter.focus();
    return;
  }

  commandCenter = new BrowserWindow({
    width: 900,
    height: 650,
    title: 'Claude World Bot 指揮中心',
    webPreferences: {
      preload: resolve(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  commandCenter.loadFile(resolve(__dirname, '../ui/dist/index.html'), {
    hash: '/commander',
  });

  commandCenter.on('closed', () => {
    commandCenter = null;
  });
}

app.on('ready', () => {
  createMenubar();
  registerIpcHandlers();
});

app.on('window-all-closed', () => {
  // Don't quit on window close - stay in tray
});

app.on('before-quit', () => {
  mb?.app.quit();
});
