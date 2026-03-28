const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('mudidiElectron', {
  getApiKey: () => ipcRenderer.invoke('config:getApiKey'),
  setApiKey: (key) => ipcRenderer.invoke('config:setApiKey', key),
});
