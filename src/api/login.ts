import createRequest from '../utils/request';
const serverBaseUrl = import.meta.env.VITE_LIVE_BASE

export function loginUser({ username, password }) {
  return createRequest({
    url: serverBaseUrl + "/api/v1/user/login",
    data: {
      username, password
    },
    method: "POST"
  })
}

// 注册用户
export function registerUser({ username, password }){
  return createRequest({
    url: serverBaseUrl + "/api/v1/user/update",
    data: {
      username, password
    },
    method: "POST"
  })
}

// 判断账号是否登录
export function isLogin() {
  return new Promise(resolve => {
    createRequest({
      url: serverBaseUrl + "/api/v1/user/isLogin",
      method: "GET"
    }).then(() => {
      resolve(true)
    }).catch(() => {
      resolve(false)
    })
  })
}