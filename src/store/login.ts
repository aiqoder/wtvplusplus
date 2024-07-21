import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core';
import { loginUser, registerUser } from '@/api/login';
import { message } from '@/utils/data';
import emitter from '@/utils/eventbus';

export const useUser = defineStore("login", {
  state: () => ({
    user: useLocalStorage("_user_info", { username: "", password: "" }),
    token: useLocalStorage("_token", ""),
    visible: false,// 登录窗口可见性
    username: useLocalStorage("_user_name", ""),// 登录之后的用户名称
  }),
  getters: {
    isLogin: (state) => {
      return state.username !== ""
    }
  },
  actions: {
    login() { // 登录用户
      const { username, password } = this.$state.user
      loginUser({
        username,
        password,
      }).then(res => {
        this.$state.user.username = username
        this.username = username
        this.$state.token = res.data
        this.$state.visible = false
        emitter.emit("login-after") // 通知全局登录成功
      }).catch(() => {
        message.error("用户名或者密码错误，联系管理员")
      })
    },
    register() {// 注册用户
      const { username, password } = this.$state.user
      registerUser({
        username,
        password,
      }).then(res => {
        message.success(res.msg)
      }).catch((err) => {
        message.error(err.response.data.msg)
      })
    },
    loginOut() {
      this.$state.token = ""
      this.$state.username = ""
      emitter.emit("login-out-after") // 通知全局登出成功
    },
    openLoginVisible() {
      this.visible = true
    },
  }
})