<template>
    <div class="pd flex">
        <div style="width: 200px;">
            <n-collapse arrow-placement="right" accordion>
                <n-collapse-item :title="`====> 【${g}】 <====`" :name="g" v-for="(arr, g) in groups" :key="g">
                    <n-list hoverable clickable>
                        <n-list-item v-for="a in arr" @click="handlePlay(a)">{{ a.name }}</n-list-item>
                    </n-list>
                </n-collapse-item>
            </n-collapse>
        </div>
        <div class="flex-1 bg-black flex align-center">
            <VideoPlayer :url="currentUrl" :info="currentInfo"/>
        </div>
    </div>
</template>
<script setup lang="ts">
import { isUrl } from '@/utils/file';
import { getStreamInfo } from '@/utils/util';
import axios from 'axios';
import VideoPlayer from "./VideoPlayer.vue"

const baseUrl = localStorage.getItem("search-url")

type IGroup = {
    group: string;
    child: {
        name: string;
        url: string;
    }[]
}
const groups = ref<IGroup>()

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
    const url = a.url
    const urls = url.split("#")
    for (const u of urls) {
        // 排除空连接
        if(!u) continue
        const response = await window.eUtils.execPorcess({
            root: "ffmpeg/ffmpeg",
            timeout: 5 * 1000,
            args: `-hide_banner -i ${u}`,
        })

        const info = getStreamInfo(response.data)
        if (info) {
            currentUrl.value = u
            currentInfo.value = info
            break;
        }

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
</style>