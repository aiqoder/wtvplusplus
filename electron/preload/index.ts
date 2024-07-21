import { clipboard, contextBridge, ipcRenderer, screen } from "electron";
import { shell } from "electron"
import { getPcInfo } from "./utils";
import { getVideoInfo, getVersion, killPid, killAll, playVideo, killVideo } from './ffmpeg';
import { MyBrowserWindow } from "../main/newWindow";
// import { createFileServer } from './fileServer';
import { getIp } from "./ip";
import { EXEUTE_IS_RUNNING_PROCESS, EXEUTE_PROCESS, GET_CURSOR_SCREEN_POINT, GET_PRINTER_LIST_EVENT, GET_STORE_EVENT, KILL_EXEUTE_PROCESS, SET_STORE_EVENT, USER_HOME_PATH_EVENT } from "../main/const"

contextBridge.exposeInMainWorld("eApi", {
    ipcRenderer: ipcRenderer,
    setTitle: (title: string) => ipcRenderer.send("set-title", title),
    // 读取剪贴板
    getClipboardText: () => clipboard.readText("clipboard"),
    writeClipboardText: (text: string) => clipboard.writeText(text),
    createWindow: (config: MyBrowserWindow) => ipcRenderer.send("create-window", config),
    removeWindow: (appName: string) => ipcRenderer.send("remove-window", appName),
    readFileDialogAsText: (appName: string, extensions?: string[]) => ipcRenderer.invoke("chengzi-load-dialog-file", appName, extensions),
    readFileAsText: (path: string) => ipcRenderer.invoke("chengzi-load-file", path),
    writeFileAsText: (path: string, data: any) => ipcRenderer.invoke("chengzi-write-file", path, data),
    upgrade: () => ipcRenderer.send("upgrade"),
    localIp: getIp(),
    openUrl: shell.openExternal,
    getPrintersAsync: () => ipcRenderer.invoke(GET_PRINTER_LIST_EVENT),
    getCursorScreenPoint: () => ipcRenderer.invoke(GET_CURSOR_SCREEN_POINT),
});


// 版本控制
contextBridge.exposeInMainWorld("version", {
    // 版本更新通知
    onVersionUpdate: (callback: (type: "update-available" | "download-progress" | "update-downloaded" | "update-not-available", message: any) => void) => {
        ipcRenderer.on("message", (event, arg) => {
            callback(arg.cmd, arg.message)
        });
    },
    // 下载最新版本
    downLoadLastVersion() {
        ipcRenderer.send("downloadUpdate")
    },
    // 检查最新版本
    checkForUpdate() {
        ipcRenderer.send("checkForUpdate")
    }
})


// 标题栏控制
contextBridge.exposeInMainWorld("titleBar", {
    winControl(control: "win-close" | "win-min" | "win-max" | "win-unmax") {
        ipcRenderer.send(control)
    }
})

contextBridge.exposeInMainWorld("eUtils", {
    getPcInfo,
    // 创建文件服务器
    // createFileServer,
    closePorcess: (args) => ipcRenderer.invoke(KILL_EXEUTE_PROCESS, args),
    execPorcess: (args) => ipcRenderer.invoke(EXEUTE_PROCESS, args),
    processIsRunning: (args) => ipcRenderer.invoke(EXEUTE_IS_RUNNING_PROCESS, args),
    getPath: (args: string, clear = false) => ipcRenderer.invoke(USER_HOME_PATH_EVENT, args, clear) as unknown as string,
    // 存储
    getStore: (key: string) => ipcRenderer.invoke(GET_STORE_EVENT, key) as unknown as any,
    setStore: (key: string, value: any) => ipcRenderer.invoke(SET_STORE_EVENT, key, value),
})

contextBridge.exposeInMainWorld("ffmpeg", {
    getVideoInfo,
    getVersion,
    killAll,
    killPid,
    killVideo,
    playVideo,
})

contextBridge.exposeInMainWorld("fileshare", {
    openDirectory: () => ipcRenderer.invoke("chengzi-wtv-read-directory"),
})