<template>
  <n-modal
    :show="show"
    :mask-closable="false"
    :close-on-esc="false"
    preset="card"
    title="AI 分组"
    :style="{ width: '420px' }"
    :closable="false"
  >
    <div class="ai-group-msg">{{ message || '准备 AI 分组…' }}</div>
    <n-progress
      type="line"
      :percentage="percentage"
      :processing="running"
      indicator-placement="inside"
      status="success"
    />
    <div class="ai-group-count" v-if="total > 0">
      {{ done }} / {{ total }}
    </div>
    <template #footer>
      <div class="ai-group-footer">
        <n-button @click="$emit('cancel')" :disabled="!running">取消</n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  running: { type: Boolean, default: false },
  done: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  message: { type: String, default: '' },
})

defineEmits<{ cancel: [] }>()

const percentage = computed(() => {
  if (!props.total) return props.running ? 0 : 100
  return Math.min(100, Math.round((props.done / props.total) * 100))
})
</script>

<style scoped>
.ai-group-msg {
  margin-bottom: 12px;
  color: var(--n-text-color);
  word-break: break-all;
}
.ai-group-count {
  margin-top: 8px;
  font-size: 12px;
  opacity: 0.7;
  text-align: right;
}
.ai-group-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
