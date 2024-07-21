<template>
  <div>
    <n-space justify="space-between">
      <b>极速模式并发检测数量</b>
      <div>
        <input :value="speed.maxCount" @change="changeValue" @blur="changeValue" type="number" style="width: 100px"
          min="1" :max="engine.engine === 'default' ? 6 : maxLen" />
      </div>
    </n-space>
    <div style="font-size: 12px; color: red">
      友情提示：{{ engine.engine === 'default' ? '最大数值6' : `最大数值${maxLen}` }}，超过最大建议数量可能造成检测不准确, 或电脑卡顿
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useSpeed } from "@/store/checkSpeed";
import { useEngine } from '@/store/engine';

const speed = useSpeed();
const engine = useEngine()
const maxLen = window.eUtils.getPcInfo().cpus().length;

function updateVal(v: number) {
  if (v < 0) {
    speed.changeDefaultSpeed(1);
    return
  }

  const max = engine.engine === 'default' ? 6 : maxLen
  if (v > max) {
    speed.changeDefaultSpeed(max);
    return
  }
  speed.changeDefaultSpeed(v);
}


function changeValue(e) {
  const v = e.target.value
  updateVal(v)
}

// 初始化校准
onMounted(() => {
  const v = speed.maxCount
  updateVal(v)
})
</script>
<style lang="less" scoped></style>
