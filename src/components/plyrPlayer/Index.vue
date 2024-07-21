<template>
  <video
    id="player"
    class="video-js vjs-default-skin vjs-big-play-centered vjs-16-9"
    preload="auto"
    poster=""
  ></video>
</template>
<script lang="ts">
import { defineComponent, onMounted, onUnmounted, watch } from "vue";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import zhCN from "video.js/dist/lang/zh-CN.json"
import { useMessage } from "naive-ui";
//@ts-ignore
import wxgzh from "@/assets/wxgzh.png"

videojs.addLanguage("zh-CN", zhCN)
export default defineComponent({
  props: {
    url: {
      default: "https://cdn.plyr.io/static/blank.mp4",
      type: String,
    },
  },
  setup(props) {
    let player: any;
    onMounted(() => {
      player = videojs("player", {
        autoplay: true,
        controls: true,
        poster: wxgzh,
        bigPlayButton: false,
        language: 'zh-CN',
      });

      if(props.url) {
          player.src(props.url);
      }

      player.ready(()=>{
        player.on("loadstart",function(){
          console.log("开始请求数据 ");
        })

        player.on("error",()=>{
          // message.error("视频出错...")
        })

        player.on("stalled",function(){
          console.log("网速异常");
        })    
      })
    });

    watch(
      () => props.url,
      () => {
        player.src(props.url);
      }
    );

    onUnmounted(() => {
      player.dispose();
    });
  },
});
</script>
