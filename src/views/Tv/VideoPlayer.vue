<template>
    <video ref="videoRef" style="width:100%"></video>
</template>
<script lang="ts" setup>
import { getStreamFFmpegArgs } from '@/utils/util';
import Mpegts from 'mpegts.js';
import mpegts from 'mpegts.js';

let name = Math.random().toString(16).slice(2)

const videoRef = ref()

const props = defineProps<{ url: string, info: any }>()
let p: Mpegts.Player;
async function player(videoElement: Ref<HTMLVideoElement>) {
    // if(p) {
    //     p.detachMediaElement()
    //     p.destroy()
    // }
    const port = await window.eUtils.getStore("wsport")
    if (mpegts.getFeatureList().mseLivePlayback) {
        p = mpegts.createPlayer({
            type: 'mse',  // could also be mpegts, m2ts, flv
            isLive: true,
            url: `ws://127.0.0.1:${port}`,
        });
        p.attachMediaElement(unref(videoElement));
        p.load();
        p.play();
    }
}

// 监听URL进行拉流
watch(() => props.url, (url) => {
    if (!url) return
    window.eUtils.closePorcess(name)
    name = Math.random().toString(16).slice(2)

    window.eUtils.execPorcess({
        root: "ffmpeg/ffmpeg",
        timeout: 60 * 1000 * 60 * 24,
        args: getStreamFFmpegArgs(url as string, props.info?.codec).join(" "),
        name,
    })
    if (!videoRef.value) {
        nextTick(() => {
            player(unref(videoRef))
        })
        return
    }
    player(unref(videoRef))
},
    {
        immediate: true,
    })

onUnmounted(() => {
    window.eUtils.closePorcess(name)
})
</script>