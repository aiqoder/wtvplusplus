<template>
    <div class="pd flex">
        <div style="width: 200px;overflow: auto;">
            <n-collapse arrow-placement="right" accordion>
                <n-collapse-item :title="`【${g}】`" :name="g" v-for="(arr, g) in groups" :key="g">
                    <n-list hoverable clickable>
                        <n-list-item v-for="a in arr" @click="handlePlay(a)"
                            :class="{ 'color': currentName == a.name }">{{ a.name }}</n-list-item>
                    </n-list>
                </n-collapse-item>
            </n-collapse>
        </div>
        <div class="flex-1 bg-black flex flex-col justify-center items-center overflow-hidden">
            <span style="color: aliceblue" v-if="msg">{{ msg }} {{ currentInfo }}</span>
            <VideoPlayer :url="currentUrl" :info="currentInfo"  />
        </div>
    </div>
</template>
<script setup lang="ts">
import { isUrl } from '@/utils/file';
import { getStreamInfo } from '@/utils/util';
import axios from 'axios';
import VideoPlayer from "./VideoPlayer.vue"

const baseUrl = localStorage.getItem("search-url")
const msg = ref("")
type IGroup = {
    group: string;
    child: {
        name: string;
        url: string;
    }[]
}
const groups = ref<IGroup>()
const currentName = ref()

onMounted(() => {
    axios.get(`${baseUrl}/v1/tv/super`).then(res => {
        const manifest = res.data || ""

        const xgroup: any = {}

        const results = manifest?.split("\n") || [];
        let lastGroup: undefined | string = undefined // 用于记录导入的节目分组内容

        for (const item of results) {
            // 检查分组内容，并设置最后一次的分组名称
            if (item.trim().endsWith("#genre#")) {
                lastGroup = item.trim().split(",")[0]
                if (lastGroup && !xgroup[lastGroup]) xgroup[lastGroup] = []
            }
            const [name, url] = item.replaceAll("\r", "").split(",");
            if (!name || !url) continue;

            if (isUrl(url) && lastGroup) {
                xgroup[lastGroup].push({ name: name, url: url })
            }
        }

        groups.value = xgroup
    })
})


const currentUrl = ref()
const currentInfo = ref({})

async function handlePlay(a) {
    currentName.value = a.name
    const url = a.url
    const urls = url.split("#")
    msg.value = `发现${urls.length}个链接，正在尝试解析...`

    for (const [index, u] of urls.entries()) {
        // 排除空连接
        if (!u) continue
        const response = await window.eUtils.execPorcess({
            root: "ffmpeg/ffmpeg",
            timeout: 5 * 1000,
            args: `-hide_banner -i ${u}`,
        })
        const info = getStreamInfo(response.data)
        msg.value = `正在解析第${index + 1}视频，链接：${u}，正在尝试获取流信息...`
        if (info) {
            msg.value = "解析完成，正在尝试获取流信息..."
            currentUrl.value = u
            currentInfo.value = info
            setTimeout(() => {
                msg.value = ""
            }, 1000)
            break;
        }
        msg.value = `链接：${u} 解析失败，正在尝试获取下一个链接...`

        if (index === urls.length - 1) {
            msg.value = `没有找到可用的视频，请尝试别的链接`
        }
    }

    if (!currentUrl.value) {
        msg.value = `没有找到合适的链接，请尝试别的链接`
    }
}
</script>
<style lang="scss" scoped>
.pd {
    padding: 0.5rem;
    height: calc(100vh - 20px);
}

.flex {
    display: flex;
}

.flex-1 {
    flex-grow: 1;
    width: 0;
}

.align-center {
    align-items: center;
}

.bg-black {
    background-color: black;
    min-height: 100%;
}

.color {
    color: #8a2be2;
    font-weight: 600
}

:global(.n-collapse-item__header-main) {
    justify-content: space-between;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
}
</style>