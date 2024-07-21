import { ipcMain, dialog } from "electron"
import { startedApps } from "../newWindow"
// 选择文件夹
function readDirectoryDialog(appName: string, extensions = []) {
    return new Promise((reslove, reject) => {
        dialog.showOpenDialog(startedApps[appName], {
            title: " 🍊请选择文件，公众号：一个橙子pro  🍊",
            buttonLabel: "选好了就点这里吧",
            properties: ['openDirectory'],
            filters: [ 
                { name: '源文件', extensions },
            ]
        }).then(({ canceled, filePaths }) => {
            if (canceled) {
            } else {
                reslove(filePaths)
            }
        }).catch(err => {
            console.log(err)
        })
    })
}

ipcMain.handle("chengzi-wtv-read-directory", (ev, appName, extensions) => {
    if (extensions) {
        return readDirectoryDialog(appName, extensions)
    } else {
        return readDirectoryDialog(appName)
    }
})