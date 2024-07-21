import { app, ipcMain, shell, BrowserWindowConstructorOptions, BrowserWindow } from 'electron';
import path from "path"

export interface MyBrowserWindow extends BrowserWindowConstructorOptions {
  devPath?: string; // 路由跳转路径
  prodPath?: string;
  appName: string;
}

export const startedApps: Record<string, BrowserWindow> = {}

export function createWindow(config: MyBrowserWindow) {
  if (startedApps[config.appName]) {
    startedApps[config.appName]?.show()
    return
  }

  let win = new BrowserWindow({
  
    // title: 'Main window',
    // show: false,
    width: config?.width ?? 1240,
    height: config?.height ?? 700,
    minWidth: config?.width ?? 1240,
    minHeight: config?.height ?? 700,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.cjs'),
      nodeIntegration: true,
      contextIsolation: true,
      webSecurity: false,
    },
  })

  startedApps[config.appName] = win

  setTimeout(()=>{
    win?.show()
  }, 100)

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, `../${config?.prodPath}/index.html`))
    win.setMenu(null)
  } else {
    win.loadURL(config?.devPath as string)
  }

  // 设置所以的应用链接在浏览器打开
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })

  win.on("close", (event) => {
    event.preventDefault();//阻止默认关闭事件
    win.hide(); //隐藏窗口
    win.destroy();
    (win as any) = null
    delete startedApps[config.appName]
  });

  return win
}

ipcMain.on("create-window", (mode: any, arg) => {
  createWindow(arg)
})

ipcMain.on("remove-window", (mode: any, appName) => {
  startedApps[appName].destroy();
})