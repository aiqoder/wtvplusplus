import { defineStore } from "pinia";
import mpegts from "mpegts.js"
import { useToggle } from "@vueuse/core";
import { getStreamFFmpegArgs, getStreamInfo } from "@/utils/util";

export const useVideo = defineStore("palyer-video", () => {
    const [visible, toggle] = useToggle()
    const url = ref()
    const name = Math.random().toString(16).slice(2)
    async function player(videoElement: Ref<HTMLVideoElement>) {
        if (!url.value) return
        const port = await window.eUtils.getStore("wsport")
        window.eUtils.execPorcess({
            root: "ffmpeg/ffmpeg",
            timeout: 60 * 1000 * 60 * 24,
            args: getStreamFFmpegArgs(url.value as string).join(" "),
            name,
        })

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

    watchEffect(()=>{
        if(!visible.value) {
            window.eUtils.closePorcess(name)
        }
    })

    return {
        player,
        visible,
        toggle,
        url,
    }
})