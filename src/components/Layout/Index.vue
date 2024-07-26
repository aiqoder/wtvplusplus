<template>
  <div class="layout-container">
    <div class="layout-container--left">
      <MenusComponent />
    </div>
    <div class="layout-container--right">
      <router-view></router-view>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import MenusComponent from "./Menus.vue";
// import { isMac } from "@/utils/util";
export default defineComponent({
  components: {
    MenusComponent,
  },
});
</script>

<style lang="scss" scoped>
.layout-container {
  display: flex;
  &--left {
    width: 80px;
    box-shadow: 0px 5px 5px #88888890;
    height: 100vh;
  }

  &--right {
    flex: 1;
    position: relative;
    width: 0;
  }
}
</style>
