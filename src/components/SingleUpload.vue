<template>
  <input type="file" :accept="accept" @change="changeFile" ref="input" hidden />
  <div @click="input.click()">
    <slot></slot>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, unref } from "vue";

export default defineComponent({
  props: {
    accept: {
      default: "",
      type: String,
    },
  },
  emits: {
    "change-file": null,
  },
  setup(props, { emit }) {
    const input = ref()
    function changeFile($event: any) {
      emit("change-file", $event.target.files[0]);
      $event.target.value = ''
    }

    return {
      changeFile,
      input
    };
  },
});
</script>

