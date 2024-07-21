import { dialog, ipcMain } from "electron"
import { startedApps } from "./newWindow";
import { readFileAsText, writeFileAsText } from './utils/util';

function readFileDialogAsText(appName: string, extensions = ['txt', 'm3u', 'm3u8']) {
  return new Promise((reslove, reject) => {
    dialog.showOpenDialog(startedApps[appName], {
      title: " 🍊请选择文件夹，公众号：一个橙子pro  🍊",
      buttonLabel: "选好了就点这里吧",
      properties: ['openFile'],
      filters: [
        { name: '源文件', extensions },
      ]
    }).then(({ canceled, filePaths }) => {
      if (canceled) {
        console.log("已取消");
      } else {
        const file = filePaths[0]
        readFileAsText(file).then(textString => {
          reslove({
            path: file,
            data: textString
          })
        });
      }
    }).catch(err => {
      console.log(err)
    })
  })

}

ipcMain.handle("chengzi-load-dialog-file", (ev, appName, extensions) => {
  if (extensions) {
    return readFileDialogAsText(appName, extensions)
  } else {
    return readFileDialogAsText(appName)
  }
})

ipcMain.handle("chengzi-load-file", (ev, path) => {
  return readFileAsText(path)
})

ipcMain.handle("chengzi-write-file", (ev, args, data) => {
 
  return writeFileAsText(args, data)
})