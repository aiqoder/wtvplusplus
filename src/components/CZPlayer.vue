<template>
    <video ref="videoRef" style="width:100%"></video>
</template>
<script lang="ts" setup>
import { useVideo } from '@/store/video';

const videoRef = ref()
const video = useVideo()
onMounted(() => {
    video.player(unref(videoRef))
})
</script>