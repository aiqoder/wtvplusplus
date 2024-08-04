import { addTvs } from '@/api';
import { M3UObject } from '@/utils/file';
import { getStreamInfo } from '@/utils/util';

const pids: string[] = []

export function useCheck() {
  function createRequest(m3u8: M3UObject): Promise<{ width: number, height: number, speed: number, fps: number, codec: string }> {
    return new Promise((resolve, reject) => {
      const name = Math.random().toString(36).slice(2, 9) + new Date().toISOString()
      pids.push(name)

      const start = new Date().getTime()
      window.eUtils.execPorcess({
        root: "ffmpeg/ffmpeg",
        timeout: 30 * 1000,
        args: `-hide_banner -i ${m3u8.url}`,
        name,
      }).then(response => {
        const info = getStreamInfo(response.data)
        if (info) {
          addTvs({ url: m3u8.url, name: m3u8.name, id: m3u8.id, fail: false })
          resolve({ ...info, speed: new Date().getTime() - start })
        } else {
          addTvs({ url: m3u8.url, name: m3u8.name, id: m3u8.id, fail: true })
          reject()
        }
      }).catch(reject)
    })
  }

  function stopCheck() {
    pids.forEach(pid => {
      window.eUtils.closePorcess(pid)
    });
    pids.length = 0
  }

  return {
    createRequest,
    stopCheck
  }
}
