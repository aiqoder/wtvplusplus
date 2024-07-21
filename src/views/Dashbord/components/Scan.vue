<template>
  <n-tabs type="line" default-value="yiban" v-model:value="activeTab">
    <n-tab-pane name="yiban" tab="一般模式">
        <div class="center">
            <n-steps size="small" :current="(current as number)" :status="currentStatus">
            <n-step title="输入任意直播源" />
            <n-step title="选择扫描段" />
            <n-step title="输入数值范围" />
        </n-steps>
        </div>
        <div class="wrapper" v-show="current == 1">
          <n-form ref="formRef1" :model="model1" :rules="step1Rules">
            <n-form-item path="url" label="输入直播源地址">
              <n-input v-model:value="model1.url" @keydown.enter.prevent />
            </n-form-item>
            <n-row :gutter="[0, 24]">
              <n-col :span="24">
                <div style="display: flex; justify-content: flex-end">
                  <n-button size="tiny" @click="splitLive" round type="primary">
                    下一步
                  </n-button>
                </div>
              </n-col>
            </n-row>
          </n-form>
          </div>
          <div class="wrapper" v-show="current == 2">
            <n-form ref="formRef2" :model="model2" :rules="step2Rules">
              <n-form-item path="picker" label="请选择要扫描的数字集">
                <n-radio-group v-model:value="model2.picker">
                  <n-space>
                    {{ model2.origin }}
                    <template v-for="u in model2.urls" :value="u">
                      <n-radio v-if="/^\d+$/.test(u)" :value="u">
                        {{ `/${u}` }}
                      </n-radio>
                      <div v-else>
                        {{ `/${u}` }}
                      </div>
                    </template>
                  </n-space>
                </n-radio-group>
              </n-form-item>
              <n-row :gutter="[0, 24]">
                <n-col :span="24">
                  <div style="display: flex; justify-content: flex-end">
                    <!-- 选择数值范围 -->
                    <n-space>
                      <n-button text @click="() => (current -= 1)" round type="primary">
                        上一步
                      </n-button>
                      <n-button size="tiny" @click="selectionRange" round type="primary">
                        下一步
                      </n-button>
                    </n-space>
                  </div>
                </n-col>
              </n-row>
            </n-form>
          </div>
          <!-- 数字范围 -->
          <div class="wrapper" v-show="current == 3">
            <n-form ref="formRef3">
              <n-row>
                <n-col :span="12">
                  <n-form-item label="起始位置数字">
                    <n-input-number v-model:value="model3.start" />
                  </n-form-item>
                </n-col>
                <n-col :span="12">
                  <n-form-item label="结束位置数字">
                    <n-input-number v-model:value="model3.end" />
                  </n-form-item>
                </n-col>
              </n-row>
              <n-row :gutter="[0, 24]">
                <n-col :span="24">
                  <div style="display: flex; justify-content: flex-end">
                    <!-- 选择数值范围 -->
                    <n-space>
                      <n-button text @click="() => (current -= 1)" round type="primary">
                        上一步
                      </n-button>
                      <n-button
                        size="tiny"
                        @click="ok"
                        round
                        type="primary"
                      >
                        完成
                      </n-button>
                    </n-space>
                  </div>
                </n-col>
              </n-row>
            </n-form>
          </div>
    </n-tab-pane>
    <n-tab-pane name="zidingyi" tab="自定义模式">
      <n-ul align-text>
        <n-li>只能将数字设为变量,例如：http://www.example.com/x123/yy/12345.m3u8。</n-li>
        <n-li>可以设置为：http://www.example.com/x<span style="color:red">[1-100]</span>/yy/12345.m3u8。</n-li>
        <n-li>也可以配置为：http://www.example.com/x123/yy/<span style="color:red">[1-100]</span>.m3u8。</n-li>
        <n-li>每次只能配置一个规则，多余的将忽略</n-li>
      </n-ul>
      <div class="wrapper">
        <n-form ref="formRef4" :model="model4" :rules="step4Rules">
            <n-form-item path="url" label="输入规则地址">
              <n-input v-model:value="model4.url" @keydown.enter.prevent />
            </n-form-item>
            <n-row :gutter="[0, 24]">
              <n-col :span="24">
                <div style="display: flex; justify-content: flex-end">
                  <n-button size="tiny" @click="ok" round type="primary">
                    确定
                  </n-button>
                </div>
              </n-col>
            </n-row>
          </n-form>
        </div>
    </n-tab-pane>
  </n-tabs>
</template>
<script setup lang="ts">
import { FormItemRule, FormRules, StepsProps } from "naive-ui";
import { urlReg } from 'howtools';
import { message } from "@/utils/data";

const emit = defineEmits(["ok"])

const activeTab = ref("yiban")

const currentStatus = ref<StepsProps["status"]>("process");
const current = ref<number>(1);

const formRef1 = ref();
const formRef2 = ref();
const formRef3 = ref();
const formRef4 = ref();

const model1 = ref({
  url: "",
});

const model2 = ref<{ urls: string[]; picker: string; origin: string }>({
  urls: [],
  picker: "",
  origin: "",
});

const model3 = ref({
  start: 0,
  end: 0,
});

const model4 = ref({
  url: "",
});

const step1Rules: FormRules = {
  url: [
    {
      required: true,
      validator(rule: FormItemRule, value: string) {
        if (!value) {
          return new Error("请输入");
        } else if (!urlReg.test(value)) {
          return new Error("请输入正确的网络地址");
        } else if (!value.endsWith(".m3u8")) {
          return new Error("仅支持m3u8结尾的链接");
        }
        return true;
      },
      trigger: ["input", "blur"],
    },
  ],
};

const step2Rules: FormRules = {
  picker: [
    {
      required: true,
      validator(rule: FormItemRule, value: string) {
        if (!value) {
          return new Error("请选择要扫描的数字集");
        }
        return true;
      },
      trigger: ["input", "blur"],
    },
  ],
};

const step4Rules: FormRules = {
  url: [
    {
      required: true,
      validator(rule: FormItemRule, value: string) {
        if (!value) {
          return new Error("请输入");
        }else if(!/\[\d+-\d+\]/.test(value.trim())){
          return new Error("请根据提示正确配置规则");
        }
        return true;
      },
      trigger: ["input", "blur"],
    },
  ],
};

// 点击第一步下一步
function splitLive() {
  formRef1.value?.validate((errors) => {
    if (!errors) {
      const { origin, pathname } = new URL(model1.value.url);
      model2.value.origin = origin;
      model2.value.urls = pathname.split("/").filter(Boolean);
      if(!model2.value.urls.find(item=> !isNaN(+item))){
        message.warning("该链接不支持一般模式, 请尝试自定义模式")
        return
      }
      current.value += 1;
    }
  });
}

// 点击第二步下一步
function selectionRange() {
  formRef2.value?.validate((errors) => {
    if (!errors) {
      current.value += 1;
      console.log(model2.value.picker);
    }
  });
}

function ok(){
  const resultM3us: { name: string, url: string}[] = []
  if(activeTab.value === "yiban"){
    const { origin, urls, picker} = model2.value
    const { start, end } = model3.value
    // 替换字符所在位置
    const index = urls.indexOf(picker)
    const len = Math.abs(start - end)
    if(len > 5000) {
      message.error("请调整数据范围，一次最多扫描5000条数据")
      return
    }

    const padZero = (str: string) => {
        if(str.length > picker.length) return str
        if(picker.startsWith("0")){
           return str.padStart(picker.length, "0")
        }
        return str
    }
    
    for(const i in new Array(len).fill(0)){
      const bkurls = [...urls] // 复制新的urls 数据
      bkurls[index] = `${padZero("" + (Number(start) + parseInt(i)))}`
      const url =  bkurls.join("/")
      resultM3us.push({
        name: i,
        url: `${origin}/${url}`
      })
    }
    emit("ok", resultM3us)
  }else if(activeTab.value === "zidingyi"){
    // 自定义模式规则处理
    formRef4.value?.validate((errors) => {
      const mall = model4.value.url.match(/\[\d+-\d+\]/) || []
      const urlRegular = mall[0] || ""
      if(!urlRegular){
        message.error("错误的规则，请调整重新输入")
        return
      }
      
      const urls = model4.value.url.trim().split(urlRegular)
      const [start, end] = urlRegular.replace("[","").replace("]","").split("-")
      
      const _start = Number(start)
      const _end = Number(end)
      const len = Math.abs(_start - _end)
      if(len > 5000) {
        message.error("请调整数据范围，一次最多扫描5000条数据")
        return
      }

      const padZero = (str: string) => {
        if(str.length > start.length) return str
        if(start.startsWith("0")){
           return str.padStart(start.length, "0")
        }
        return str
      }

      for(const i in new Array(len).fill(0)){
        const url = urls[0] + `${padZero(_start + Number(i) + "")}` +  urls[1]
        resultM3us.push({
          name: i,
          url
        })
      }
      emit("ok", resultM3us)
    });
  }
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
