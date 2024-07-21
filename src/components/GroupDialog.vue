<template>
    <n-modal v-model:show="group.open" style="width: 100%" preset="dialog" title="自定义分组信息" positive-text="关闭" @positive-click="submitCallback"
        @negative-click="cancelCallback">
        这里设置的信息将改变检测列表中的分组项，请根据自己的喜好进行设置。
        <NInput v-model:value="group.text" type="textarea" :rows="18" placeholder="卫视:广东|北京|上海|山西|陕西|山东|河南
海外:xxx|xx|xxx"></NInput>
        </n-modal>
</template>
  
<script lang="ts">
import { defineComponent } from 'vue'
import { useCreateGroupDialog } from '@/store/createGroupDialog'

export default defineComponent({
    setup() {
        const group = useCreateGroupDialog()
        return {
            group,
            cancelCallback() {
                // message.success('Cancel')
            },
            submitCallback() {
                // message.success('Submit')
            }
        }
    }
})
</script>