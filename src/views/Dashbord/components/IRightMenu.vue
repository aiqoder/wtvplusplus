<template>
  <div>
    <context-menu name="context-menu-1">
      <div class="top-menu">
        <ClipImport title="剪贴板导入" @click="clipboardTextImport" />
        <Rename title="修改名称" @click="rename"></Rename>
      </div>
      <context-menu-item @click="clearList">
        <span class="line-check"></span>
        <span class="line-text">清空列表</span>
      </context-menu-item>
      <context-menu-item @click="clearInvalid" v-if="speed.isHandleClear">
        <span class="line-check"></span>
        <span class="line-text">清空无效源</span>
      </context-menu-item>
      <context-menu-item @click="speedOrder">
        <span class="line-check"></span>
        <span class="line-text">响应优先</span>
      </context-menu-item>
      <context-menu-item @click="loadSelfGroup">
        <span class="line-check"></span>
        <span class="line-text">载入自定义分组</span>
      </context-menu-item>
      <context-menu-item @itemClickHandle="startWolf">
        <span class="line-check" :style="{ visibility: isCheckWolf ? undefined : 'hidden' }">✓</span>
        <span class="line-text">健康模式</span>
      </context-menu-item>
      <context-menu-item @click="$emit('open-scan')">
        <span class="line-check"></span>
        <span class="line-text">扫源小助手</span>
      </context-menu-item>
    </context-menu>
    <div @contextmenu="openContextMenu">
      <slot></slot>
    </div>
  </div>
  <!-- 修改名称 -->
  <n-modal v-model:show="showRenameVisible" :mask-closable="true" preset="card" title="直播源重命名"
    :style="{ width: '600px' }">
    <RenameDialog @ok="okSaveNewName" :row="showRenameRow" />
  </n-modal>
</template>
<script lang="ts">
import { M3UObject, readerHandleM3u, readerHandleTxt } from "@/utils/file";
import { PropType, defineComponent, onMounted } from "vue";
import { useLocalStorage } from "@vueuse/core";
import "./rightmenus/vue3-contextmenu.css";
import { useSpeed } from "@/store/checkSpeed";
import emitter from '@/utils/eventbus';
import ClipImport from "./svg/ClipImport.vue"
import Rename from "./svg/Rename.vue"
import RenameDialog from "./Rename.vue"
import { isUrl } from '../../../utils/file';
import { message } from "@/utils/data";

export default defineComponent({
  components: {
    ClipImport,
    Rename,
    RenameDialog,
  },
  props: {
    row: {
      default: () => ({}),
      type: Object as PropType<M3UObject>
    }
  },
  emits: ["clear-list", "clear-invalid", "speed", "wolf", "getM3u", "open-scan", "speed-order", "change-name", "load-self-group"],
  setup(props, { emit }) {
    const emitContext = inject('emitContext') as (event: Event, dataId: Record<string, unknown>) => void
    const speed = useSpeed();

    const isCheckSpeed = useLocalStorage("_menu_speed", false); //极速模式
    const isCheckWolf = useLocalStorage("_menu_wolf", true); // 健康模式
    function clipboardTextImport() {
      // 导入逻辑判断
      function importM3u(importTxt: string) {
        if (importTxt.trim().startsWith("#EXTM3U")) {
          emit("getM3u", readerHandleM3u(importTxt));
        } else if (importTxt.split("\n").some(line => line.trimStart().startsWith("#EXTINF"))) {
          const m3u = importTxt.split("\n");
          m3u.unshift("#EXTM3U");
          emit("getM3u", readerHandleM3u(m3u.join("\n")), "loacl");
        } else {
          emit("getM3u", readerHandleTxt(importTxt), "loacl");
        }
      }

      const clipboardText = window.eApi.getClipboardText();

      if (isUrl(clipboardText)) {
        let url = clipboardText;

        // 处理github页面数据
        if (
          clipboardText.startsWith("https://github.com") ||
          clipboardText.startsWith("https://githubusercontent.com") ||
          clipboardText.startsWith("https://raw.githubusercontent.com")
        ) {
          url = `https://mirror.ghproxy.com/${url}`;
        }


        message.warning("正在通过网络请求进行导入，请稍后...", { duration: 10000 });
        fetch(url)
          .then((res) => res.text())
          .then((txt) => {
            message.destroyAll();
            message.success("导入结束")
            importM3u(txt)
          }).catch(() => {
            message.destroyAll();
            message.success("导入失败")
          });

        return;
      }

      //-------------------读取剪贴板-----------------------------------
      importM3u(clipboardText)

    }

    function clearList() {
      emit("clear-list");
    }

    function clearInvalid() {
      emit("clear-invalid");
    }

    function speedOrder() {
      emit("speed-order");
    }

    function loadSelfGroup() {
      emit("load-self-group");
    }

    function startWolf() {
      isCheckWolf.value = !isCheckWolf.value;
      emit("wolf", isCheckWolf.value);
    }

    onMounted(() => {
      emit("wolf", isCheckWolf.value);
    });

    emitter.on("table-select-row", (row: any) => {
      const { name, url } = row
      if (name && url) {
        // message.success(url)
      }
    })

    function openContextMenu(e) {
      emitter.emit("table-select-row", {})
      emitContext(e, { name: 'context-menu-1', id: [1, 2, 3] })
    }

    const showRenameVisible = ref(false)
    const showRenameRow = ref()
    function rename() {
      const row = props.row
      showRenameRow.value = row
      showRenameVisible.value = true
    }

    // 保存新名词
    function okSaveNewName(row) {
      showRenameVisible.value = false
      emit("change-name", row)
    }

    return {
      openContextMenu,
      clipboardTextImport,
      clearList,
      clearInvalid,
      startWolf,
      loadSelfGroup,
      isCheckWolf,
      speedOrder,
      speed,
      rename,
      showRenameVisible,
      showRenameRow,
      okSaveNewName,
    };
  },
});
</script>
<style scoped lang="scss">
.top-menu {
  display: flex;
  padding: 5px 20px;
  border-bottom: 1px solid #e3e6eb;
  gap: 0.5rem;

  i {
    cursor: pointer;
  }
}

.line-check {
  display: inline-block;
  width: 20px;
}

.line-text {
  display: inline-block;
  width: 80px;
}

.shortcut {
  display: inline-block;
  width: 75px;
  margin-left: 25px;
  font-size: 12px;
  color: #8e929b;
  text-align: right;
  display: none;
}
</style>
