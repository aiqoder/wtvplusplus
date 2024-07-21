import { defineStore } from 'pinia';
import { useLocalStorage } from '@vueuse/core';

export const useSearch = defineStore("search", {
  state: () => ({
    url: useLocalStorage("search-url", ""),
    activeCode: useLocalStorage("active-code", "")
  }),
  getters: {
    isSearchOpen: (state) => state.url
  }
})