<template>
  <div>
    <n-space justify="space-between">
      <b>超时时间设置（秒）</b>
      <div>
        <input
          :value="speed.timeout"
          @change="changeValue"
          type="number"
          style="width: 100px"
          min="1"
          max="100"
        />
      </div>
    </n-space>
  </div>
</template>
<script lang="ts" setup>
import { useSpeed } from "@/store/checkSpeed";
const speed = useSpeed();

function changeValue(e) {
  speed.changeTimeout(e.target.value);
}
</script>
