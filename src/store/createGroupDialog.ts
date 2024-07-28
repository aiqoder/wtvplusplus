import { useLocalStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import groupTxt from "@/assets/txt/group.txt?raw"
import axios from 'axios';
export const useCreateGroupDialog = defineStore("createGroupDialog", () => {
    const open = ref(false)
    const text = useLocalStorage("create-group-dialog-text", groupTxt)
    const rule = useLocalStorage("create-group-rule-yaml", "")

    function loadYaml() {
        const baseUrl = localStorage.getItem("search-url")
        const ax = axios.get(`${baseUrl}/v1/tv/rule/get`)
        ax.then(res => {
            rule.value = res.data
        })
        return ax
    }

    function updateYaml(data: string) {
        const pwd = sessionStorage.getItem("raw_rule_password")
        const baseUrl = localStorage.getItem("search-url")
        return axios.post(`${baseUrl}/v1/tv/rule/update`, { data, password: pwd })
    }

    return {
        open,
        text,
        rule,
        loadYaml,
        updateYaml,
    }
})