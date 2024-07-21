import { ipcMain, screen } from "electron"
import { EXEUTE_IS_RUNNING_PROCESS, EXEUTE_PROCESS, SET_STORE_EVENT, KILL_EXEUTE_PROCESS, GET_STORE_EVENT, USER_HOME_PATH_EVENT, GET_PRINTER_LIST_EVENT, GET_CURSOR_SCREEN_POINT } from "./const";
import { closePorcess, execPorcess, processIsRunning } from './utils/exec';
import { deleteFilesInFolder, getDocumentPath } from "./utils/util";
import { store } from "./utils/store";
import { win } from ".";

// 处理可执行程序文件
ipcMain.handle(EXEUTE_PROCESS, (event, args) => {
    return execPorcess(args)
})

ipcMain.handle(EXEUTE_IS_RUNNING_PROCESS, (event, args) => {
    return processIsRunning(args)
})

// 杀掉可执行程序对象实例（防止死锁）。 这被视为终端命令的输出。
ipcMain.handle(KILL_EXEUTE_PROCESS, (event, args) => {
    return closePorcess(args)
})

// 获取文件夹目录 clear // 是否清空文件夹
ipcMain.handle(USER_HOME_PATH_EVENT, (event, path, clear = false) => {
    const _path = getDocumentPath(path)

    if (clear) {
        deleteFilesInFolder(_path)
    }
    return _path
})

// 存储store
ipcMain.handle(SET_STORE_EVENT, (event, key, value) => {
    return store.set(key, value)
})

ipcMain.handle(GET_STORE_EVENT, (event, key) => {
    return store.get(key)
})

ipcMain.handle(GET_PRINTER_LIST_EVENT, async (event, key) => {
    return await win?.webContents.getPrintersAsync()
})


ipcMain.handle(GET_CURSOR_SCREEN_POINT, (event, key) => {
    return screen.getCursorScreenPoint()
})