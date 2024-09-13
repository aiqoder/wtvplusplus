import { addTvs } from '@/api';
import { useSearch } from '@/store/search';
import { M3UObject } from '@/utils/file';
import { getStreamInfo } from '@/utils/util';

const pids: string[] = []

export function useCheck() {
  const search = useSearch()
  function createRequest(m3u8: M3UObject): Promise<{ width: number, height: number, speed: number, fps: number, codec: string }> {
    return new Promise((resolve, reject) => {
      const name = Math.random().toString(36).slice(2, 9) + new Date().toISOString()
      pids.push(name)

      const start = new Date().getTime()
      window.eUtils.execPorcess({
        root: "ffmpeg/ffmpeg",
        timeout: 8 * 1000,
        args: `-hide_banner -i ${m3u8.url}`,
        name,
      }).then(response => {
        const info = getStreamInfo(response.data, search.strict)
        const speed = new Date().getTime() - start
        if (info) {
          addTvs({ url: m3u8.url, name: m3u8.name, id: m3u8.id, width: info.width, height: info.height, speed: speed, fail: false })
          resolve({ ...info, speed })
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
