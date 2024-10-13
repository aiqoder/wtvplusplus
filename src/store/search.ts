import { defineStore } from 'pinia';
import { useLocalStorage } from '@vueuse/core';
import YAML from 'yaml'
import { uniq } from 'lodash-es';

export const useSearch = defineStore("search", {
  state: () => ({
    url: useLocalStorage("search-url", ""),
    open: useLocalStorage("open-search", false),
    strict:  useLocalStorage("check-strict", false), // 是否严格模式
    autoCheckQueen: []
  }),
  getters: {
    isSearchOpen: (state) => state.open && state.url,
    getUrl: (state) => {
      const url = state.url.trim()
      if (url.startsWith("http://") || url.startsWith("https://")) {
        return state.url
      } else {
        return `http://${url}`
      }
    }
  },
  actions: {
    loadAutoCheckData(){
      // 加载设置的规则
      const txt = localStorage.getItem("create-group-rule-yaml") || ""
      const data = YAML.parse(txt)
      for (const [key,value] of Object.entries(data?.name || {})) {
        // @ts-ignore
        this.autoCheckQueen.push(...uniq((value as string).split("#")))
      }
    },
    getNext(){
      return this.autoCheckQueen.pop()
    },
    stopAutoCheck(){
      this.autoCheckQueen.length = 0
    }
  }
})