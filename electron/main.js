const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 640,
    minHeight: 480,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      // Allow File System Access API (showOpenFilePicker etc.)
      experimentalFeatures: true,
    },
    title: 'MD Editor',
    // Use icon if available (add public/icon.ico for a custom icon on Windows)
    ...(process.platform === 'win32' && require('fs').existsSync(path.join(__dirname, '../public/icon.ico'))
      ? { icon: path.join(__dirname, '../public/icon.ico') }
      : {}),
  });

  win.loadFile(path.join(__dirname, '../dist/index.html'));

  // Open clicked hyperlinks in the system browser, not inside the app
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
