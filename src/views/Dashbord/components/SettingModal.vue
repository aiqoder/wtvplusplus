<template>
    <n-form ref="formRef"  :model="formModel" :rules="rules" label-placement="left" label-width="auto">
        <n-form-item label="开启搜一搜">
            <n-switch size="small" v-model:value="search.open" />
        </n-form-item>
        <n-form-item label="超级网关" v-if="formModel.open">
            <n-input v-model:value="search.url" clearable placeholder="请输入超级网关"/>
        </n-form-item>
    </n-form>

</template>
<script setup lang="ts">
import { useSearch } from '@/store/search';
import { urlReg } from 'howtools';
import { FormItemRule, FormRules } from 'naive-ui';

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
</script>