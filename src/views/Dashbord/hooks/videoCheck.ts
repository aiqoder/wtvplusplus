import { addTvs } from '@/api';
import { useSearch } from '@/store/search';
import { M3UObject } from '@/utils/file';
import { getStreamInfo } from '@/utils/util';

const pids: string[] = []
let port = 9106
export function useCheck() {
  const search = useSearch()
  function createRequest(m3u8: M3UObject): Promise<{ width: number, height: number, speed: number, fps: number, codec: string }> {
    return new Promise(async (resolve, reject) => {
      const name = Math.random().toString(36).slice(2, 9) + new Date().toISOString()
      pids.push(name)

      const start = new Date().getTime()

      // 原力链接检测
      // const lowUrl = m3u8.url.toLocaleLowerCase()
      // let isForceTv = false
      // let forceTvUrl = ""
      // if (lowUrl.startsWith("p2p://") || lowUrl.startsWith("p8p://") || lowUrl.startsWith("mitv://")) {
      //   const sp = lowUrl.split("/")
      //   const server = sp[2]
      //   const channel = sp[3]
      //   await window.eUtils.execPorcess({
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

      window.eUtils.execPorcess({
        root: "ffmpeg/ffmpeg",
        timeout: 8 * 1000,
        args: `-hide_banner -i ${m3u8.url}`,
        name,
      }).then(response => {
        console.log(response.data)
        const info = getStreamInfo(response.data, search.strict)
        const speed = new Date().getTime() - start
        if (info) {
          addTvs({ url: m3u8.url, name: m3u8.name, id: m3u8.id, width: info.width, height: info.height, speed: speed, fail: false })
          resolve({ ...info, speed })
        } else {
          addTvs({ url: m3u8.url, name: m3u8.name, id: m3u8.id, fail: true })
          reject()
        }
      })
        .catch(reject)
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
