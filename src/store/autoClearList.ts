import { defineStore } from 'pinia';
import { useLocalStorage } from '@vueuse/core';
import { M3UObject } from '@/utils/file';

export const useList = defineStore("list", {
  state: () => ({
    isAutoClearCheckList: useLocalStorage<boolean>("__auto_clear_list", true), // 检测列表保持
    list: useLocalStorage<M3UObject[]>("wait_check_data", []),
  }),
  actions: {
    openAutoClear(){
      this.$state.isAutoClearCheckList = false
    },
    closeAutoClear(){
      this.$state.isAutoClearCheckList = true
    },
  }
})