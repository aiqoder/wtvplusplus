import { defineStore } from 'pinia';
import { useLocalStorage } from '@vueuse/core';

export const useSearch = defineStore("search", {
  state: () => ({
    url: "https://jhsaj21.xxxsssttt.cyou/search-free-json/nbplus",
    activeCode: useLocalStorage("active-code", "")
  }),
  getters: {
    isSearchOpen: (state) => state.url
  }
})