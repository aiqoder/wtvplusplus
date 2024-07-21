<template>
  <div class="title">
    <img :src="electron" style="width:80px;height:80px" />
    <n-h1>
      <span>Wtv工具箱 for Windows</span> 
    </n-h1>
  </div>
</template>
<script setup lang="ts">
import electron from "@/assets/electron.png";
</script>
<style scoped>
.title {
  text-align: center;
  display: flex;
  justify-content: space-around;
  align-items: center;
}
</style>
