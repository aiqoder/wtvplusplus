import { M3UObject } from '@/utils/file';
import createRequest from '../utils/request';
import { hasWolf } from "../utils/util"
import axios from 'axios';


// ------------------------我的服务器API--------------------------------------
export function addTvs(data) {
    const baseUrl = localStorage.getItem("search-url")
    if (baseUrl) {
        if (!data.name) return
        // if (!canUpload(data.name)) return
        if (hasWolf(data.name)) return;

        axios({
            url: `${baseUrl}/v1/tv/update`,
            data,
            method: "POST"
        })
    }
    // 入库大池
    if (data.url.includes("172.16") || data.url.includes("192.168") || data.url.includes("127.0.0.1") || data.url.includes("localhost")) return // 排除局域网
    createRequest({
        url: `${import.meta.env.VITE_LIVE_BASE}/v1/tv/tvs/addTvs`,
        method: "POST",
        data,
    })

}