<template>
  <div class="container">
    <n-h3> 说明 </n-h3>
    <n-p>
      软件纯属个人兴趣开发，请勿进行商业行为。
      <b>其它联系方式概不接收!!!</b>
    </n-p>
    <n-h3> 联系方式 </n-h3>
    <n-tabs type="segment">
      <n-tab-pane name="chap2" tab="捐赠">
        <div style="text-align: center;">
          <p>
            12元钱，请我吃臊子面
          </p>
          <img src="../assets/电视直播交流群群聊二维码.png" style="background-color: #f0f0f0;padding-top:20px" />
        </div>
      </n-tab-pane>
      <n-tab-pane name="chap1" tab="公众号（一个橙子pro）">
        <div style="text-align: center;">
          <img src="../assets/wxgzh.png" style="width: 70vw" />
        </div>
      </n-tab-pane>
      <n-tab-pane name="chap4" tab="微信">
        <div style="text-align: center;">
          <p>微信仅限于防止失联、wtv问题咨询、技术合作等正常内容交流，请勿无故骚扰</p>
          <img src="../assets/79ea44bb084025f310d69f2050b1b45.jpg" width="260" />
        </div>
      </n-tab-pane>
      <n-tab-pane name="chap5" tab="捐赠" v-if="isMac()">
        <div style="text-align:center">
          <img width="260" src="../assets/408eedad9e3dddf953884793c99727a.jpg" />
        </div>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>
<script lang="ts" setup>
import { isMac } from '@/utils/util';
</script>
<style lang="scss" scoped>
p {
  font-size: 16px;
}

a {
  color: #8a2be2;
}
</style>
