<template>
    <video ref="videoRef" style="width:100%"></video>
</template>
<script lang="ts" setup>
import mpegts from 'mpegts.js';
import { getStreamURL, startPlayback, stopPlayback } from '@/api/native';

let name = Math.random().toString(16).slice(2)

const videoRef = ref()

const props = defineProps<{ url: string, info: any }>()
let p: Mpegts.Player;
async function player(videoElement: Ref<HTMLVideoElement>) {
    // if(p) {
    //     p.detachMediaElement()
    //     p.destroy()
    // }
    const streamURL = await getStreamURL()
    if (mpegts.getFeatureList().mseLivePlayback) {
        p = mpegts.createPlayer({
            type: 'mpegts',
            isLive: true,
            url: streamURL,
        });
        p.attachMediaElement(unref(videoElement));
        p.load();
        p.play();
    }
}

// 监听URL进行拉流
watch(() => props.url, async (url) => {
    if (!url) return
    await stopPlayback()
    name = Math.random().toString(16).slice(2)

    if (!videoRef.value) {
        nextTick(async () => {
            await player(unref(videoRef))
            void startPlayback(url as string)
        })
        return
    }
    await player(unref(videoRef))
    void startPlayback(url as string)
},
    {
        immediate: true,
    })

onUnmounted(() => {
    stopPlayback()
})
</script>
