<template>
    <div class="pd">
        <RuleEditor />
    </div>
</template>
<script setup lang="ts">
import RuleEditor from "@/components/RuleEditor.vue"
import { message } from "@/utils/data";
import { md5 } from "howtools";
import { NInput, useDialog } from 'naive-ui'
const dialog = useDialog()

const value = ref('')
onMounted(() => {
    dialog.warning({
        title: '请输入密码',
        content: () => h(NInput, { placeholder: '请输入密码', onInput: (e) => { value.value = e } }),
        positiveText: '确定',
        closable: false,
        maskClosable: false,
        closeOnEsc: false,
        onPositiveClick: () => {
            const password = localStorage.getItem("rule_password")
            if (md5(value.value) == password) {
                message.success("密码正确")
                sessionStorage.setItem("raw_rule_password", value.value)
                dialog.destroyAll()
            } else {
                message.error("密码错误")
                return false
            }
        },
    })
})

onUnmounted(() => {
    dialog.destroyAll()
})
</script>
<style lang="scss" scoped>
.pd {
    padding: 0.5rem;
    overflow: auto;
    height: calc(100vh - 20px);
}

:global(.n-modal-mask) {
    background-color: transparent;
    left: 6rem;
}

:global(.n-modal-body-wrapper) {
    left: 6rem;
}
</style>