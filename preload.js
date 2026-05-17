const {
    contextBridge,
    ipcRenderer
} = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    openExternal: (url) => ipcRenderer.invoke('open-external', url),
    closeApp: () => ipcRenderer.invoke('close-app'),
    getVersion: () => ipcRenderer.invoke('get-version')
});

contextBridge.exposeInMainWorld('__stardesk', {
    setDiscordPresence: (presence) => ipcRenderer.send('discord-presence', presence)
});