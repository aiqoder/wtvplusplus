import { ipcMain, app as electronApp } from 'electron' ;
// 属性返回启动 Node.js 进程的可执行文件的绝对路径名。
const exePath = process.execPath;

module.exports = (() => {
  // 给渲染页面获取当前的状态
  ipcMain.handle('get-auto-start-status', () => electronApp.getLoginItemSettings())

  // 设置开启自启
  ipcMain.on('auto-start-open', () => {
    electronApp.setLoginItemSettings({
      openAtLogin: true,
      path: exePath,
      args: []
    })
  });

  //设置开机不自启
  ipcMain.on('auto-start-closed', () => {
    electronApp.setLoginItemSettings({
      openAtLogin: false,
      path: exePath,
      args: []
    })
  })

});