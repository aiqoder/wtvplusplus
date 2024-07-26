<template>
  <div @dragenter="enterDrop" @dragover.prevent class="drop-wrapper">
    <slot></slot>
  </div>
  <!-- 上传逻辑 -->
  <div
    class="drap-area"
    v-if="dropVisible"
    @drop="dropFile"
    @mouseup="leaveDrop"
    @mouseout="leaveDrop"
    @dragover.prevent
  >
    <div>
      <CloudUpload style="width: 200px" />
      <div style="text-align: center; font-size: 24px">上传文件到检测列表</div>
    </div>
  </div>
</template>
<script lang="ts">
import { readerHandleM3u, readerHandleTxt } from "@/utils/file";
import { useNotification } from "naive-ui";
import { CloudUpload } from "@vicons/ionicons5";
import { defineComponent, ref } from "vue";
import { useOriginData } from "@/store/originFormatData";


export default defineComponent({
  components: {
    CloudUpload,
  },
  emits:{
    getM3u: null
  },
  setup(props, { emit }) {
    const accept = ".m3u,.m3u8,.txt";
    const notification = useNotification();
    const { importTxt } = useOriginData()
    const dropVisible = ref(false);

    // 本地文件导入逻辑
    function changeFile(file: File) {
      const suffix = file.name.slice(file.name.indexOf("."), file.name.length);

      if (accept.indexOf(suffix) > -1) {
        window.eApi.readFileAsText(file.path).then(data=>{
          if (suffix.indexOf("m3u") > -1) {
            emit("getM3u", readerHandleM3u(data), "local");
            importTxt(data, "m3u")
          } else {
            emit("getM3u", readerHandleTxt(data), "local");
            importTxt(data, "txt")
          }
        })
      } else {
        notification.error({
          title: "提示",
          content: `导入失败！！！！！，不支持${suffix}文件格式`,
          duration: 2000,
        });
      }
    }

    function enterDrop(e: DragEvent) {
      dropVisible.value = true;
    }

    // 上传文件逻辑
    function dropFile(e: DragEvent) {
      dropVisible.value = false;
      const files = e.dataTransfer?.files;
      if (files) {
        changeFile(files[0]);
      }
    }

    function leaveDrop() {
      dropVisible.value = false;
    }

    return {
      enterDrop,
      leaveDrop,
      dropFile,
      dropVisible,
    };
  },
});
</script>
<style lang="scss" scoped>
.drop-wrapper {
  min-height: calc(100% - 35px);
  padding: 16px 24px;
}

.drap-area {
  position: absolute;
  top: 0;
  left: 80px;
  bottom: 0;
  right: 0;
  background-image: linear-gradient(to top, #8c36e070 2%, #0000 70%);
  z-index: 100;
  display: flex;
  justify-content: center;
  padding-top: 30%;
}
</style>
