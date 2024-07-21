import { defineStore } from 'pinia';
import { useLocalStorage } from '@vueuse/core';

export const useEngine = defineStore("engine", {
  state: () => ({
    count: ref(0),
    engine: useLocalStorage<"default" | "ffmpeg">("__engine_default", "ffmpeg")
  }),
  actions: {
    changeDefault(){
      this.$state.engine = "default"
    },
    changeFFmpeg(){
      this.$state.engine = "ffmpeg"
    }
  }
})