import { addTvs } from '@/api'
import { M3UObject } from '@/utils/file';
import { cancelProbes, getVideoInfo, upsertPlaylistChannel, type RuleConfig } from '@/api/native';
import { buildRuleIndex, matchExactGroupsByIndex, type RuleIndex } from '@/utils/groupRuleSort';

export type CheckResult = {
  width: number
  height: number
  speed: number
  fps: number
  codec: string
  groups: string[]
}

function persistChannel(m3u8: M3UObject, group: string, info: Omit<CheckResult, 'groups'>) {
  void upsertPlaylistChannel({
    name: m3u8.name,
    url: m3u8.url,
    group: group || '未知分组',
    width: info.width,
    height: info.height,
    fps: info.fps,
    speed: info.speed,
    codec: info.codec,
  }).catch(() => {})
}

/** 一名多组：列表仍是一条，分组用逗号拼接；播放列表按组分别写入 */
export function applyExactGroups(
  item: M3UObject,
  groups: string[],
  info: Omit<CheckResult, 'groups'>,
) {
  const ordered = groups.map((g) => String(g || '').trim()).filter(Boolean)
  if (!ordered.length) {
    const fallback = String(item.group || '').trim() || '未知分组'
    item.group = fallback
    persistChannel(item, fallback, info)
    return
  }
  item.group = ordered.join(',')
  for (const group of ordered) {
    persistChannel(item, group, info)
  }
}

export function useCheck() {
  let stopped = false
  let currentRequest: any
  let ruleIndex: RuleIndex | null = null

  async function createRequest(m3u8: M3UObject): Promise<CheckResult> {
    if (stopped) throw new Error('检测已停止')
    const start = new Date().getTime()

    currentRequest = getVideoInfo(m3u8.url, 8 * 1000)
    try {
      const response = await currentRequest
      if (stopped) throw new Error('检测已停止')
        const stream = response.streams.find((item) => item.codecType === 'video' && item.width > 0 && item.height > 0)
        const info = stream ? {
          width: stream.width,
          height: stream.height,
          fps: stream.frameRate,
          codec: stream.codecName,
        } : undefined
        const speed = new Date().getTime() - start
        if (info) {
          addTvs({ url: m3u8.url, name: m3u8.name, id: m3u8.id, width: info.width, height: info.height, speed: speed, fail: false })
          return {
            ...info,
            speed,
            groups: matchExactGroupsByIndex(m3u8.name, ruleIndex),
          }
        } else {
          addTvs({ url: m3u8.url, name: m3u8.name, id: m3u8.id, fail: true })
          throw new Error('未发现视频流')
        }
    } finally {
      currentRequest = null
    }
  }

  function stopCheck() {
    stopped = true
    currentRequest?.cancel?.('检测已停止')
    void cancelProbes()
    currentRequest = null
  }

  function startCheck(rule?: RuleConfig | null) {
    stopped = false
    ruleIndex = rule ? buildRuleIndex(rule.groups) : null
  }

  return {
    createRequest,
    stopCheck,
    startCheck,
  }
}
