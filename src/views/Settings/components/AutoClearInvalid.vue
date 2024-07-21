<template>
  <div>
    <n-space justify="space-between">
      <b>自动清除无效源</b>
      <div>
        <n-switch v-model:value="speed.isAutoClearInvalid">
          <template #checked> 自动 </template>
          <template #unchecked> 手动 </template>
        </n-switch>
      </div>
    </n-space>
  </div>
</template>
<script lang="ts" setup>
import { useSpeed } from "@/store/checkSpeed";
const speed = useSpeed();
</script>
