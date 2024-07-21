<template>
  <div class="wrapper text-white">
    <Title />
    <!-- <CheckEngin class="item-class"/> -->
    <!-- <ChangeSpeed class="item-class"/> -->
    <!-- <ChnageTimeout class="item-class"/> -->
    <AutoClearInvalid class="item-class"/>
    <AutoClearList class="item-class"/>
    <!-- <SearchUrl class="item-class"/> -->
  </div>
</template>
<script lang="ts" setup>
import Title from "./components/Title.vue";
import CheckEngin from "./components/CheckEngin.vue";
import ChangeSpeed from "./components/ChangeSpeed.vue";
// import ChnageTimeout from "./components/ChnageTimeout.vue";
import AutoClearInvalid from "./components/AutoClearInvalid.vue";
import SearchUrl from "./components/SearchUrl.vue"
import AutoClearList from "./components/AutoClearList.vue"
</script>
<style lang="scss" scoped>
.wrapper {
  width: 550px;
  margin: 0 auto;
  margin-top: 50px;
}

// .{
//   margin-top: 12px;
// }

.item-class {
  padding:6px 12px;
  &:hover {
    background-color: rgba($color: #000000, $alpha: 0.1);
    border-radius: 5px;
    cursor: pointer;
  }
}
</style>
