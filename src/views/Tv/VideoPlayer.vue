<template>
    <video ref="videoRef" style="width:100%"></video>
</template>
<script lang="ts" setup>
import { getStreamFFmpegArgs } from '@/utils/util';
import mpegts from 'mpegts.js';

let name = Math.random().toString(16).slice(2)

const videoRef = ref()

const props = defineProps<{ url: string, info: any }>()

async function player(videoElement: Ref<HTMLVideoElement>) {
    const port = await window.eUtils.getStore("wsport")

    if (mpegts.getFeatureList().mseLivePlayback) {
        const player = mpegts.createPlayer({
            type: 'mse',  // could also be mpegts, m2ts, flv
            isLive: true,
            url: `ws://127.0.0.1:${port}`,
        });
        player.attachMediaElement(unref(videoElement));
        player.load();
        player.play();
    }
}

// 监听URL进行拉流
watch(() => props.url, (url, oldUrl) => {
    if (!url) return

    // URL 替换之后先关闭旧的通道
    if (url != oldUrl) {
        window.eUtils.closePorcess(name)
    }

    name = Math.random().toString(16).slice(2)
    window.eUtils.execPorcess({
        root: "ffmpeg/ffmpeg",
        timeout: 60 * 1000 * 60 * 24,
        args: getStreamFFmpegArgs(url as string, props.info.codec || "H264").join(" "),
        name,
    })
    player(unref(videoRef))
})

onUnmounted(() => {
    window.eUtils.closePorcess(name)
})
</script>