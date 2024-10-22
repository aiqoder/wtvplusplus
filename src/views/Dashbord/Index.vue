<template>
  <DropFile @getM3u="importM3u">
    <!-- <ffmpegDemo/> -->
    <n-layout has-sider>

      <n-layout-sider content-style="padding-right:24px;text-align:center;" width="230">
        <SideMenu @export="exportM3u()" @check="checkM3u" @cancel="cacelCheckM3u" @getM3u="importM3u"
          :process="checkProcess" :isImport="m3uData.length > 0" @setting="SettingModalVisible = true" />
        <n-alert title="提示" type="info" class="mt-16" :show-icon="false">
          <p>1. 列表位置，点击右键发现更多功能</p>
          <p>2. 双击名称，删除这一行</p>
        </n-alert>
        <div class=" text-gray pos-absolute pos-bottom-0 text-center w-full" v-if="network.status == 200">
          <div>当前网络 ：{{ network.province }}-{{ network.isp }}</div>
        </div>
      </n-layout-sider>
      <n-layout>
        <!-- 检测进度 -->
        <div class=" flex bg-[#203446] py-1.5 px-4 rounded justify-between">
          <div class=" inline-flex gap-8">
            <span>已检测: {{ m3uCheckedNumbers }}/{{ m3uData.length }}</span>
            <span>可用: {{ m3uData.filter((m3u8) => m3u8.success).length }}</span>
          </div>
          <div>
            检测进度：
            <span style="color: #9d4de7; font-weight: 700">{{
              ((m3uCheckedNumbers / (m3uData.length || 1)) * 100).toFixed(2)
            }}%</span>
          </div>
          <div class=" w-8 cursor-pointer" v-show="sleepShow" @mouseover="sleepShow = true"
            @mouseleave="sleepShow = false">
            <span>
              <n-icon size="1.2rem">
                <AlarmSharp />
              </n-icon>
            </span>
          </div>
        </div>
        <!-- 搜索 -->
        <div style="margin-top: 8px">
          <SearchM3u8 @getM3u="importM3u" ref="searchRef" @autoCheck="handleAutoCheck" />
        </div>

        <IRightMenu @clear-list="m3uData = []" @clear-invalid="clearUnSuccessM3uData" @speed-order="rSpeedOrderBy"
          @getM3u="importM3u" @open-scan="showScanVisible = true" @change-name="changeNewName" :row="right.row">
          <div style="margin-top: 8px;background-color:var(--n-color)">
            <n-data-table :columns="m3uColumns" :data="m3uData" :row-props="right.rowProps" :pagination="false"
              :min-height="`calc(100vh - 190px + ${search.open ? '25px' : '70px'})`"
              :max-height="`calc(100vh - 190px + ${search.open ? '25px' : '70px'})`" :row-key="(obj) => obj.url"
              @update:sorter="handleSorterChange" virtual-scroll :single-line="false" size="small" />

          </div>
        </IRightMenu>
      </n-layout>
    </n-layout>
  </DropFile>
  <!-- 扫源工具弹出框 -->
  <n-modal v-model:show="showScanVisible" :mask-closable="true" preset="card" title="扫源小助手" :style="{ width: '600px' }">
    <Scan @ok="okScan" />
  </n-modal>

  <!-- 导出 -->
  <n-modal v-model:show="showExportVisible" :mask-closable="false" preset="card" title="导出范围预置"
    :style="{ width: '600px' }">
    <ExportModal :data="m3uData" />
  </n-modal>

  <!-- 域名设置 -->
  <n-modal v-model:show="SettingModalVisible" :mask-closable="false" preset="card" title="超级设置"
    :style="{ width: '700px', minHeight: '200px' }">
    <SettingModal />
  </n-modal>

  <!-- 视频播放 -->
  <n-modal v-model:show="video.visible" :mask-closable="false" preset="card" title="视频播放"
    :style="{ width: '800px', minHeight: '200px' }">
    <CZPlayer />
  </n-modal>

  <AutoCheck v-if="autoCheckVisible" />
</template>

<script lang="ts" setup>
import { AlarmSharp } from "@vicons/ionicons5"
import { ref, unref, computed, watchEffect, onUnmounted } from 'vue';
import { M3UObject } from "../../utils/file";
import useM3uTable from "./hooks/m3utable";
import CZPlayer from "@/components/CZPlayer.vue"
import SideMenu from "./components/SideMenu.vue";
import AutoCheck from "./components/AutoCheck.vue";
import SearchM3u8 from "./components/SearchM3u8.vue";
import DropFile from "./components/DropFile.vue";
import IRightMenu from "./components/IRightMenu.vue";
import Scan from "./components/Scan.vue";
import ExportModal from "./components/ExportModal.vue";
import SettingModal from "./components/SettingModal.vue";
import { notification } from '@/utils/data';
import { useCheck } from './hooks/videoCheck';
import { useOriginData } from '@/store/originFormatData';
import { useSearch } from '@/store/search';
import { useVideo } from '@/store/video';
import { jsSleep } from '@/utils/util';
import { useIntervalFn } from "@vueuse/core";
import axios from "axios";

defineOptions({
  name: "dashbord"
})

const searchRef = ref()
const sleepShow = ref(false)

const search = useSearch()
const video = useVideo()

const { originData } = useOriginData()

const showScanVisible = ref(false);
const showExportVisible = ref(false);
const SettingModalVisible = ref(false)
const autoCheckVisible = ref(false)


//检测是否进行中
const checkProcess = ref(false);
//table
const { m3uColumns, m3uData, right, handleSorterChange, clearUnSuccessM3uData, removeDuplicationM3uData, rSpeedOrderBy } =
  useM3uTable();

// 如果列表情况，则清空原格式数组
watch(m3uData, (data) => {
  if (data.length === 0) {
    originData.length = 0
  }
})

// 使用defaultCheck测试
const defaultCheck = useCheck()

// 已检测的直播源数量
const m3uCheckedNumbers = computed(() => {
  return unref(m3uData).filter(
    (m3u8) => m3u8.success == true || m3u8.success == false
  ).length;
});

watchEffect(() => {
  //检测是否完成，设置完成 autoCheckQueen 是0表示非自动检测
  if (m3uCheckedNumbers.value >= unref(m3uData).length) {
    if (search.autoCheckQueen.length > 0 || search.autoSelfCheck) {
      unref(searchRef)?.changeSoso("auto check")
    }

    checkProcess.value = false;
  }
});
//上传m3u文件
function importM3u(data: M3UObject[], mode: "loacl" | "search" | "auto-check") {
  // 如果正在检测，则不允许添加
  if (data.length == 0) {
    notification.warning({
      title: "提示！！",
      content: "没有读取到任何内容",
      duration: 2000,
    });
    return;
  }
  // 如果正在检测，则不允许添加
  if (checkProcess.value) {
    notification.error({
      title: "提示！！",
      content: "请先停止检测",
      duration: 2500,
    });
    return;
  }

  // 导入移除自动检测特征
  search.autoCheckQueen.length = 0
  search.autoSelfCheck = false

  m3uData.value = data;

  // 导入文件去除重复源
  removeDuplicationM3uData();
}

//检测m3u文件
async function checkM3u() {
  if (unref(m3uData).length <= 0) {
    notification.error({
      title: "提示！！",
      content: "请先导入文件",
      duration: 1500,
    });
    return;
  }

  checkProcess.value = true;
  let checkCount = 0;

  for (const [index, m3u8] of unref(m3uData).entries()) {
    //当前检测的数量，大于5个则暂停检测, 停止1000ms继续进行
    if (checkCount > 5) {
      await jsSleep(1000)
    }
    //跳过已经检测过的源
    if (m3u8.success != undefined) {
      continue;
    }

    // 检测停止控制
    checkCount += 1;
    if (!checkProcess.value) {
      checkCount = 0;
      console.warn("已取消");
      break;
    }

    defaultCheck.createRequest(m3u8).then((res) => {
      m3u8.success = true;
      m3u8.rSpeed = res.speed + "ms"
      m3u8.ratio = res.width ? `${res.width}x${res.height}` : '未知'
      m3u8.fps = res.fps || 0
    }).catch(() => {
      // 只有检测状态才会更改结果
      if (checkProcess.value) {
        m3u8.rSpeed = "-1"
        m3u8.success = false;
      }
    }).finally(() => {
      checkCount -= 1;
    })
    // // 原力链接检测
    // const lowUrl = m3u8.url.toLocaleLowerCase()
    // if (lowUrl.startsWith("p2p://") || lowUrl.startsWith("p8p://") || lowUrl.startsWith("mitv://")) {
    //   await jsSleep(5000)
    // }
  }
}

//停止检测
function cacelCheckM3u() {
  search.autoCheckQueen.length = 0
  search.autoSelfCheck = false
  defaultCheck.stopCheck()
  checkProcess.value = false;
}

function handleAutoCheck() {
  nextTick(() => {
    checkM3u()
  })
}

// 离开页面停止检测
onUnmounted(() => cacelCheckM3u());

function exportM3u() {
  if (m3uData.value.length == 0) {
    notification.error({
      title: "提示！！",
      content: "请先导入文件",
      duration: 1500,
    });
    return;
  }
  showExportVisible.value = true
}


// 扫源小助手完成
function okScan(data) {
  m3uData.value = [...data];
  showScanVisible.value = false;
}

// 修改名称
function changeNewName(row) {
  const url = row.url
  for (const data of unref(m3uData)) {
    if (url == data.url) {
      data.name = row.name
      return
    }
  }
}

onDeactivated(() => {
  showExportVisible.value = false
  showScanVisible.value = false
  SettingModalVisible.value = false
  video.visible = false
})

const network = reactive({
  status: 200,
  isp: "",
  province: ""
})

useIntervalFn(
  () => {
    axios.get("https://ip.yigechengzi.com").then(res => {
      network.status = res.data?.code
      network.isp = res.data?.data?.isp
      network.province = res.data?.data?.province
    }).catch(res => {
      network.status = 500
    })
  },
  60 * 1000,
  {
    immediateCallback: true,
  })
</script>
<style>
.n-table .success-row {
  background: #f0f9eb;
}

.n-table .warning-row {
  background: #fdf5e6;
}
</style>
<style lang="scss" scoped>
.logo-box {
  width: 20%;
  margin-left: 130px;
}

.success {
  background: #00c13c;
  border: none;
  border-radius: 10px;
  padding: 10px 80px;
  color: #fff;
  text-decoration: none;
}

.mt-16 {
  margin-top: 16px;
}

.w-100 {
  width: 100%;
}

:deep(.n-card-header__main) {
  // color: #ffffff !important;
  font-weight: 600;
  font-size: 16px;
}
</style>
