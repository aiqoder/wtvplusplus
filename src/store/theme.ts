import { defineStore } from 'pinia';
import { useLocalStorage } from '@vueuse/core';

export const useTheme = defineStore("theme", {
  state: () => ({
    mode: useLocalStorage<"dark" | "light">("__theme_default", "light")
  }),
  getters:{

  },
  actions: {
    changeLight(){
      this.$state.mode = "light"
    },
    changeDark(){
      this.$state.mode = "dark"
    }
  }
})