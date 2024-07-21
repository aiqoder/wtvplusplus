<template>
  <div>
    <n-space justify="space-between">
      <b>检测列表持久化</b>
      <div>
        <n-switch v-model:value="l.isAutoClearCheckList">
          <template #checked> 是 </template>
          <template #unchecked> 否 </template>
        </n-switch>
      </div>
    </n-space>
  </div>
</template>
<script lang="ts" setup>
import { useList } from "@/store/autoClearList";
const l = useList();
</script>
