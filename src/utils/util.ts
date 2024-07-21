import { isNumber, numberAndWordReg, md5 } from 'howtools';
import CryptoJS from "crypto-js";

export const jsSleep = (milliseconds: number) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

export function exportFile(data: string, name: string) {
    let urlObject = window.URL || window.webkitURL || window;
    let export_blob = new Blob([data]);
    let save_link = document.createElement("a")
    save_link.href = urlObject.createObjectURL(export_blob);
    save_link.download = name;
    save_link.target = "_blank"
    save_link.click();
    save_link.remove()
}

// 能否上传服务器
export function canUpload(str: string) {
    // 名称不存在则直接跳过
    if (!str) return false

    // 包含日文直接飘过...
    if (/[\u0800-\u4e00]/.test(str)) {
        return false
    }

    // /[\u4e00-\u9fa5]+/g 匹配中文汉字,汉字超过8个不存储
    const zh = str.match(/[\u4e00-\u9fa5]+/g) || [""]
    if (zh[0].length > 8) {
        return false
    }

    // 直接跳过自然数测试
    if (numberAndWordReg.test(str)) {
        return false
    }

    // 直接跳过 例如 1号 2号的编码，这些可能是黑鸟播放器扫描出来的
    if (/^\d+号/.test(str)) {
        return false
    }

    // 直接跳过数字名称的节目
    if (isNumber(str)) {
        return false
    }

    // 电视剧系列直接跳过,比如第3集，第五集之类...
    if (/第(.*?)集/.test(str)) {
        return false
    }

    // 一般的综艺节目
    if (/第(.*?)季/.test(str)) {
        return false
    }

    const contents = ['Unknown', '�', '《', 'DJ', 'dj', '歌', '舞', '专辑', '网络', '视频']
    for (const content of contents) {
        if (str.includes(content)) {
            return false
        }
    }
    return true
}

//防狼检测、用户健康检测, 无意义名称检测
export function hasWolf(str: string) {
    // 健康模式关闭状态，跳过检查
    if (localStorage.getItem("_menu_wolf") == "false") {
        return false
    }
    let skip = false

    const contents = ['男', '女', 'sex', '肉', '乳', '色', '淫', '凌', '辱',
        '人', '性', '羞', '91', '麻豆', '妻', '爆', '肛', 'AV', '虐',
        '裸', '幼', '骚', '情欲', '春药', '寂寞', '双飞', '妓',
        '老師', '老师', '艳遇', '湿身', '射', '车震', '吻', '足交']
    for (const content of contents) {
        if (str.includes(content)) {
            skip = true
            break
        }
    }
    return skip
}


export const groupBy = (list: any[], key: string) => {
    const obj: Record<string, any> = {};
    list.map(item => {
        if (!obj[item[key]]) { //如果不存在这个属性
            obj[item[key]] = [];
        }
        obj[item[key]].push(item);
    });
    return obj;
}


/**
 * @param  {string} name 传入文件名称
 */
export function fileSuffix(name: string) {
    const lastIndex = name.lastIndexOf('.');
    return name.substring(lastIndex, name.length);
}


//秘钥
const CRYPTOJSKEY = "一个橙子20220707";


//解密
export function decrypt(encryptedBase64Str) {
    let key = CryptoJS.enc.Utf8.parse(md5(CRYPTOJSKEY));

    let decryptedData = CryptoJS.AES.decrypt(encryptedBase64Str, key, {
        iv: key,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    return decryptedData.toString(CryptoJS.enc.Utf8);
}

export function isMac() {
    return navigator.platform.indexOf("Mac") === 0
}