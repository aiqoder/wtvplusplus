import { defineStore } from 'pinia';
import { useLocalStorage } from '@vueuse/core';

export const useSearch = defineStore("search", {
  state: () => ({
    url: useLocalStorage("search-url", ""),
    open: useLocalStorage("open-search", false)
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
  }
})