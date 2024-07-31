<template>
    <n-form ref="formRef" :model="formModel" :rules="rules" label-placement="left" label-width="auto">
        <n-form-item label="开启搜一搜">
            <n-switch size="small" v-model:value="formModel.open" @update:value="changeSoso"/>
        </n-form-item>
        <n-form-item label="超级网关" v-if="formModel.open">
            <n-input v-model:value="search.url" clearable placeholder="请输入超级网关" />
        </n-form-item>
        <n-form-item v-if="formModel.open">
            <div class=" text-right w-full"><n-button type="primary" @click="submit()">验证</n-button></div>
        </n-form-item>
    </n-form>

</template>
<script setup lang="ts">
import { useSearch } from '@/store/search';
import { message } from '@/utils/data';
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
})

function changeSoso(val: boolean) {
    if (!val) {
        search.open = false
    }
}

function submit() {
    formRef.value?.validate((errors) => {
        axios.get(`${search.url}/v1/tv/identify`).then((res) => {
            if(res.data){
                localStorage.setItem("rule_password", res.data.password)
                search.open = formModel.open
                message.success("验证成功")
            }
        }).catch(() => {
            message.error("验证失败")
        })
   
    })
} 
</script>