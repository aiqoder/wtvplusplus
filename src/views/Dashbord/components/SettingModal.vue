<template>
    <n-form ref="formRef" :model="formModel" :rules="rules" label-placement="left" label-width="auto">
        <div class=" flex gap-4">
            <n-form-item label="严格模式">
                <n-switch size="small" v-model:value="search.strict" />
            </n-form-item>
            <span v-if="search.strict" class=" text-red mt-1">严格模式对音视频流的质量要求较高，可能造成大量源检测不通过 </span>
        </div>
        <n-form-item label="设置网关">
            <n-switch size="small" v-model:value="formModel.open" @update:value="changeSoso" />
        </n-form-item>
        <div class=" flex flex-1 gap-10">
            <n-form-item label="超级网关" v-if="formModel.open">
                <n-input v-model:value="search.url" clearable placeholder="请输入超级网关" />
            </n-form-item>
            <n-form-item label="密码" v-if="formModel.open">
                <n-input v-model:value="formModel.password" type="password" clearable placeholder="请输入密码" />
            </n-form-item>
        </div>
        <n-form-item v-if="formModel.open">
            <div class=" text-right w-full"><n-button type="primary" @click="submit()">验证</n-button></div>
        </n-form-item>
    </n-form>

</template>
<script setup lang="ts">
import { useSearch } from '@/store/search';
import { message } from '@/utils/data';
import { useLocalStorage } from '@vueuse/core';
import axios from 'axios';
import { urlReg } from 'howtools';
import { FormItemRule, FormRules, NForm } from 'naive-ui';
const formRef = ref<InstanceType<typeof NForm>>()
const rules: FormRules = {
    url: [
        {
            required: true,
            validator(rule: FormItemRule, value: string) {
                if (!value) {
                    return new Error("请输入");
                } else if (!urlReg.test(value)) {
                    return new Error("请输入正确的网络地址");
                }

                return true;
            },
            trigger: ["input", "blur"],
        },
    ],
};

const search = useSearch()
const formModel = reactive({
    url: search.url,
    open: search.open,
    password: useLocalStorage("__password_txt", ""),
})

function changeSoso(val: boolean) {
    if (!val) {
        search.open = false
    }
}

function submit() {
    formRef.value?.validate((errors) => {
        axios.get(`${search.url}/v1/tv/identify`, { params: { password: formModel.password } }).then((res) => {
            if (res.data) {
                localStorage.setItem("rule_password", res.data.password)
                localStorage.setItem("auth", res.data.token)
                search.open = formModel.open
                message.success("验证成功")
            }
        }).catch(() => {
            message.error("验证失败")
        })

    })
} 
</script>