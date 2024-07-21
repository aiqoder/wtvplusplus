import { session } from "electron"
export const scheme = "check"
export function setHeaders() {
    const isLocalUrl = (url : string) => url.indexOf("//localhost") > -1 || url.indexOf("//127.0.0.1") > -1

    const anyFilter = {
        urls: ['https://*/*', 'http://*/*'],
    };

    session.defaultSession.webRequest.onBeforeSendHeaders(anyFilter, (details, callback) => {
        const u = new URL(details.url)
        if(u.hostname === "baidulive.starschina.com"){
            details.requestHeaders["User-Agent"] = "baiduboxapp"
            // callback({ cancel: false, requestHeaders: details.requestHeaders });
        }

        // 服务器更新使用代理
        // if(details.url.startsWith("https://github.com/biancangming/wtv")){
        //     details.url = `https://ghproxy.com/${details.url}`
        // }

        if(details.requestHeaders['Referer'] && isLocalUrl(details.requestHeaders['Referer'])){
            // FLV 视频跳过防盗链
            if (details.url.endsWith(".flv")) {
                delete details.requestHeaders['Referer']
            }

            if (details.requestHeaders['Referer']){
                details.requestHeaders['Referer'] = details.url;
            }    
        }

        callback({ cancel: false, requestHeaders: details.requestHeaders });
    });
}