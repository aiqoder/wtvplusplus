<template>
  <n-form label-placement="left" require-mark-placement="right-hanging">
    <n-form-item label="导出格式">
      <n-radio-group v-model:value="model.type" name="playlist-export-type">
        <n-space>
          <n-radio value="m3u">m3u</n-radio>
          <n-radio value="txt">txt</n-radio>
          <n-radio value="txt-merge">txt 合并相同频道</n-radio>
        </n-space>
      </n-radio-group>
    </n-form-item>
    <n-form-item label="分组">
      <n-radio-group v-model:value="model.isGroup" name="playlist-export-group">
        <n-radio :value="1">分组导出</n-radio>
        <n-radio :value="0">普通导出</n-radio>
      </n-radio-group>
    </n-form-item>
  </n-form>
  <div style="display: flex; justify-content: flex-end">
    <n-space>
      <n-button round color="#8a2be2" text-color="#FFF" :disabled="!hasData" @click="exportToDisk">
        导出到磁盘
      </n-button>
      <n-button round color="#8a2be2" text-color="#FFF" :disabled="!hasData" @click="exportToClipboard">
        导出到剪贴板
      </n-button>
    </n-space>
  </div>
</template>

<script lang="ts" setup>
import { selectAndWrite, writeClipboard } from '@/api/native'
import type { PlaylistGroup } from '@/api/native'
import { message } from '@/utils/data'
import {
  formatPlaylistExport,
  playlistExportFilename,
  type PlaylistExportFormat,
} from '@/utils/playlistExport'
import type { PropType } from 'vue'

const props = defineProps({
  groups: {
    type: Array as PropType<PlaylistGroup[]>,
    default: () => [],
  },
})

const model = reactive({
  type: 'm3u' as PlaylistExportFormat,
  isGroup: 1 as 0 | 1,
})

const hasData = computed(() => (props.groups || []).some((g) => (g.items || []).length > 0))

function buildContent() {
  return formatPlaylistExport(props.groups || [], model.type, model.isGroup === 1)
}

async function exportToDisk() {
  if (!hasData.value) {
    message.warning('播放列表为空')
    return
  }
  try {
    const path = await selectAndWrite(playlistExportFilename(model.type), buildContent())
    if (!path) return
    message.success('导出成功')
  } catch (e: any) {
    message.error(e?.message || '导出失败')
  }
}

async function exportToClipboard() {
  if (!hasData.value) {
    message.warning('播放列表为空')
    return
  }
  await writeClipboard(buildContent())
  message.success('文本已经成功复制到剪贴板')
}
</script>
