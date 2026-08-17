<template>
  <div class="settings-page">
    <n-tabs type="line" animated>
      <n-tab-pane name="general" tab="通用设置">
        <n-form label-placement="left" label-width="140" class="settings-form">
          <n-form-item label="覆盖已有分组">
            <div class="switch-row">
              <n-switch v-model:value="form.overwriteImportGroup" @update:value="handleOverwriteChange" />
              <span class="hint">开启后：导入时清除文件自带分组；AI分组时覆盖已有分组（默认开启）</span>
            </div>
          </n-form-item>
        </n-form>
      </n-tab-pane>

      <n-tab-pane name="ai" tab="AI设置">
        <n-form label-placement="left" label-width="140" class="settings-form">
          <n-form-item label="API Base URL">
            <n-input
              v-model:value="form.baseUrl"
              placeholder="API Base URL，如 https://api.deepseek.com/v1"
              @blur="fetchModels"
            />
          </n-form-item>
          <n-form-item label="API Key">
            <n-input
              v-model:value="form.apiKey"
              type="password"
              show-password-on="click"
              placeholder="sk-..."
              @blur="fetchModels"
            />
          </n-form-item>
          <n-form-item label="模型">
            <div class="model-row">
              <n-select
                v-model:value="form.model"
                filterable
                tag
                clearable
                :loading="modelsLoading"
                :options="modelOptions"
                placeholder="选择或输入模型名称"
              />
              <n-button :loading="modelsLoading" @click="fetchModels">刷新</n-button>
            </div>
          </n-form-item>
          <n-form-item>
            <n-button type="primary" :loading="saving" @click="handleSave">保存</n-button>
          </n-form-item>
        </n-form>
      </n-tab-pane>

      <n-tab-pane name="rule" tab="AI规则">
        <RulePanel />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script lang="ts" setup>
import { message } from '@/utils/data'
import { useAppSettings } from '@/store/appSettings'
import { listAIModels } from '@/api/native'
import RulePanel from './RulePanel.vue'

defineOptions({ name: 'settings' })

const appSettings = useAppSettings()
const form = reactive({
  baseUrl: 'https://api.deepseek.com/v1',
  apiKey: '',
  model: 'gpt-4o-mini',
  overwriteImportGroup: true,
})
const saving = ref(false)
const modelsLoading = ref(false)
const modelOptions = ref<{ label: string; value: string }[]>([])

onMounted(async () => {
  await appSettings.load()
  Object.assign(form, appSettings.settings)
  if (form.apiKey) {
    void fetchModels()
  }
})

async function fetchModels() {
  if (!form.apiKey) {
    modelOptions.value = []
    return
  }
  modelsLoading.value = true
  try {
    const models = await listAIModels(form.baseUrl, form.apiKey)
    modelOptions.value = (models || []).map((m) => ({ label: m, value: m }))
    if (form.model && !modelOptions.value.some((o) => o.value === form.model)) {
      modelOptions.value.unshift({ label: form.model, value: form.model })
    }
  } catch (err: any) {
    message.warning(err?.message || '获取模型列表失败')
  } finally {
    modelsLoading.value = false
  }
}

async function handleOverwriteChange(value: boolean) {
  form.overwriteImportGroup = value
  try {
    await appSettings.save({ ...form })
  } catch (err: any) {
    message.error(err?.message || '保存失败')
  }
}

async function handleSave() {
  saving.value = true
  try {
    await appSettings.save({ ...form })
    message.success('设置已保存')
  } catch (err: any) {
    message.error(err?.message || '保存失败')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.settings-page {
  padding: 16px 20px;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.settings-page :deep(.n-tabs) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.settings-page :deep(.n-tabs-nav) {
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--n-color);
}

.settings-page :deep(.n-tabs-pane-wrapper) {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.settings-page :deep(.n-tab-pane) {
  padding-bottom: 24px;
}

.settings-form {
  max-width: 720px;
  margin-top: 8px;
}

.model-row {
  display: flex;
  gap: 8px;
  width: 100%;
}

.model-row :deep(.n-select) {
  flex: 1;
}

.switch-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hint {
  color: #888;
  font-size: 13px;
}
</style>
