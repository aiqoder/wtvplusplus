import { AxiosRequestConfig } from "axios"
import { Ref, ref } from "vue"
import server from "@/utils/request"
export default function useService(config: AxiosRequestConfig, defaultValue: any = [], delay = 200) {
    const resultData: Ref<any> = ref(defaultValue)

    function reload(userConf: AxiosRequestConfig, callback?: Function, errCallback?: Function) {
        setTimeout(() => {
            server({ ...config, ...userConf }).then(response => {
                resultData.value = response.data || defaultValue
                callback && callback(response.data || response)
            }).catch(err => {
                errCallback && errCallback(err)
            })
        }, delay)
    }

    // onMounted(() => { reload() })

    return {
        resultData,
        reload
    }
}
