<template>
  <div class="change-channel-wrapper">
    <div>切换直播源：</div>
    <div class="icon">
      <span
        v-for="(u, index) in urls"
        :style="{
          backgroundColor: active === index + 1 ? '#8a2be2' : '',
          color: active === index + 1 ? '#FFF' : '',
        }"
        :key="u"
        @click="changeUrl(index, u)"
        >{{ index + 1 }}</span
      >
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, watch } from "vue";

export default defineComponent({
  props: {
    urls: {
      default: () => [],
      type: Array,
    },
  },
  setup(props, { emit }) {
    const active = ref(1);

    watch(
      () => props.urls,
      () => {
        active.value = 1;
      }
    );

    function changeUrl(index: number, u: string) {
      if(active.value == index + 1){
        return
      }
      active.value = index + 1;
      emit("change", u);
    }
    return {
      changeUrl,
      active,
    };
  },
});
</script>
<style lang="scss" scoped>
.change-channel-wrapper {
  display: flex;
  color: #fff;
  font-size: 18px;
  .icon {
    span {
      text-align: center;
      margin-right: 10px;
      display: inline-block;
      width: 30px;
      height: 30px;
      background-color: #fff;
      border-radius: 15px;
      color: #8a2be2;
      font-weight: 600;
      cursor: pointer;
    }
  }
}
</style>
