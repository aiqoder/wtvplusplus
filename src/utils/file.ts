import { parse as m3u8Parse } from "iptv-playlist-parser";
import { handleUserGroup } from "./defaultGroup";
import { hasWolf } from "./util";

export const isUrl = (url: string) => {
    try {
        return !!new URL(url).protocol
    } catch (error) {
        return false
    }
}

function checkUtf8(file: File) {
    return new Promise(resolve => {
        let _isUtf8 = false
        const reader = new FileReader();
        reader.onloadend = (res) => {
            const txt = res.target?.result as string
            _isUtf8 = txt.indexOf("�") === -1
            resolve(_isUtf8);
        };
        reader.readAsText(file, 'utf-8');
    })
}

export function readerFileAsText(file: File): Promise<string | undefined> {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = (res) => {
            const txt = res.target?.result as string
            resolve(txt);
        };
        checkUtf8(file).then((utf8) => {
            if (utf8) {
                reader.readAsText(file, 'utf-8');
            } else {
                reader.readAsText(file, 'gb2312');
            }
        })
    })
}

export interface M3UObject {
    id?: number,
    name: string;
    url: string;
    group: string; // 智能分组
    region: string;
    rSpeed?: string;
    ratio?: string;
    success?: boolean;
    fps?: number;
    width?: number;
    height?: number;
    speed?: number;
}


// 从.m3u 文件读取直播源
export function readerHandleM3u(manifest: string) {
    const result = m3u8Parse(manifest as string);
    const { items } = result;
    const _import_result: M3UObject[] = [];
    for (const item of items || []) {
        if (hasWolf(item.name)) continue; //健康检测
        // tvg-id tvg-name tvg-logo group-title,CCTV2 财经
        if (!item.name || !item.url) continue;
        _import_result.push({ name: item.name.replace(/tvg-(.*?) |group-title|,/g, '').trim(), url: item.url, region: "", group: item.group.title || handleUserGroup(item.name) });
    }
    return _import_result
}

// 从.m3u 文件读取直播源
export function readerSuffixM3u(file: File): Promise<M3UObject[]> {
    return new Promise((resolve) => {
        readerFileAsText(file).then((manifest) => {
            resolve(readerHandleM3u(manifest || ""))
        });
    })
}

// 读取txt文本
export function readerHandleTxt(manifest: string) {
    let lastGroup: undefined | string = undefined // 用于记录导入的节目分组内容

    //读取$结尾的网址 http://39.136.48.2:8089/PLTV/88888888/224/3221225859/index.m3u8$华东
    function _readerTextBy$(name: string, url: string) {
        return { name, url: url.replace(/\$.*/, ""), region: "", group: lastGroup || handleUserGroup(name) }
    }

    // 读取井号分割的数据
    function _readerTextByJing(name: string, url: string) {
        const _r: M3UObject[] = [];
        const urls = url.split("#http").map((item, index) => index ? "http" + item : item);
        for (const u of urls) {
            _r.push(_readerTextBy$(name, u))
        }
        return _r
    }

    const results = manifest?.split("\n") || [];
    const _import_result: M3UObject[] = [];

    for (const item of results) {
        // 检查分组内容，并设置最后一次的分组名称
        if (item.trim().endsWith("#genre#")) {
            lastGroup = item.trim().split(",")[0]
        }
        const [name, url] = item.replaceAll("\r", "").split(",");
        if (!name || !url) continue;
        if (hasWolf(name)) continue; //健康检测

        if (url.includes("#http")) {
            _import_result.push(..._readerTextByJing(name, url))
        } else if (isUrl(url.trim())) {// 正常URL导入
            _import_result.push({ name, url: url.trim(), region: "", group: lastGroup || handleUserGroup(name) });
            // 井号分割导入
        } else if (url.match(/\$.*/)) {
            _import_result.push(_readerTextBy$(name, url))
        } else if (url.match(/\|.*/)) {
            _import_result.push(_readerTextBy$(name, url))
        }
    }
    return _import_result
}

// 从.txt 文件读取直播源
export function readerSuffixTxt(file: File): Promise<M3UObject[]> {
    return new Promise((resolve) => {
        readerFileAsText(file).then((manifest) => {
            resolve(readerHandleTxt(manifest || ""))
        });
    })
}
