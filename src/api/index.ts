import createRequest from '../utils/request';
import { canUpload, hasWolf } from "../utils/util"


// ------------------------我的服务器API--------------------------------------
const serverBaseUrl = import.meta.env.VITE_LIVE_BASE


export function addTvs(data: { name: string, url: string, id?: number }) {
    if (data.url.includes("172.16") || data.url.includes("182.168") || data.url.includes("127.0.0.1") || data.url.includes("localhost")) return // 排除局域网

    if (!canUpload(data.name)) return
    if (hasWolf(data.name)) return;
    return createRequest({
        url: `${serverBaseUrl}/v1/tv/update`,
        data,
        method: "POST"
    })
}