<template>
  <div class="wrapper" v-if="$state.visible">
    <div class="login">
      <div class="login-close" @click="$state.visible = false">
        <Close style="width: 28px" />
      </div>
      <div class="login-text">登录/注册</div>
      <n-form ref="formRef" :model="$state.user" :rules="rules">
        <n-form-item path="username" label="账号">
          <n-input
            v-model:value="$state.user.username"
            placeholder="请输入用户名..."
          />
        </n-form-item>
        <n-form-item path="password" label="密码">
          <n-input
            v-model:value="$state.user.password"
            type="password"
            placeholder="请输入密码..."
          />
        </n-form-item>
        <n-row :gutter="[0, 24]">
          <n-col :span="24">
            <div style="display: flex; justify-content: flex-end">
              <n-space>
                <n-popover trigger="hover">
                  <template #trigger>
                    <n-button size="small" text type="info"
                      >忘记密码？</n-button
                    >
                  </template>
                  <span>联系微信bianbingdang123，重置密码</span>
                </n-popover>
                <n-button
                  size="small"
                  text
                  type="info"
                  @click="handleRegisterButtonClick"
                  >注册</n-button
                >
                <n-button
                  size="small"
                  type="primary"
                  round
                  @click="handleValidateButtonClick"
                >
                  登录
                </n-button>
              </n-space>
            </div>
          </n-col>
        </n-row>
      </n-form>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { FormInst, FormItemRule, useMessage, FormRules } from "naive-ui";
import { Close } from "@vicons/ionicons5";
import { numberAndWordReg } from "howtools";
import { useUser } from "../../store/login";

const formRef = ref<FormInst | null>(null);
const message = useMessage();
const { login, register, $state } = useUser();

// 初始化页面，如果已经登陆则自动登录
onMounted(() => {
  if ($state.username) {
    login();
  }
});

const rules: FormRules = {
  username: [
    {
      required: true,
      validator(rule: FormItemRule, value: string) {
        if (!value) {
          return new Error("请输入用户名");
        } else if (!/^\d*$/.test(value) && value != "bcm") {
          return new Error("用户名只能是数字");
        } else if (value.length > 12) {
          return new Error("数字不能超过12位");
        }
        return true;
      },
      trigger: ["input", "blur"],
    },
  ],
  password: [
    {
      required: true,
      validator(rule: FormItemRule, value: string) {
        if (!value) {
          return new Error("请输入密码");
        } else if (!numberAndWordReg.test(value)) {
          return new Error("用户名只能是数字和字母");
        } else if (value.length > 18) {
          return new Error("数字不能超过18位");
        }
        return true;
      },
    },
  ],
};

function handleValidateButtonClick(e: MouseEvent) {
  e.preventDefault();
  formRef.value?.validate((errors) => {
    if (!errors) {
      login();
    } else {
      console.log(errors);
      message.error("请按规则填入用户名和密码");
    }
  });
}
function handleRegisterButtonClick(e: MouseEvent) {
  e.preventDefault();
  formRef.value?.validate((errors) => {
    if (!errors) {
      register();
    } else {
      console.log(errors);
      message.error("请按规则填入用户名和密码");
    }
  });
}
</script>
<style scoped lang="scss">
.wrapper {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 20;
  background-color: rgba($color: #000000, $alpha: 0.5);

  .login {
    padding: 24px;
    width: 300px;
    background-color: #323233;
    border-radius: 6px;
    .login-close {
      height: 10px;
      float: right;
      cursor: pointer;
      margin-top: -10px;
    }
  }

  .login-text {
    font-size: 24px;
    text-align: center;
  }
}
</style>
