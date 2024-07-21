<template>
  <div>
    <n-space justify="space-between">
      <b>切换检测引擎</b>
      <div>
        <n-radio-group v-model:value="engine.engine">
          <n-radio value="default" name="default">HTTP</n-radio>
          <n-radio value="ffmpeg" name="ffmpeg">FFMPEG</n-radio>
        </n-radio-group>
      </div>
    </n-space>
    <div style="font-size: 12px; color: red">友情提示：HTTP 模式不支持分辨率检测</div>
  </div>
</template>
<script lang="ts" setup>
import { useEngine } from "@/store/engine";
const engine = useEngine();
</script>
<style lang="less" scoped></style>
