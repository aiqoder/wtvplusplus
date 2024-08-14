import createRequest from '../utils/request';
import { canUpload, hasWolf } from "../utils/util"


// ------------------------我的服务器API--------------------------------------
export function addTvs(data: { name: string, url: string, id?: number, fail: boolean }) {
    
    if (data.url.includes("172.16") || data.url.includes("182.168") || data.url.includes("127.0.0.1") || data.url.includes("localhost")) return // 排除局域网
    const baseUrl = localStorage.getItem("search-url")
    if(!baseUrl) return

    // if (!canUpload(data.name)) return
    if (hasWolf(data.name)) return;

    
    return createRequest({
        url: `${baseUrl}/v1/tv/update`,
        data,
        method: "POST"
    })
}