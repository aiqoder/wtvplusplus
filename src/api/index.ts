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
}

export function getRule() {
    const baseUrl = localStorage.getItem("search-url")
    return axios.get(`${baseUrl}/v1/tv/rule/get`)
}
