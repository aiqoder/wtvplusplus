<template>
  <div class="rule-panel">
    <div class="toolbar">
      <n-input v-model:value="keyword" clearable size="small" placeholder="搜索分组或频道" class="search-input" />
      <n-button size="small" @click="addGroup">添加分组</n-button>
      <n-button size="small" quaternary @click="loadDefaults">重新载入默认</n-button>
      <n-button size="small" quaternary :disabled="!isCustom" @click="resetToDefault">恢复默认</n-button>
      <span class="count-tip">
        {{ displayGroups.length }} 个分组 · {{ totalChannels }} 条频道
        <span v-if="!isCustom" class="badge">内置默认</span>
        <span v-else class="badge custom">已自定义</span>
      </span>
      <n-button type="primary" size="small" :loading="saving" @click="save">保存</n-button>
    </div>

    <n-spin :show="loading" class="rule-spin">
      <n-empty v-if="displayGroups.length === 0" description="暂无分组，点击「添加分组」或「载入默认」" />
      <div v-else class="rule-layout">
        <aside class="group-nav">
          <button
            v-for="group in displayGroups"
            :key="group.id"
            type="button"
            class="group-nav-item"
            :class="{ active: activeGroupId === group.id }"
            @click="activeGroupId = group.id"
          >
            <span class="group-nav-name">{{ group.name.trim() || '未命名分组' }}</span>
            <span v-if="channelCount(group) > 0" class="group-nav-count">{{ channelCount(group) }}</span>
          </button>
        </aside>

        <main v-if="activeGroup" class="group-content">
          <div class="group-meta">
            <span class="field-label">分组名称</span>
            <n-input
              v-model:value="activeGroup.name"
              placeholder="如 央视频道"
              class="group-name-input"
            />
            <span class="channel-count">{{ channelCount(activeGroup) }} 个频道</span>
            <n-button text type="error" @click="removeGroup(activeGroup)">删除分组</n-button>
          </div>
          <div class="channel-editor">
            <span class="field-label">规范名称</span>
            <n-input
              v-model:value="activeGroup.channelsText"
              type="textarea"
              class="channel-textarea"
              placeholder="每行一个，例如：&#10;CCTV-1综合&#10;CCTV-2财经"
              spellcheck="false"
            />
          </div>
        </main>
      </div>
    </n-spin>
  </div>
</template>

<script lang="ts" setup>
import { message } from '@/utils/data'
import { getAIRule, getDefaultAIRule, hasCustomAIRule, resetAIRule, saveAIRule } from '@/api/native'
import {
  createGroupEdit,
  editsToGroups,
  groupsToEdits,
  parseChannelNames,
  type GroupEdit,
} from '@/utils/promptConfig'
import { useDialog } from 'naive-ui'

const dialog = useDialog()
const loading = ref(false)
const saving = ref(false)
const keyword = ref('')
const groups = ref<GroupEdit[]>([])
const activeGroupId = ref<number | null>(null)
const isCustom = ref(false)

const displayGroups = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return groups.value
  return groups.value.filter(
    (g) => g.name.toLowerCase().includes(kw) || g.channelsText.toLowerCase().includes(kw),
  )
})

const activeGroup = computed(() =>
  displayGroups.value.find((g) => g.id === activeGroupId.value) ?? null,
)

const totalChannels = computed(() =>
  groups.value.reduce((sum, g) => sum + channelCount(g), 0),
)

watch(displayGroups, (list) => {
  if (list.length === 0) {
    activeGroupId.value = null
    return
  }
  if (!list.some((g) => g.id === activeGroupId.value)) {
    activeGroupId.value = list[0].id
  }
})

onMounted(async () => {
  loading.value = true
  try {
    const [rule, custom] = await Promise.all([getAIRule(), hasCustomAIRule()])
    isCustom.value = !!custom
    groups.value = groupsToEdits(rule?.groups || [])
    if (groups.value.length) activeGroupId.value = groups.value[0].id
  } catch (err: any) {
    message.warning(err?.message || '加载规则失败')
  } finally {
    loading.value = false
  }
})

function channelCount(group: GroupEdit) {
  return parseChannelNames(group.channelsText).length
}

function addGroup() {
  const edit = createGroupEdit({ name: '', channels: [] })
  groups.value.push(edit)
  activeGroupId.value = edit.id
}

async function loadDefaults() {
  loading.value = true
  try {
    const rule = await getDefaultAIRule()
    groups.value = groupsToEdits(rule?.groups || [])
    activeGroupId.value = groups.value[0]?.id ?? null
    message.success('已载入内置默认对照表（需点击保存才会覆盖自定义）')
  } catch (err: any) {
    message.error(err?.message || '载入默认失败')
  } finally {
    loading.value = false
  }
}

async function resetToDefault() {
  loading.value = true
  try {
    await resetAIRule()
    const rule = await getAIRule()
    isCustom.value = false
    groups.value = groupsToEdits(rule?.groups || [])
    activeGroupId.value = groups.value[0]?.id ?? null
    message.success('已恢复为内置默认规则')
  } catch (err: any) {
    message.error(err?.message || '恢复失败')
  } finally {
    loading.value = false
  }
}

function removeGroup(group: GroupEdit) {
  const name = group.name.trim() || '未命名分组'
  const count = channelCount(group)
  dialog.warning({
    title: '确认删除分组',
    content: count > 0
      ? `确定删除分组「${name}」及其 ${count} 个频道吗？删除后需点击保存才会生效。`
      : `确定删除分组「${name}」吗？删除后需点击保存才会生效。`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: () => {
      groups.value = groups.value.filter((g) => g.id !== group.id)
    },
  })
}

async function save() {
  const payload = { groups: editsToGroups(groups.value) }
  if (payload.groups.length === 0) {
    message.warning('请至少保留一个分组和频道')
    return
  }
  saving.value = true
  try {
    await saveAIRule(payload)
    isCustom.value = true
    message.success('规则已保存')
  } catch (err: any) {
    message.error(err?.message || '保存失败')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.rule-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: calc(100vh - 110px);
  max-height: calc(100vh - 110px);
  min-height: 0;
  box-sizing: border-box;
}

.tip {
  margin-bottom: 0;
  flex-shrink: 0;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.rule-spin {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.rule-spin :deep(.n-spin-container),
.rule-spin :deep(.n-spin-content) {
  flex: 1;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.search-input {
  width: 200px;
}

.count-tip {
  color: #888;
  font-size: 13px;
  margin-right: auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.badge {
  font-size: 12px;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(138, 43, 226, 0.2);
  color: #c9a0ff;
}

.badge.custom {
  background: rgba(0, 193, 60, 0.15);
  color: #6dce8a;
}

.rule-layout {
  display: flex;
  gap: 12px;
  flex: 1;
  min-height: 0;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  overflow: hidden;
}

.group-nav {
  width: 200px;
  flex-shrink: 0;
  height: 100%;
  max-height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.15);
}

.group-nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-align: left;
}

.group-nav-item:hover,
.group-nav-item.active {
  background: rgba(138, 43, 226, 0.18);
}

.group-nav-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.group-nav-count {
  font-size: 12px;
  opacity: 0.7;
}

.group-content {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.group-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.group-name-input {
  width: 220px;
}

.channel-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.channel-textarea {
  flex: 1;
  min-height: 0;
  height: 100%;
}

.channel-textarea :deep(.n-input),
.channel-textarea :deep(.n-input-wrapper) {
  height: 100%;
}

.channel-textarea :deep(textarea) {
  height: 100% !important;
  max-height: 100% !important;
  resize: none;
  overflow-y: auto !important;
}

.field-label {
  font-size: 13px;
  opacity: 0.8;
  flex-shrink: 0;
}

.channel-count {
  font-size: 12px;
  color: #888;
}
</style>
