<template>
  <n-button class="w-100" style="width: 200px" color="#8a2be2" ghost @click="changeFile">
    <template #icon>
      <n-icon>
        <VideocamOutlineIcon />
      </n-icon>
    </template>
    选择m3u/txt
  </n-button>
  <n-button
    class="w-100 mt-16"
    style="width: 200px"
    color="#8a2be2"
    @click="$emit('check')"
    v-if="!process"
    :disabled="!isImport"
  >
    <template #icon>
      <n-icon>
        <CaretBackCircleOutlineIcon />
      </n-icon>
    </template>
    开始检测
  </n-button>
  <n-button
    class="w-100 mt-16"
    style="width: 200px"
    color="#8a2be2"
    @click="$emit('cancel')"
    v-if="process"
  >
    <template #icon>
      <n-icon>
        <RemoveCircleOutlineIcon />
      </n-icon>
    </template>
    停止检测
  </n-button>
  <n-button
    class="w-100 mt-16"
    style="width: 200px"
    color="#ff69b4"
    @click="$emit('export', '')"
  >
    <template #icon>
      <n-icon>
        <ArrowUndoCircleSharpIcon />
      </n-icon>
    </template>
    导出
  </n-button>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import SingleUpload from "@/components/SingleUpload.vue";
import {
  VideocamOutline as VideocamOutlineIcon,
  DocumentText as DocumentTextIcon,
  CaretBackCircleOutline as CaretBackCircleOutlineIcon,
  ArrowUndoCircleSharp as ArrowUndoCircleSharpIcon,
  RemoveCircleOutline as RemoveCircleOutlineIcon,
  ShieldCheckmarkOutline as ShieldCheckmarkOutlineIcon,
} from "@vicons/ionicons5";
import { readerHandleTxt } from "@/utils/file";
import appName from "@/utils/appName";
import { readerHandleM3u } from '../../../utils/file';
import { useOriginData } from "@/store/originFormatData";
export default defineComponent({
  props: {
    process: {
      default: false, //是否已经开始
      type: Boolean,
    },
    isImport: {
      //是否已导入文件
      default: false,
      type: Boolean,
    },
  },
  emits: {
    getM3u: null,
    check: null,
    cancel: null,
    exportM3u: null,
    export: null,
  },
  components: {
    SingleUpload,
    VideocamOutlineIcon,
    DocumentTextIcon,
    CaretBackCircleOutlineIcon,
    ArrowUndoCircleSharpIcon,
    RemoveCircleOutlineIcon,
    ShieldCheckmarkOutlineIcon,
  },
  setup(props, { emit }) {
    const { importTxt, hasImport } = useOriginData()
    const accept = ".m3u,.m3u8,.txt";

    // 本地文件导入逻辑
    function changeFile() {
      window.eApi.readFileDialogAsText(appName).then(res=>{
        const { path, data } = res
        const suffix = path.slice(path.lastIndexOf("."), path.length);
        if (suffix.indexOf("m3u") > -1) {
          emit("getM3u", readerHandleM3u(data), "local");
          importTxt(data, "m3u")
        } else {
          emit("getM3u", readerHandleTxt(data), "local");
          importTxt(data, "txt")
        }
      })
    }

    return {
      changeFile,
      accept,
      hasImport,
    };
  },
});
</script>
<style lang="scss" scoped>
.mt-16 {
  margin-top: 16px;
}

.btn-fixed {
  position: fixed;
  bottom: 10px;
}
</style>
