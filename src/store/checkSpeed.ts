import { defineStore } from 'pinia';
import { useLocalStorage } from '@vueuse/core';

export const useSpeed = defineStore("speed", {
  state: () => ({
    maxCount: useLocalStorage<number>("__max-count_default", 1),
    timeout: 30, // 监测超时时间设置，单位是s
    isAutoClearInvalid: useLocalStorage<boolean>("__auto_clear_invalid", false), // 自动清除无效源
  }),
  getters:{
    isHandleClear: (state) => !state.isAutoClearInvalid
  },
  actions: {
    changeDefaultSpeed(n: number){
      this.$state.maxCount = n
    },
    changeTimeout(n: number){
      this.$state.timeout = n
    },
  }
})