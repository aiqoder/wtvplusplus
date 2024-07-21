<script lang="ts" setup>
import { M3UObject, readerHandleM3u } from "@/utils/file";
import { useLocalStorage } from "@vueuse/core";
import axios from "axios";
import { urlReg } from "howtools";
import { readerHandleTxt } from "../../../utils/file";
import { shallowRef } from "vue";

const total = computed(() => unref(textValue).split("\n").length);
const insertNumber = shallowRef(0);
const loadLinkNumber = shallowRef(0);

const show = shallowRef(false);
const textValue = useLocalStorage("wtv-tools-subscription_pool", "");

function changeTextValue(e: Event) {
  textValue.value = (e.target as HTMLInputElement).value;
}

const backLoadData: string[] = [];

async function loadData() {
  insertNumber.value = 0;
  loadLinkNumber.value = 0;
  backLoadData.length = 0

  const insert = (u: M3UObject) => {
    if (!u.name || !u.url) return;
    loadLinkNumber.value += 1;
    window.orm.insert("wtvsubscribe", u);
  };

  backLoadData.push(...unref(textValue).split("\n"));

  for (const url of backLoadData) {
    let _url = url
    const response = await axios.get(_url, {
      // headers: {
      //   "Cache-Control": "no-cache",
      // },
    });
    insertNumber.value += 1;
    if (urlReg.test(url)) {
      if (url.endsWith("m3u" || url.endsWith("m3u8"))) {
        if (response) {
          const urls = readerHandleM3u(response.data);
          for (const u of urls) insert(u);
        }
      } else {
        if (response) {
          const urls = readerHandleTxt(response.data);
          for (const u of urls) insert(u);
        }
      }
    }
  }
}

// 停止更新数据
function stopLoadData() {
  insertNumber.value = 0;
  backLoadData.length = 0;
}
</script>
<template>
  <div>
    <n-drawer v-model:show="show" width="50%" show-mask="transparent">
      <n-drawer-content title="订阅池地址配置" closable>
        <textarea
          :value="textValue"
          @change="changeTextValue"
          type="textarea"
          rows="32"
          style="width: 98%"
          autocomplete="off"
          spellcheck="false"
        />
        <template #footer>
          <n-space>
            <span>载入链接数：{{ loadLinkNumber }}</span>
            <span>更新进度：{{ `${insertNumber}/${total}` }}</span>
            <n-button type="primary" @click="loadData()">更新订阅</n-button>
            <n-button @click="stopLoadData()">停止更新</n-button>
            <n-button @click="show = false">关闭窗口</n-button>
          </n-space>
        </template>
      </n-drawer-content>
    </n-drawer>
    <n-space justify="space-between">
      <b>云端订阅池配置</b>
      <div>
        <n-button size="small" type="info" @click="show = true"
          >打开配置</n-button
        >
      </div>
    </n-space>
    <div style="font-size: 12px; color: red">
      订阅池用于云端搜一搜功能，配置越全面搜索的结果就越多
    </div>
  </div>
</template>
<style lang="less" scoped></style>
