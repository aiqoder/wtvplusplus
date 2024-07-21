import { defineStore } from 'pinia';
import { useLocalStorage } from '@vueuse/core';
import axios from "axios";

export const useCommon = defineStore("common", {
    state: () => ({
        ipv6: useLocalStorage<boolean>("__common", false),
        ipv6Loading: false,
    }),
    actions: {
        // b 打开或者关闭ipv6 tip 是否显示提示语
        openIpv6(b: boolean, tip = true) {
            this.$state.ipv6Loading = true
            if (!b) {
                this.$state.ipv6 = false
                this.$state.ipv6Loading = false
                return;
            };

            axios.get("https://ipv6.netarm.com").then(res => {
                this.$state.ipv6 = true
            }).catch(err => {
                if (tip) alert("您的网络不支持ipv6，开启失败，检查是否开启代理等？如果没有，可直接拨打 10086/10010/10000 三大运营商号码帮您解决")
            }).finally(() => {
                this.$state.ipv6Loading = false
            })
        },
        closeIpv6() {
            this.$state.ipv6 = false
        }
    }
})