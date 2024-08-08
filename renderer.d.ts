import { MyBrowserWindow } from "../wtv-tools/packages/main/newWindow"
import { ChildProcessWithoutNullStreams } from "child_process";
import * as http from 'http';
import { ExecOpts } from "../wtv-tools/packages/main/utils/exec"
import { Point } from "electron";
export interface EAPI {
    loadPreferences: () => Promise<void>,
    getClipboardText: () => string,
    writeClipboardText: (text: string) => void,
    createWindow: (config: MyBrowserWindow) => void,
    removeWindow: (config: appName) => void,
    readFileDialogAsText: (appName: string, extensions?: string[]) => Promise,
    readFileAsText: (path: string) => Promise,
    writeFileAsText: (path: string, data: any) => Promise,
    upgrade: () => void,
    localIp: any,
    openUrl: (url: string) => void,
    getPrintersAsync: () => Promise<Electron.PrinterInfo[]>,
    getCursorScreenPoint: () => Promise<Point>,
}

export interface VERSIONAPI {
    onVersionUpdate: (callback: (type: "update-available" | "download-progress" | "update-downloaded" | "update-not-available", message: any) => void) => void,
    downLoadLastVersion: () => void,
    checkForUpdate: () => void,
}

export interface TITLEBAR {
    winControl: (control: "win-close" | "win-min" | "win-max" | "win-unmax") => void
}

export interface EUTILS {
    [x: string]: any;
    toFlV: (url: string) => ({
        ffmpeg: any,
        stop: () => void
    }),
    getPcInfo: () => any,
    execPorcess: (args: ExecOpts, cb?: (data: any) => void) => Promise<{ data: string, process: ChildProcessWithoutNullStreams, type: "process" | "end" }>,
    receiveExecStream: (fn: (data: any) => void) => void;
    closePorcess: (name: string) => Promise<{ data: string, process: ChildProcessWithoutNullStreams, type: "process" | "end" }>,
    processIsRunning: (name: string) => Promise<boolean>,
    getPath: (args: string, clear?: boolean) => Promise<string>,
    createStaticServer: (path: string) => Promise<{ port: string, close: Function, start: Function }>,
    setStore: (key: string, value: any) => void,
    getStore: (key: string) => any,
}

export interface FILESHARE {
    openDirectory: () => any
}

declare global {
    interface Window {
        eApi: EAPI,
        version: VERSIONAPI,
        titleBar: TITLEBAR,
        eUtils: EUTILS,
        nedb: NEDB,
        orm: ORM,
        fileshare: FILESHARE,
    }
}