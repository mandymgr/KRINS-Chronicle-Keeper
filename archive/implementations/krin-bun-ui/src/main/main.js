import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { spawnKrin, runKrinOnce } from './krinProcess.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

let win = null;
let chatProc = null;

function createWindow(){
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });
  win.loadFile(join(process.cwd(), 'src', 'renderer', 'index.html'));
}

app.whenReady().then(()=>{
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

ipcMain.handle('krin:run', async (_evt, { args, input }) => {
  return await runKrinOnce(args || [], input);
});

ipcMain.handle('krin:spawnChat', async () => {
  if (chatProc) { try { chatProc.kill(); } catch {} chatProc = null; }
  chatProc = spawnKrin([]);
  chatProc.events.on('stdout', (chunk) => win?.webContents.send('krin:stdout', chunk));
  chatProc.events.on('stderr', (chunk) => win?.webContents.send('krin:stderr', chunk));
  chatProc.events.on('exit', (code) => win?.webContents.send('krin:exit', code));
  return { pid: chatProc.pid };
});

ipcMain.on('krin:sendLine', (_evt, line) => { if (chatProc) chatProc.write(line); });
ipcMain.handle('krin:stop', async () => { if (chatProc) { try { chatProc.kill(); } catch {} chatProc = null; } return true; });
