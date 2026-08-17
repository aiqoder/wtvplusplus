import { addTvs } from '@/api';
import { M3UObject } from '@/utils/file';
import { cancelProbes, getVideoInfo } from '@/api/native';

let port = 9106
export function useCheck() {
  let stopped = false
  let currentRequest: any
  async function createRequest(m3u8: M3UObject): Promise<{ width: number, height: number, speed: number, fps: number, codec: string }> {
    if (stopped) throw new Error('检测已停止')
    const start = new Date().getTime()

      // 原力链接检测
      // const lowUrl = m3u8.url.toLocaleLowerCase()
      // let isForceTv = false
      // let forceTvUrl = ""
      // if (lowUrl.startsWith("p2p://") || lowUrl.startsWith("p8p://") || lowUrl.startsWith("mitv://")) {
      //   const sp = lowUrl.split("/")
      //   const server = sp[2]
      //   const channel = sp[3]
      //   await forceTvService({
      //     root: "forcetv/forcetv.exe",
      //     timeout: 10 * 1000,
      //     args: `-s ${server} -c ${channel} -o ${port}`,
      //     name: `forcetv-${name}`,
      //   })
      //   forceTvUrl = `http://127.0.0.1:9906/${channel}.ts`
      //   isForceTv = true
      //   port++
      //   if (port > 9900) port = 9106
      // }

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
