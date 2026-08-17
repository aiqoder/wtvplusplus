import { addTvs } from '@/api';
import { M3UObject } from '@/utils/file';
import { cancelProbes, getVideoInfo, upsertPlaylistChannel } from '@/api/native';

export function useCheck() {
  let stopped = false
  let currentRequest: any
  async function createRequest(m3u8: M3UObject): Promise<{ width: number, height: number, speed: number, fps: number, codec: string }> {
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
          // 检测成功写入本地播放列表
          void upsertPlaylistChannel({
            name: m3u8.name,
            url: m3u8.url,
            group: m3u8.group || '未知分组',
            width: info.width,
            height: info.height,
            fps: info.fps,
            speed,
            codec: info.codec,
          }).catch(() => {})
          return { ...info, speed }
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

  function startCheck() {
    stopped = false
  }

  return {
    createRequest,
    stopCheck,
    startCheck,
  }
}
