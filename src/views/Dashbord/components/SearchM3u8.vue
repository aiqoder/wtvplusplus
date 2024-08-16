<template>
  <div class="soso-wrapper" v-show="searchUrl.open">
    <n-select class=" w-[100px]" v-model:value="searchMode"
      :options="[{ label: '搜一搜', value: 'so' }, { label: '搜我的', value: 'me' }]"></n-select>
    <n-input :on-change="() => changeSoso(searchValue)" type="text" placeholder="输入搜索内容，按下回车键搜索" :loading="loading"
      :maxlength="1000" v-model:value="searchValue">
    </n-input>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { debounce, isString } from "howtools";
import { useSearch } from '@/store/search';
import axios from 'axios';
import { message } from '@/utils/data';
import { handleUserGroup } from '../../../utils/defaultGroup';

const searchUrl = useSearch()
const loading = ref(false);
const searchValue = ref("");
const searchMode = ref("so"); // 搜索模式

const emit = defineEmits()

function preSearch(value: string) {
  return new Promise((resolve, reject) => {
    if (searchUrl.url) {
      axios.get(`${searchUrl.getUrl}/v1/tv/json`, { params: { tvName: value, mode: unref(searchMode) } }).then(res => {
        const json = res.data?.data || []
        // 云端搜索追加分类
        json.forEach(element => {
          element.group = handleUserGroup(element.name)
        });
        emit("getM3u", json, "search");
        resolve(json)
      }).catch(err => {
        message.warning(err)
        reject(err)
      }).finally(() => {
        loading.value = false;
        searchValue.value = "";
      });
    } else {
      message.warning("请先设置搜索链接")
      loading.value = false;
      reject()
    }
  })
}

const search = debounce(preSearch, 1500);

const changeSoso = (value: string) => {
  if (!value.trim()) {
    loading.value = false;
    return;
  }
  loading.value = true;

  if (value == "auto check") {
    loading.value = false;
    searchValue.value = ""
    // 没有对接数据先加载
    if (searchUrl.autoCheckQueen.length == 0) {
      searchUrl.loadAutoCheckData()
    }
    if (searchMode.value == "so") {
      const tvName = searchUrl.getNext()
      if (tvName && isString(tvName)) {
        message.warning(`正在触发关键词：${(tvName as string).replace(/[\\|^|\+|\*|\.|\$]/mg, '')}`)
        preSearch(tvName).then((res: any) => {
          if (res.length == 0) {
            const tvName = searchUrl.getNext()
            if (tvName) {
              changeSoso(tvName)
            }
            return
          }

          emit('autoCheck')
        })
      } else {
        message.info("检测完成")
      }
    } else {
      preSearch(value).then((res: any) => {
        emit('autoCheck')
      })
    }
    return
  }

  search(value)
};

defineExpose({
  changeSoso
})
</script>

<style lang="scss" scoped>
.soso-wrapper {
  display: flex;
  align-items: center;

  >span {
    flex-basis: 65px;
  }
}
</style>
