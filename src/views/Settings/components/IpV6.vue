<template>
  <div>
    <n-space justify="space-between">
      <b>IPV6</b>
      <div>
        <n-switch v-model:value="l.ipv6" :on-update:value="l.openIpv6" :loading="l.ipv6Loading">
          <template #checked> 开启 </template>
          <template #unchecked> 关闭 </template>
        </n-switch>
      </div>
    </n-space>
  </div>
</template>
<script lang="ts" setup>
import { useCommon } from "@/store/common";
const l = useCommon();
</script>