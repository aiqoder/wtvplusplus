import axios, { AxiosRequestConfig } from "axios";
import { ref, Ref } from "vue"
const service = axios.create({
  baseURL: '/',
  timeout: 1000 * 10 // 30未返回设置为失败 
})



//用户判断
service.interceptors.request.use(
  config => {
    return config
  });


service.interceptors.response.use(
  (response) => {
    if (response.status == 200) {
      return response.data;
    }
  },
  (error) => {
    return Promise.reject(error)
  }
)

export interface Result<T = any> {
  code: 0 | 201 | 502 | 401,
  data: T;
  msg: string
}

function createRequest<T = any>(config: AxiosRequestConfig): Promise<Result<T>> {
  return service.request(config)
}

export function createAnyRequest<T = any>(config: AxiosRequestConfig): Promise<T> {
  return service.request(config)
}

//错误提示
export function resultTip(msg: string, code: number) {
  if (code && code > 0) {
    // message.error(msg);
    throw new Error(msg)
  } else {
    // message.success(msg);
  }
}

export function useAxiosRef(config: AxiosRequestConfig, tip?: boolean, defaultData: unknown = []) {

  //观测值
  const axiosRef = ref<Result>({ code: 0, data: defaultData, msg: "" })

  async function reload({ params = {}, data = {} }, callback?: (r: Result) => void) {
    const _result = await createRequest({ ...config, params, data })

    if (_result.code == 401) {
      //token失效
      location.href = '/login'
      return
    }

    if (tip) {
      resultTip(_result.msg, _result.code)
    }

    axiosRef.value = _result

    callback && callback(_result)

  }
  return {
    axiosRef: axiosRef as Ref<Result>,
    reload
  }
}

export default createRequest

