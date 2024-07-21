import { defineStore } from 'pinia';
import { useLocalStorage } from '@vueuse/core';
import { message } from '@/utils/data';

export const useDevMode = defineStore("developer", {
  state: () => ({
    count: ref(0),
    isDevMode: useLocalStorage("__developer_open", false)
  }),
  actions: {
    openDevMode() {
      if (this.$state.isDevMode) {
        return
      }

      this.$state.count += 1

      if (this.$state.count > 5) {
        message.warning("再连续点击10次，打开开发者模式")
      }

      if (this.$state.count >= 15) {
        this.$state.isDevMode = true
        message.success("恭喜你，激活开发者模式")
      }
    }
  }
})