import { defineStore } from 'pinia';
export type UrlString = string
export const useOriginData = defineStore("origin-format", {
  state: () => ({
    originData: ref<string[]>([]),
    type: ref<"m3u" | "txt">()
  }),
  getters: {
    hasImport(state) {
      return computed(() => state.originData.length > 0)
    }
  },
  actions: {
    importTxt(txt: string, type: "m3u" | "txt") {
      if (type === "m3u") return // 暂时不支持m3u 格式
      this.$state.originData.push(...txt.split("\n"))
      console.log(this.$state.originData.length)
      this.$state.type = type
    },
    clear() {
      this.$state.originData.length = 0
    },
    // 过滤需要输出的URL ， dest 是列表检测剩余的文件
    diffAndRemove(target: UrlString[]) {
      const dist: string[] = []
      for (const line of this.$state.originData) {
        if (line.includes("http") || line.includes("rtmp") || line.includes("rtsp")) {
          if (!target.find(url => line.includes(url))) continue
          dist.push(line)
        } else {
          dist.push(line)
        }
      }
    }
  }
})