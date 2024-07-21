<template>
  <n-space justify="space-between">
    <b>切换皮肤</b>
    <div>
      <n-radio-group v-model:value="themeStore.mode">
        <n-radio value="dark" name="dark">暗黑模式</n-radio>
        <n-radio value="light" name="light">亮色模式</n-radio>
      </n-radio-group>
    </div>
  </n-space>
</template>
<script lang="ts" setup>
import { useTheme } from "@/store/theme";
const themeStore = useTheme();
</script>
<style lang="less" scoped></style>
