
import { app, BrowserWindow, globalShortcut, shell, screen, nativeTheme } from 'electron'
import { join, dirname } from 'path'
import { setHeaders } from './headers'
import "./newWindow"
import "./newDialog"
import "./ip"
import "./event"
import "./fileshare/openDir"
import menu from "./menu"
import { startedApps } from './newWindow';
import os from 'os'

// 禁用http 缓存
app.commandLine.appendSwitch("--disable-http-cache");

// 禁用硬件加速
app.disableHardwareAcceleration()
// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

export let win: BrowserWindow | null = null

async function createWindow() {
  win = new BrowserWindow({
    title: '一个橙子pro工具箱',
    show: false,
    width: 1240,
    height: 700,
    minWidth: 375,
    minHeight: 650,
    maxWidth: 1920,
    maxHeight: screen.getPrimaryDisplay().size.height,
    // x: screen.getPrimaryDisplay().size.width - 385,
    // y: (screen.getPrimaryDisplay().size.height - 650) / 2,
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      nodeIntegration: true,
      contextIsolation: true,
      webSecurity: false,
    },
    // backgroundColor: "#18181c",
    titleBarStyle: 'default',
    darkTheme: true,
    backgroundColor: '#18181c',
    // maximizable: false,
  })

  nativeTheme.themeSource = 'dark'

  if (app.isPackaged) {
    win.setMenu(menu)
    win.loadFile(join(__dirname, '../rendererMain/index.html'))

  } else {
    win.loadURL("http://127.0.0.1:3344")
  }


  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })

  // 主窗口关闭，关闭所有子窗口
  win.once("close", () => {
    for (const [key, win] of Object.entries(startedApps)) {
      win.destroy()
    }
  })

  return win
}

app.whenReady().then(()=>{
  createWindow()
  win?.show()
  setHeaders()
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
})

app.on('window-all-closed', () => {
  win = null
  app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})