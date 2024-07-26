<template>
  <div class="menu-icon-wrapper no-select">
    <template v-for="menu in meuns" :key="menu.key">
      <div class="menu-icon" @click="routerTo(menu)">
        <n-icon size="35" :color="acitveMenu == menu.key ? '#8a2be2' : themeVars.textColor2">
          <component :is="menu.com"></component>
        </n-icon>
        <span :style="{
          color: acitveMenu == menu.key ? '#8a2be2' : themeVars.textColor2,
        }">{{ menu.title }}</span>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import {
  Flash,
  EllipsisHorizontalSharp,
  TvSharp,
} from "@vicons/ionicons5";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useSessionStorage } from '@vueuse/core';
import HighQualityOutlined from "./menuSvg/HighQualityOutlined.vue"
import { useThemeVars } from 'naive-ui';

const router = useRouter();
const themeVars = useThemeVars()
const acitveMenu = useSessionStorage("_wtv_tools_login", "jc"); // 菜单保持
const meuns = ref([
  {
    title: "检测",
    com: Flash,
    key: "jc",
    routerName: "index",
  },
  {
    title: "超级电台",
    com: TvSharp,
    key: "tv",
    routerName: "tv",
  },
  {
    title: "规则引擎",
    com: HighQualityOutlined,
    key: "rule",
    routerName: "rule",
  },
  {
    title: "关于",
    com: EllipsisHorizontalSharp,
    key: "gy",
    routerName: "create",
  },
]);

function routerTo(menu: any) {
  acitveMenu.value = menu.key;
  router.push({
    name: menu.routerName,
  });
}
</script>
<style lang="scss" scoped>
.menu-icon-wrapper {
  padding: 0 10px;
}

.menu-icon {
  text-align: center;
  margin-top: 10px;
  cursor: pointer;
  height: 70px;
  font-weight: 600;

  >span {
    display: inline-block;
  }
}
</style>
