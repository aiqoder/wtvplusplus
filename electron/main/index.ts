
import { app, BrowserWindow, globalShortcut, shell, screen, nativeTheme, ipcMain } from 'electron'
import { join } from 'path'
import { setHeaders } from './headers'
import "./newDialog"
import "./ip"
import "./event"
import "./fileshare/openDir"
import menu from "./menu"
import os from 'os'
import { WebSocketServer } from "ws"
import { tryUsePort } from './utils/util'
import { store } from './utils/store'

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

  // 后台渲染
  win.webContents.setFrameRate(60)

  nativeTheme.themeSource = 'dark'

  if (app.isPackaged) {
    win.setMenu(menu)
    win.loadFile(join(__dirname, '../renderer/index.html'))
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

  })

  return win
}

app.whenReady().then(() => {
  createWindow()
  win?.show()
  setHeaders()
  // 创建一个websoket服务器
  tryUsePort(10000, (port) => {
    console.log("===========> port", port + "")
    store.set("wsport", port+ "")
    const wss = new WebSocketServer({
      port: port,
    })

    wss.on('connection', function connection(ws) {
      ws.on('error', console.error);

      ipcMain.on("main-exec-stram", (data) => {
        ws.send(data);
      })
    });
  })
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