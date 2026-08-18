import { classifyChannels, getAISettings, upsertPlaylistChannel } from '@/api/native'
import type { M3UObject } from '@/utils/file'

export const AI_BATCH_SIZE = 25

function isEmptyGroup(group?: string) {
  return !String(group || '').replace(/\s/g, '')
}

function isNumericName(name: string) {
  return /^\d+$/.test(String(name || '').trim())
}

export type AIGroupProgress = {
  done: number
  total: number
  message: string
}

export type AIGroupResult = {
  updated: number
  cancelled: boolean
}

type GroupableItem = { name: string; url: string; group?: string }

type ClassifyOptions = {
  onProgress?: (p: AIGroupProgress) => void
  signal?: AbortSignal
}

/**
 * 导入时：若开启「覆盖已有分组」，清除文件自带分组信息（不做 AI）。
 */
export async function stripGroupsOnImport(items: M3UObject[]): Promise<M3UObject[]> {
  if (!items.length) return items
  let overwrite = true
  try {
    const settings = await getAISettings()
    overwrite = settings?.overwriteImportGroup !== false
  } catch {
    overwrite = true
  }
  if (!overwrite) return items
  for (const item of items) {
    item.group = ''
  }
  return items
}

async function ensureAPIKey() {
  const settings = await getAISettings()
  if (!settings?.apiKey) {
    throw new Error('请先在系统设置中配置 AI API Key')
  }
  return settings
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    const err = new Error('AI 分组已取消')
    err.name = 'AbortError'
    throw err
  }
}

async function classifyPendingItems(
  items: GroupableItem[],
  pendingIndexes: number[],
  pendingNames: string[],
  options?: ClassifyOptions,
): Promise<AIGroupResult> {
  const { onProgress, signal } = options || {}

  if (!pendingNames.length) {
    onProgress?.({ done: 0, total: 0, message: '没有需要 AI 分组的频道' })
    return { updated: 0, cancelled: false }
  }

  const total = pendingNames.length
  let updated = 0
  onProgress?.({ done: 0, total, message: `准备分组 0/${total}` })

  for (let start = 0; start < pendingNames.length; start += AI_BATCH_SIZE) {
    if (signal?.aborted) {
      onProgress?.({ done: start, total, message: `已取消 ${start}/${total}` })
      return { updated, cancelled: true }
    }

    const end = Math.min(start + AI_BATCH_SIZE, pendingNames.length)
    const batchNames = pendingNames.slice(start, end)
    const results = await classifyChannels(batchNames)

    for (const result of results || []) {
      const absolutePending = start + result.index
      const targetIndex = pendingIndexes[absolutePending]
      if (targetIndex == null) continue
      const item = items[targetIndex]
      if (!item) continue
      if (result.group) item.group = result.group
      if (result.displayName) item.name = result.displayName
      updated++
      const urls = String(item.url || '').split('#').filter(Boolean)
      for (const url of urls) {
        try {
          await upsertPlaylistChannel({
            name: item.name,
            url,
            group: item.group || '未知分组',
          })
        } catch {
          // 单条写入失败不中断整批
        }
      }
    }

    onProgress?.({
      done: end,
      total,
      message: `AI 分组中 ${end}/${total}`,
    })
  }

  if (signal?.aborted) {
    onProgress?.({ done: total, total, message: `已取消 ${total}/${total}` })
    return { updated, cancelled: true }
  }

  onProgress?.({
    done: total,
    total,
    message: `AI 分组完成 ${total}/${total}`,
  })
  return { updated, cancelled: false }
}

/**
 * 对检测成功的频道执行 AI 分组（导入时不调用）。
 * overwrite=true 时先清空成功项分组再分类；否则只处理空分组。
 */
export async function applyAIGroupToSuccess(
  items: M3UObject[],
  options?: {
    overwrite?: boolean
    onProgress?: (p: AIGroupProgress) => void
    signal?: AbortSignal
  },
): Promise<AIGroupResult> {
  if (!items.length) return { updated: 0, cancelled: false }

  let overwrite = true
  try {
    const settings = await ensureAPIKey()
    overwrite = options?.overwrite ?? settings?.overwriteImportGroup !== false
  } catch (err: any) {
    if (err?.message) throw err
    overwrite = options?.overwrite ?? true
  }

  throwIfAborted(options?.signal)

  const successItems = items.filter((item) => item.success === true)
  if (!successItems.length) {
    throw new Error('没有检测成功的频道可分组')
  }

  if (overwrite) {
    for (const item of successItems) {
      item.group = ''
    }
  }

  const pendingIndexes: number[] = []
  const pendingNames: string[] = []
  items.forEach((item, index) => {
    if (item.success !== true) return
    if (!isEmptyGroup(item.group) || isNumericName(item.name)) return
    pendingIndexes.push(index)
    pendingNames.push(item.name)
  })

  try {
    return await classifyPendingItems(items, pendingIndexes, pendingNames, options)
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      return { updated: 0, cancelled: true }
    }
    throw err
  }
}

/**
 * 对「未知分组」中的频道执行 AI 分组（播放页使用）。
 */
export async function applyAIGroupToUnknown(
  items: GroupableItem[],
  options?: {
    onProgress?: (p: AIGroupProgress) => void
    signal?: AbortSignal
  },
): Promise<AIGroupResult> {
  if (!items.length) return { updated: 0, cancelled: false }

  await ensureAPIKey()
  throwIfAborted(options?.signal)

  const pendingIndexes: number[] = []
  const pendingNames: string[] = []
  items.forEach((item, index) => {
    if (isNumericName(item.name)) return
    pendingIndexes.push(index)
    pendingNames.push(item.name)
  })

  try {
    return await classifyPendingItems(items, pendingIndexes, pendingNames, options)
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      return { updated: 0, cancelled: true }
    }
    throw err
  }
}
