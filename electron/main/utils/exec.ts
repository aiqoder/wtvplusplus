import { spawn, exec } from "child_process";
import { join } from 'path';
import { app, ipcMain } from "electron"
import { EXEUTE_PROCESS_STREAM } from "../const";
import { win } from "..";

// 生产环境需要替换掉app.asar目录
const appPath = app.getAppPath().replace("app.asar", "")

export interface ExecOpts {
    root?: string;
    customRoot?: string;
    args: string;
    timeout: number;
    name?: string;
}

const processObj = {}

// 执行脚本
export function execPorcess(exec: ExecOpts) {
    const mac = process.platform === 'darwin'
    const { root = "", args, timeout, name } = exec
    console.log("exec args :", args)
    let resultData = ""
    const execAgrs = args.replaceAll('  ', ' ').split(" ")

    const _root = exec.customRoot || join(`${appPath}/dist`, "/exec", mac ? `${root}Mac` : root)

    const res = spawn(_root, [...execAgrs], { timeout, detached: false, shell: mac })


    if (name) processObj[name] = res
    return new Promise((resolve, reject) => {
        res.stderr.on('data', (data) => {
            resultData += data.toString()
        });

        res.stdout.on('data', (data) => {
            resultData += data.toString()
            win.webContents.send(EXEUTE_PROCESS_STREAM, data)
            ipcMain.emit("main-exec-stram", data)
        });

        res.stdout.on('close', () => {
            if (name) delete processObj[name]
            resolve({
                data: resultData,
                type: "end"
            })
        });
    })
}

// 关闭一个进程
export function closePorcess(name: string) {
    if (processObj[name]) {
        processObj[name].kill() // kill -9 pid 或 kill pid 或者 ps aux | grep [process name 也可以使用命令行
    }
    delete processObj[name]
}

// 判断某个进程是否正在运行
export const processIsRunning = (query) => {
    let platform = process.platform;
    let cmd = '';
    switch (platform) {
        case 'win32': cmd = `tasklist`; break;
        case 'darwin': cmd = `ps -ax | grep ${query}`; break;
        case 'linux': cmd = `ps -A`; break;
        default: break;
    }
    return new Promise((resolve) => {
        exec(cmd, (err, stdout, stderr) => {
            resolve(stdout.toLowerCase().indexOf(query.toLowerCase()) > -1);
        });
    })
}