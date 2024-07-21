import { Base64 } from 'howtools';
import createRequest from '../utils/request';
import { canUpload, hasWolf } from "../utils/util"
import pkg from "../../package.json"

export interface NewTvs {
    name: string,
    url: string,
    id?: number,
    telecomValid: boolean,
    unicomValid: boolean,
    mobileValid: boolean
}

export interface CitySnType {
    ip: string
    province: string
    city: string
    isp: string
}

export const CitySn: CitySnType = {
    ip: "",
    province: "",
    city: "",
    isp: "",
}

// 搜狐IP查询
export async function getSohuSn() {
    CitySn.ip = await window.eUtils?.getStore("sn.ip")
    CitySn.province = await window.eUtils?.getStore("sn.province")
    CitySn.city = await window.eUtils?.getStore("sn.city")
    CitySn.isp = await window.eUtils?.getStore("sn.isp")
}


// ------------------------我的服务器API--------------------------------------
const serverBaseUrl = import.meta.env.VITE_LIVE_BASE


export function tvgLogoUrl(tvgName: string) {
    return serverBaseUrl + `/api/v1/tvg/logo/${tvgName}`
}

export function getLives() {
    return createRequest({
        url: `${serverBaseUrl}/api/v1/urls/lives`
    })
}


let wolfurls: string[] = [] // 来自后端
export function addTvs(data: { name: string, url: string, id?: number }) {
    if (data.id) return
    if (data.url.endsWith('.mp4')) return
    if (data.url.includes("172.16") || data.url.includes("182.168")) return // 排除局域网

    if (wolfurls.length === 0) {
        const b = sessionStorage.getItem("wolfstr")
        wolfurls = (b ? new Base64().decode(b) : "").split(",")
    }

    // 跳过后端防御的域名
    for (const wolf of wolfurls) {
        if (data.url.includes(wolf)) {
            return
        }
    }

    if (!canUpload(data.name)) return
    if (hasWolf(data.name)) return;
    return createRequest({
        url: `${serverBaseUrl}/api/v1/tvs/addTvs`,
        data,
        method: "POST"
    })
}

export function updateCheckLog(data: { cip: string, cid: string, cname: string, tvsId?: number, tvsUrl: string, valid: 0 | 1, status?: number }) {
    return createRequest({
        url: `${serverBaseUrl}/api/v1/check/update`,
        data: {
            ...data,
            version: pkg.version
        },
        method: "POST"
    })
}

// 获取实验室链接分享文件
export function getShareLinks() {
    return createRequest({
        url: `${serverBaseUrl}/static/tvshare.txt`,
        transformResponse(data: string) {
            const result = {}
            let currentName = ""
            for (const r of data.split("\r\n")) {
                if (!r) continue
                if (r.indexOf('--') > -1) {
                    currentName = r.replaceAll('--', '')
                    //@ts-ignore
                    result[currentName] = []
                } else {
                    const [title, url] = r.split(",")
                    //@ts-ignore
                    result[currentName].push({ title, url })
                }
            }
            return result
        }
    })
}


// f2f支付 total_fee 总费用 order_name 订单名称
export function aliF2FPay(totalFee: number = 10, orderName: string = "测试订单") {
    return createRequest({
        url: `${serverBaseUrl}/api/pay/do`,
        params: {
            totalFee,
            orderName
        },
        method: "GET"
    })
}
