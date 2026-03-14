import { Menu, Tray } from 'electron';

export function setupTray(tray: Tray, openCommandCenter: () => void): void {
  tray.setToolTip('Claude World Bot');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '開啟指揮中心',
      click: openCommandCenter,
    },
    { type: 'separator' },
    {
      label: '暫停排程',
      type: 'checkbox',
      checked: false,
      click: (menuItem) => {
        // Toggle scheduler via IPC
        const { ipcMain } = require('electron');
        if (menuItem.checked) {
          ipcMain.emit('scheduler:pause');
        } else {
          ipcMain.emit('scheduler:resume');
        }
      },
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        const { app } = require('electron');
        app.quit();
      },
    },
  ]);

  tray.on('right-click', () => {
    tray.popUpContextMenu(contextMenu);
  });
}
