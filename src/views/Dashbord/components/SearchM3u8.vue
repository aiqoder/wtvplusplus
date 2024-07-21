<template>
  <div class="soso-wrapper">
    <span>搜一搜：</span>
    <n-input :on-change="() => changeSoso(searchValue)" type="text" placeholder="输入搜索内容，按下回车键搜索" :loading="loading"
      :maxlength="1000" v-model:value="searchValue">
    </n-input>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import { debounce } from "howtools";
import { useSearch } from '@/store/search';
import axios from 'axios';
import { message } from '@/utils/data';
import { defaultGroup } from '../../../utils/defaultGroup';
import { useCommon } from '@/store/common';
export default defineComponent({
  setup(props, { emit }) {
    const searchUrl = useSearch()
    const common = useCommon()
    const loading = ref(false);
    const searchValue = ref("");

    function preSearch(value: string) {
      if (searchUrl.url) {
        axios.get(searchUrl.url, { params: { tvName: value, isIpv6: common.ipv6 ? "1" : "0" } }).then(res => {
          const json = res.data?.data || []
          // 云端搜索追加分类
          json.forEach(element => {
            element.group = defaultGroup(element.name)
          });
          emit("getM3u", json, "search");
        }).catch(err => {
          message.warning("服务繁忙，稍后再试")
        }).finally(() => {
          loading.value = false;
          searchValue.value = "";
        });
      } else {
        message.warning("请先设置搜索链接")
        loading.value = false;
      }
    }

    const search = debounce(preSearch, 1500);

    const changeSoso = (value: string) => {
      if (!value.trim()) {
        loading.value = false;
        return;
      }
      loading.value = true;
      search(value);
    };

    return {
      changeSoso,
      loading,
      searchValue,
      searchUrl,
    };
  },
});
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
