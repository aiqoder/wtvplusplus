<template>
    <video ref="videoRef" style="width:100%"></video>
</template>
<script lang="ts" setup>
import mpegts from 'mpegts.js';
import { getStreamURL, startPlayback, stopPlayback } from '@/api/native';

const videoRef = ref<HTMLVideoElement>()

const props = defineProps<{ url: string, info: any }>()
let playerInst: Mpegts.Player | null = null
let disposed = false
let session = 0

function destroyPlayer() {
    if (!playerInst) return
    try {
        playerInst.pause()
        playerInst.unload()
        playerInst.detachMediaElement()
        playerInst.destroy()
    } catch {
        // ignore teardown errors from mpegts
    }
    playerInst = null
}

async function attachPlayer(videoElement: HTMLVideoElement) {
    const streamURL = await getStreamURL()
    if (!mpegts.getFeatureList().mseLivePlayback) return
    destroyPlayer()
    const next = mpegts.createPlayer({
        type: 'mpegts',
        isLive: true,
        url: streamURL,
    })
    next.attachMediaElement(videoElement)
    next.load()
    next.play()
    playerInst = next
}

async function playUrl(url: string, currentSession: number) {
    await stopPlayback()
    if (disposed || currentSession !== session) return

    const el = videoRef.value
    if (!el) {
        await nextTick()
        if (disposed || currentSession !== session || !videoRef.value) return
    }

    await attachPlayer(videoRef.value!)
    if (disposed || currentSession !== session) {
        destroyPlayer()
        await stopPlayback()
        return
    }
    void startPlayback(url).catch(() => {})
}

watch(
    () => props.url,
    (url) => {
        if (!url) return
        const currentSession = ++session
        void playUrl(url, currentSession)
    },
    { immediate: true },
)

onUnmounted(() => {
    disposed = true
    session++
    destroyPlayer()
    void stopPlayback()
})
</script>
