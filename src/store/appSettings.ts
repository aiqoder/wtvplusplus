import { defineStore } from 'pinia'
import { getAISettings, saveAISettings, type AISettings } from '@/api/native'

const defaultSettings: AISettings = {
  baseUrl: 'https://api.deepseek.com/v1',
  apiKey: '',
  model: 'gpt-4o-mini',
  overwriteImportGroup: true,
}

export const useAppSettings = defineStore('appSettings', () => {
  const settings = reactive<AISettings>({ ...defaultSettings })
  const loaded = ref(false)
  const loading = ref(false)

  async function load() {
    loading.value = true
    try {
      const data = await getAISettings()
      Object.assign(settings, {
        ...defaultSettings,
        ...data,
        overwriteImportGroup: data?.overwriteImportGroup !== false,
      })
      loaded.value = true
    } catch {
      Object.assign(settings, { ...defaultSettings })
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  async function save(next?: Partial<AISettings>) {
    if (next) Object.assign(settings, next)
    await saveAISettings({
      baseUrl: settings.baseUrl,
      apiKey: settings.apiKey,
      model: settings.model,
      overwriteImportGroup: settings.overwriteImportGroup,
    })
  }

  async function ensureLoaded() {
    if (!loaded.value) await load()
  }

  return {
    settings,
    loaded,
    loading,
    load,
    save,
    ensureLoaded,
  }
})
