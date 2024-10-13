import { createApp } from 'vue'
import App from './App.vue'
import './index.scss'
import 'virtual:uno.css'
import router from './router'
import { createPinia } from 'pinia'
// import NaiveUI from 'naive-ui'
import Directive from "./directive"
//@ts-ignore
import contextmenu from 'vue3-contextmenu'

// eventbus
import emitter from './utils/eventbus'
import axios from 'axios'

const app = createApp(App)

// EVENT BUS
app.config.globalProperties.$bus = emitter
// import 'vue3-contextmenu/dist/vue3-contextmenu.css' // 右键需要导入的样式
app.use(contextmenu)// 右键
app.use(router)
// app.use(NaiveUI)
app.use(Directive)
app.use(createPinia())
app.mount('#app')

const pwd = localStorage.getItem("__password_txt")
const url = localStorage.getItem("search-url")

if (pwd && url) {
    axios.get(`${url}/v1/tv/identify`, { params: { password: pwd } }).then((res) => {
        if (res.data) {
            localStorage.setItem("rule_password", res.data.password)
            localStorage.setItem("auth", res.data.token)
        }
    })
}

axios.interceptors.request.use((config: any) => {
    config.headers["Authorization"] = localStorage.getItem("auth")

    return config;
},
    (err) => {
        console.log(err);
    })