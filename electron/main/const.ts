import { join, dirname } from 'path';
// 执行exec 文件夹当中的程序
export const EXEUTE_PROCESS = "EXEUTE_PROCESS"
export const EXEUTE_PROCESS_STREAM = "EXEUTE_PROCESS_STREAM"
export const KILL_EXEUTE_PROCESS = "KILL_EXEUTE_PROCESS"
export const EXEUTE_IS_RUNNING_PROCESS = "EXEUTE_IS_RUNNING_PROCESS"

// 生成M3U8 缓存文件进程
export const STATIC_M3U8_DIR_EVENT = "STATIC_M3U8_DIR_EVENT"

// 获取用户电脑目录
export const USER_HOME_PATH_EVENT = "USER_HOME_PATH"

// 执行 文件路径
export const BASE_EXEC_PATH = join(__dirname, "../exec")

// 全局Store
export const SET_STORE_EVENT = "SET_STORE"
export const GET_STORE_EVENT = "GET_STORE"

// 打印机相关
export const GET_PRINTER_LIST_EVENT = "GET_PRINTER_LIST_EVENT" // 获取打印机列表

// 屏幕相关
export const GET_CURSOR_SCREEN_POINT = "GET_CURSOR_SCREEN_POINT" 