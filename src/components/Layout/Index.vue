<template>
  <div class="layout-container bg-black">
    <div class="layout-container--left">
      <MenusComponent />
    </div>
    <div class="layout-container--right">
      <router-view></router-view>
      <!-- 登录 -->
      <Login />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
import MenusComponent from "./Menus.vue";
import Login from "./LoginDialog.vue";
// import { isMac } from "@/utils/util";
export default defineComponent({
  components: {
    MenusComponent,
    Login,
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
  }
}
</style>
