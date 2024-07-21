<template>
  <figure class="qrcode">
    <vue-qrcode
      :value="payUrl"
      tag="svg"
      :options="{
        errorCorrectionLevel: 'Q',
        width: 200,
      }"
    ></vue-qrcode>
    <img
      class="qrcode__image"
      :src="zhifuLogo"
      alt="Chen Fengyuan"
    />
  </figure>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { aliF2FPay } from "@/api/index";
import VueQrcode from "@chenfengyuan/vue-qrcode";
//@ts-ignore
import zhifuLogo from "@/assets/30.png"
export default defineComponent({
  components: {
    [VueQrcode.name]: VueQrcode,
  },
  setup() {
    const payUrl = ref("12");
    onMounted(() => {
      aliF2FPay().then((res) => {
        payUrl.value = res.data.qrCode;
      });
    });
    return {
      payUrl,
      zhifuLogo
    };
  },
});
</script>
<style lang="scss" scoped>
.qrcode {
  display: inline-block;
  font-size: 0;
  margin-bottom: 0;
  position: relative;
}

.qrcode__image {
  background-color: #fff;
  border: 0.25rem solid #fff;
  border-radius: 50%;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.25);
  height: 25%;
  left: 50%;
  overflow: hidden;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 25%;
}
</style>