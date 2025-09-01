import { contextBridge, ipcRenderer } from 'electron';
contextBridge.exposeInMainWorld('krin', {
  run: (args, input) => ipcRenderer.invoke('krin:run', { args, input }),
  spawnChat: () => ipcRenderer.invoke('krin:spawnChat'),
  sendLine: (line) => ipcRenderer.send('krin:sendLine', line),
  stop: () => ipcRenderer.invoke('krin:stop'),
  onStdout: (cb) => { const f = (_e,d)=>cb(d); ipcRenderer.on('krin:stdout', f); return ()=>ipcRenderer.removeListener('krin:stdout', f); },
  onStderr: (cb) => { const f = (_e,d)=>cb(d); ipcRenderer.on('krin:stderr', f); return ()=>ipcRenderer.removeListener('krin:stderr', f); },
  onExit: (cb) => { const f = (_e,d)=>cb(d); ipcRenderer.on('krin:exit', f); return ()=>ipcRenderer.removeListener('krin:exit', f); },
});
