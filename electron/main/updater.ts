import { autoUpdater } from "electron-updater"
import { BrowserWindow } from 'electron';
import { dialog, app } from 'electron'
import path from "path"

const updateURL = "https://ghproxy.com/https://github.com/biancangming/wtv/releases/download/tools/"

// 防止报错no such file or directory dev-app-update.yml
if (!app.isPackaged) {
    autoUpdater.updateConfigPath = path.join(__dirname, 'dev-app-update.yml')
}

export default (win: BrowserWindow) => {
    console.log("checking for update...")

    //取消自动安装
    autoUpdater.autoInstallOnAppQuit = false

    //设置自动下载
    autoUpdater.autoDownload = false

    autoUpdater.setFeedURL(updateURL);

    // 检测是否有新版本
    autoUpdater.checkForUpdates()

    // @ts-ignore 
    autoUpdater.on('checking-for-update', (res: any) => {
        // log.info("获取版本信息:" + res)
    })

    autoUpdater.on('update-not-available', res => {
        // dialog.showMessageBox({
        //     type: "info",
        //     title: "提示",
        //     message: "没有发现可用版本"
        // })
    })

    autoUpdater.on('update-available', res => {
        autoUpdater.downloadUpdate()
        // dialog.showMessageBox({
        //     type: 'info',
        //     title: '软件更新',
        //     message: '发现新版本, 确定更新?',
        //     buttons: ['确定', '取消']
        // }).then(resp => {
        //     if (resp.response == 0) {
        //         autoUpdater.downloadUpdate()
        //     }
        // })
    })

    autoUpdater.on('download-progress', res => {
        console.log("下载进度", Math.round(res.percent) / 100)
        win.setProgressBar(Math.round(res.percent) / 100);
    })

    autoUpdater.on('update-downloaded', (res) => {
        dialog.showMessageBox({
            title: '下载完成',
            message: '最新版本已下载完成, 退出程序进行安装',
            buttons: ['安装', '取消']
        }).then((resp) => {
            if (resp.response == 0) {
                autoUpdater.quitAndInstall()
            }
        })
    })

    autoUpdater.on('error', res => {
        console.error('Something went wrong:'+ res) // eslint-disable-line no-console
    })
}
