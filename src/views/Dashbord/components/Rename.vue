<template>
  <n-form ref="formRef" :model="model" :rules="rules">
    <n-form-item path="newName" label="新名称">
      <n-input v-model:value="model.newName" @keydown.enter.prevent />
    </n-form-item>
    <n-row :gutter="[0, 24]">
      <n-col :span="24">
        <div style="display: flex; justify-content: flex-end">
          <n-button @click="ok" round type="primary">
            保存
          </n-button>
        </div>
      </n-col>
    </n-row>
  </n-form>
</template>
<script setup lang="ts">
import { message } from "@/utils/data";
import { FormRules } from "naive-ui";


const props = defineProps<{
  row: Record<string, any>
}>()

const emit = defineEmits(["ok"])

const current = ref<number>(1);

const formRef = ref();

const model = ref<{ newName: string; }>({
  newName: "",
});

watch(() => props.row, (row) => {
  model.value.newName = row.name
},
  {
    immediate: true,
  })

const rules: FormRules = {
  newName: [
    {
      required: true,
      type: "string",
      trigger: ["input", "blur"],
      message: "请输入名称",
    },
    {
      required: true,
      max: 20,
      message: "最多输入30个字符",
      trigger: ["input", "blur"],
    },
  ],
};

// 点击第一步下一步
function ok() {
  formRef.value?.validate((errors) => {
    if (!errors) {
      if(model.value.newName.length > 15){
        message.error("名称不能超过15个字")
        return
      }
      emit("ok", { ...props.row, name: model.value.newName })
    }
  });
}
</script>
<style lang="scss" scoped>
.wrapper {
  background-color: rgba(255, 255, 255, 0.05);
  // height: 130px;
  margin-top: 20px;
  padding: 24px;
  border-radius: 2px;
}

.center {
  display: flex;
  justify-content: center;
}
</style>
