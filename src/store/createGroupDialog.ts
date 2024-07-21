import { useLocalStorage } from '@vueuse/core';
import { defineStore } from 'pinia';

export const useCreateGroupDialog = defineStore("createGroupDialog", {
    state: () => ({
        open: false,
        text: useLocalStorage("create-group-dialog-text", ""),
    }),
})