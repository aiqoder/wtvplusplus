<template>
  <div class="layout-container">
    <div class="layout-container--left">
      <MenusComponent />
    </div>
    <div class="layout-container--right">
      <router-view v-slot="{ Component }">
        <KeepAlive include="dashbord">
          <component :is="Component"></component>
        </KeepAlive>
      </router-view>
    </div>
  </div>
</template>
<script lang="ts" setup>
import MenusComponent from "./Menus.vue";
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
    overflow: auto;
    height: 100vh;
  }
}
</style>
