const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function keyFilePath() {
  return path.join(app.getPath('userData'), 'gemini-api-key.json');
}

function readStoredApiKey() {
  try {
    const p = keyFilePath();
    if (!fs.existsSync(p)) return '';
    const raw = fs.readFileSync(p, 'utf8');
    const data = JSON.parse(raw);
    return String(data.apiKey || '').trim();
  } catch {
    return '';
  }
}

function writeStoredApiKey(key) {
  const trimmed = String(key || '').trim();
  fs.writeFileSync(keyFilePath(), JSON.stringify({ apiKey: trimmed }, null, 0), 'utf8');
}

function createMainWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 900,
    minHeight: 640,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.once('ready-to-show', () => win.show());

  const indexHtml = path.join(__dirname, '..', 'dist', 'index.html');
  win.loadFile(indexHtml);
}

app.whenReady().then(() => {
  ipcMain.handle('config:getApiKey', () => readStoredApiKey());
  ipcMain.handle('config:setApiKey', (_event, key) => {
    writeStoredApiKey(key);
    return true;
  });

  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
