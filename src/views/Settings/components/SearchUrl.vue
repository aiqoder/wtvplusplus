<template>
  <div>
    <n-space justify="space-between">
      <b>自定义搜索地址</b>
      <input v-model="search.url" style="width: 320px" min="1" max="100" />
    </n-space>
  </div>
</template>
<script lang="ts" setup>
import { useSearch } from "@/store/search";
const search = useSearch();
</script>
