<template>
  <div class="center">
    <div>显示列：</div>
    <n-radio-group v-model:value="checked">
      <n-space item-style="display: flex;">
        <n-radio v-for="m in m3uColumns" :key="m.key" :value="m.key">{{
          m.title
        }}</n-radio>
      </n-space>
    </n-radio-group>
  </div>
</template>
<script lang="ts" setup>
import { useLocalStorage } from "@vueuse/core";

const checked = useLocalStorage("__r_speed", "rSpeed");

const emit = defineEmits<{
  (e: "change", value: string): void;
}>();

const m3uColumns = [
  {
    title: "归属地",
    key: "region",
  },
  {
    title: "响应速度",
    key: "rSpeed",
  },
];

watchEffect(() => {
  emit("change", checked.value);
});

onMounted(() => {
  emit("change", checked.value);
});
</script>
<style lang="less" scoped>
.center {
  display: flex;
  align-items: center;
  height: 30px;
  margin-top: 8px;
}
</style>
