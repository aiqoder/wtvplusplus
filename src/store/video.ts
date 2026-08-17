import { defineStore } from "pinia";
import mpegts from "mpegts.js"
import { useToggle } from "@vueuse/core";
import { getStreamURL, startPlayback, stopPlayback } from "@/api/native";

export const useVideo = defineStore("palyer-video", () => {
    const [visible, toggle] = useToggle()
    const url = ref()
    const name = Math.random().toString(16).slice(2)
    async function player(videoElement: Ref<HTMLVideoElement>) {
        if (!url.value) return
        const streamURL = await getStreamURL()
        startPlayback(url.value as string)

        if (mpegts.getFeatureList().mseLivePlayback) {
            const player = mpegts.createPlayer({
                type: 'mse',  // could also be mpegts, m2ts, flv
                isLive: true,
                url: streamURL,
            });
            player.attachMediaElement(unref(videoElement));
            player.load();
            player.play();
        }
    }

    watchEffect(()=>{
        if(!visible.value) {
            stopPlayback()
        }
    })

    return {
        player,
        visible,
        toggle,
        url,
    }
})
