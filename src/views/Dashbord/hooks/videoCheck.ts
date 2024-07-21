import { addTvs, CitySn } from '@/api';
import { isAudio, isVideo } from '@/utils/check';
import axios, { CancelTokenSource } from 'axios';
import { useSpeed } from '@/store/checkSpeed';
import { useWebSocket } from '@vueuse/core';
import { isJSON } from '../../../utils/data';
import { useCommon } from '../../../store/common';
import { M3UObject } from '@/utils/file';

const updateCheckUrl = `${import.meta.env.VITE_LIVE_WSBASE}/api/v1/check/updateWs?user=czpro`
const axiosSources: CancelTokenSource[] = []
const isDev = process.env.NODE_ENV === 'development'

export function useAxiosCheck() {
  const common = useCommon()
  const { send } = useWebSocket(updateCheckUrl, { autoReconnect: true, })

  // 发送检测结果到服务器
  function sendResultToServer(id: number, valid = false) {
    send(JSON.stringify({
      id, // 电视节目ID
      valid,
      ...CitySn
    }));
  }


  const check = useSpeed()
  function createRequest(m3u8: M3UObject): Promise<{ speed: string }> {
    const startDataTime = new Date().getTime()
    return new Promise((resolve, reject) => {
      // 如果是ipv6的地址且不支持ipv6直接跳过检查
      if (/^https?:\/\/\[/.test(m3u8.url)) {
        reject()
        return
      }

      const { url } = m3u8
      let axiosSource = axios.CancelToken.source();
      axiosSources.push(axiosSource);
      axios.request({
        url,
        cancelToken: axiosSource.token,
        method: url.indexOf(".m3u8") > -1 ? "GET" : "HEAD",
        headers: {
          "Cache-Control": "no-cache",
        },
        timeout: check.timeout * 1000, // 超时5s认为失败
        responseType: 'text'
      }).then((response) => {
        // 视频资源 
        if (isVideo(response.headers)) {
          if (!m3u8.id) addTvs(m3u8);
          resolve({
            speed: (new Date().getTime() - startDataTime) + ""
          })
        } else if (isAudio(response.headers)) {// 音频资源
          resolve({
            speed: (new Date().getTime() - startDataTime) + ""
          })
        } else {
          reject()
        }
      }).catch((err) => {
        // 尽在超时时间大于2s存储
        if (CitySn.city && m3u8.id && check.timeout >= 2 && !isDev) {
          sendResultToServer(m3u8.id)
        }
        reject()
      })
    })
  }

  function stopCheck() {
    axiosSources.forEach((axiosSource) => {
      axiosSource.cancel();
    });
    axiosSources.length = 0;
  }

  return {
    createRequest,
    stopCheck
  }
}

export function useFfmpegCheck() {
  const { send } = useWebSocket(updateCheckUrl, { autoReconnect: true, })

  // 发送检测结果到服务器
  function sendResultToServer(id: number, valid = false) {
    if (!id) return
    send(JSON.stringify({
      id, // 电视节目ID
      valid,
      ...CitySn
    }));
  }

  const common = useCommon()
  const check = useSpeed()
  const pids: string[] = []
  function createRequest(m3u8: M3UObject): Promise<{ speed: string, ratio: string }> {
    const startDataTime = new Date().getTime()
    const name = Math.random().toString(36).slice(2, 9) + new Date().toISOString()
    pids.push(name)

    return new Promise((resolve, reject) => {
      // 如果是ipv6的地址且不支持ipv6直接跳过检查
      if (/^https?:\/\/\[/.test(m3u8.url)) {
        reject()
        return
      }

      window.eUtils.execPorcess({
        root: "ffmpeg/ffprobe",
        timeout: check.timeout * 1000,
        args: `-select_streams v -show_format -show_streams -v quiet -of json -i ${m3u8.url}`,
        name,
      }).then((response) => {
        if (!isJSON(response.data)) {
          sendResultToServer(m3u8.id || 0)
          reject()
          return
        }
        const record = JSON.parse(response.data)["streams"] || []
        if (record.length === 0) {
          if (CitySn.city && m3u8.id && !isDev) {
            sendResultToServer(m3u8.id || 0)
          }
          reject()
          return
        }

        // 编码名称codec_name
        // 像素格式 pix_fmt
        // 平均帧率 avg_frame_rate
        const { width, height, avg_frame_rate, codec_name, pix_fmt } = record[0] || {}
        resolve({
          speed: (new Date().getTime() - startDataTime) + "",
          ratio: width ? `${width}x${height}` : '未知',
          //@ts-ignore
          avg_frame_rate, codec_name, pix_fmt
        })
        if (!m3u8.id) addTvs(m3u8);
      }).catch((err) => {
        if (CitySn.city && m3u8.id && check.timeout >= 2 && !isDev) {
          sendResultToServer(m3u8.id || 0)
        }
        reject()
      })
    })
  }

  function stopCheck() {
    pids.forEach(pid => {
      window.eUtils.closePorcess(pid)
    });

  }

  return {
    createRequest,
    stopCheck
  }
}
