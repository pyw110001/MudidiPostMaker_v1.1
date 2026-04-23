const { app, BrowserWindow, ipcMain, Menu } = require('electron');
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

function preloadScriptPath() {
  if (app.isPackaged) {
    const unpacked = path.join(
      process.resourcesPath,
      'app.asar.unpacked',
      'electron',
      'preload.cjs'
    );
    if (fs.existsSync(unpacked)) {
      return unpacked;
    }
  }
  return path.join(__dirname, 'preload.cjs');
}

function clearApiKeyAndReload(win) {
  try {
    writeStoredApiKey('');
  } catch (e) {
    console.error(e);
  }
  if (win && !win.isDestroyed()) {
    win.reload();
  }
}

function setupApplicationMenu(win) {
  const isMac = process.platform === 'darwin';
  const apiKeyItem = {
    label: '重新输入 API Key…',
    click: () => clearApiKeyAndReload(win),
  };

  const template = isMac
    ? [
        {
          label: app.name,
          submenu: [
            { role: 'about' },
            { type: 'separator' },
            apiKeyItem,
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideOthers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' },
          ],
        },
      ]
    : [
        {
          label: '应用',
          submenu: [
            apiKeyItem,
            { type: 'separator' },
            {
              label: '退出',
              click: () => app.quit(),
            },
          ],
        },
      ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createMainWindow() {
  const preloadPath = preloadScriptPath();
  const win = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 900,
    minHeight: 640,
    show: false,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  win.once('ready-to-show', () => win.show());

  setupApplicationMenu(win);

  const indexHtml = path.join(__dirname, '..', 'dist', 'index.html');
  // 查询参数用于渲染进程可靠识别桌面壳（不依赖 UA / preload 是否偶发失败）
  win.loadFile(indexHtml, { query: { mudidi: 'desktop' } });
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
