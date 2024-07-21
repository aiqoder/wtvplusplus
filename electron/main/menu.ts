import { dialog, Menu } from "electron"
import { autoUpdater } from "electron-updater"

export default Menu.buildFromTemplate([
    // {
    //     label: '帮助',
    //     submenu: [
    //         {
    //             label: "检查更新",
    //             click(){
    //                 autoUpdater.checkForUpdates()
    //             }
    //         },
    //     ]
    // },
    {
        label: '关于',
        click() {
            dialog.showMessageBox({
                type: 'question',
                title: "关于",
                message: `一个橙子pro工具箱，纯属业余兴趣制作，一切用于商业活动产生后果本人概不负责。\n合作/联系微信：bianbingdang123`,
                buttons: ["取消"],
            })
        }
    }
])
