<template>
  <DropFile @getM3u="importM3u">
    <!-- <ffmpegDemo/> -->
    <n-layout has-sider>

      <n-layout-sider content-style="padding-right:24px;text-align:center;" width="230">
        <SideMenu @export="exportM3u()" @check="checkM3u" @cancel="cacelCheckM3u" @getM3u="importM3u"
          :process="checkProcess" :isImport="m3uData.length > 0" />
        <n-alert title="提示" type="info" class="mt-16" :show-icon="false">
          <p>1. 列表位置，点击右键发现更多功能</p>
          <p>2. 双击名称，删除这一行</p>
          <p>3. 检测IPv6相关地址，需要在设置当打开IPv6功能</p>
        </n-alert>
      </n-layout-sider>
      <n-layout class="no-select">
        <!-- 检测进度 -->
        <div class="check-wrapper">
          <div class="check-number">
            <span>已检测: {{ m3uCheckedNumbers }}/{{ m3uData.length }}</span>
            <span>可用: {{ m3uData.filter((m3u8) => m3u8.success).length }}</span>
          </div>
          <div class="check-progress">
            检测进度：
            <span style="color: #9d4de7; font-weight: 700">{{
              ((m3uCheckedNumbers / (m3uData.length || 1)) * 100).toFixed(2)
            }}%</span>
          </div>
        </div>
        <!-- 搜索 -->
        <div style="margin-top: 8px">
          <SearchM3u8 @getM3u="importM3u" />
        </div>

        <IRightMenu @clear-list="m3uData = []" @clear-invalid="clearUnSuccessM3uData" @speed-order="rSpeedOrderBy"
          @wolf="(w) => (operationModel.wolf = w)" @getM3u="importM3u" @open-scan="showScanVisible = true"
          @change-name="changeNewName" :row="right.row" @load-self-group="loadSelfGroup">
          <div style="margin-top: 8px;background-color:var(--n-color)">
            <n-data-table :columns="m3uColumns" :data="speedStore.isAutoClearInvalid ? filterInvalidData : m3uData"
              :row-props="right.rowProps" :pagination="false" min-height="calc(100vh - 190px)"
              max-height="calc(100vh - 190px)" :row-key="(obj) => obj.url" @update:sorter="handleSorterChange"
              virtual-scroll :single-line="false" size="small" />

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
    <ExportModal :data="speedStore.isAutoClearInvalid ? filterInvalidData : m3uData" />
  </n-modal>
</template>

<script lang="ts" setup>
// import 'vxe-table/lib/style.css'
import { ref, unref, computed, reactive, watchEffect, onUnmounted, onMounted } from 'vue';
import { M3UObject } from "../../utils/file";
import { jsSleep, hasWolf } from "../../utils/util";
import useM3uTable from "./hooks/m3utable";
import SideMenu from "./components/SideMenu.vue";
import SearchM3u8 from "./components/SearchM3u8.vue";
import DropFile from "./components/DropFile.vue";
import IRightMenu from "./components/IRightMenu.vue";
import Scan from "./components/Scan.vue";
import ExportModal from "./components/ExportModal.vue";
// import { VxeTable, VxeColumn } from "vxe-table";
import { getSohuSn } from "@/api";
import { notification } from '@/utils/data';
import { useAxiosCheck, useFfmpegCheck } from './hooks/videoCheck';
import { useEngine } from '../../store/engine';
import { useTheme } from '../../store/theme';
import { useSpeed } from '@/store/checkSpeed';
import { useOriginData } from '@/store/originFormatData';
import { useCommon } from '../../store/common';
import getUrlIpWorker from "./worker/getUrlIpWorker.ts?worker"
import { handleUserGroup } from "@/utils/defaultGroup"
const getUrlIp = new getUrlIpWorker()

const { originData } = useOriginData()

const showScanVisible = ref(false);
const showExportVisible = ref(false);

getSohuSn(); // 获取搜狐的IP地址
//------------正文逻辑开始--------------------------
const operationModel = reactive({
  cloud: false,
  wolf: true,
});
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

// 使用axios测试
const axiosCheck = useAxiosCheck()
// 使用ffmpeg测试
const ffmpegCheck = useFfmpegCheck()
// 并发数量, 超时时间存储
const speedStore = useSpeed()

const engine = useEngine()

// 已检测的直播源数量
const m3uCheckedNumbers = computed(() => {
  return unref(m3uData).filter(
    (m3u8) => m3u8.success == true || m3u8.success == false
  ).length;
});

// 清除无效源
const filterInvalidData = computed(() => unref(m3uData).filter(m3u8 => m3u8.success != false))

watchEffect(() => {
  //检测是否完成，设置完成
  if (m3uCheckedNumbers.value >= unref(m3uData).length) {
    checkProcess.value = false;
  }
});
//上传m3u文件
function importM3u(data: M3UObject[], mode: "loacl" | "cloud" | "search") {
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
  // 健康模式过滤不健康的源
  if (operationModel.wolf) {
    data = data.filter((item) => {
      return !hasWolf(item.name);
    });
  }
  // 本地或云端导入
  if (mode == "cloud") {
    operationModel.cloud = true;
  } else {
    operationModel.cloud = false;
  }

  if (mode == "search") {
    // 搜索直盖接覆
    m3uData.value = data;
  } else {
    // 云端追加
    m3uData.value = [...m3uData.value, ...data];
  }

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
  let checkCount = 0; //当前检测的数量，大于10个则暂停检测, 停止1秒继续进行

  for (const [index, m3u8] of unref(m3uData).entries()) {
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

    // 只有检测成功才会进行如下操作
    async function _success_cb() {
      try {
        const u = new URL(m3u8.url)
        getUrlIp.postMessage(m3u8.url)
        getUrlIp.onmessage = (res) => {
          if (!res.data) return "-"
          const { province, city, isp } = res.data
          if (!province || !city) return ""
          m3u8.region = `${province}${city}${isp}`
        }
      } catch (error) {
        console.log(error);
      }
    }

    if (engine.engine == "ffmpeg") {
      ffmpegCheck.createRequest(m3u8).then(res => {
        const { speed, ratio, avg_frame_rate, codec_name, pix_fmt } = res as any
        m3u8.rSpeed = speed + "ms"
        m3u8.ratio = ratio
        m3u8.success = true;
        //@ts-ignore
        m3u8.avgFrameRate = avg_frame_rate
        //@ts-ignore
        m3u8.codecName = codec_name
        //@ts-ignore
        m3u8.pixFmt = pix_fmt
        _success_cb()

      }).catch(() => {
        // 只有检测状态才会更改结果
        if (checkProcess.value) {
          m3u8.success = false;
          m3u8.rSpeed = "-1"
        }
      }).finally(() => {
        checkCount -= 1;
      })
    } else if (engine.engine == "default") {
      axiosCheck.createRequest(m3u8).then(({ speed }) => {
        m3u8.success = true;
        m3u8.rSpeed = speed + "ms"
        _success_cb()
      }).catch(() => {
        // 只有检测状态才会更改结果
        if (checkProcess.value) {
          m3u8.rSpeed = "-1"
          m3u8.success = false;
        }
      }).finally(() => {
        checkCount -= 1;
      })
    }
  }
}

//停止检测
function cacelCheckM3u() {
  axiosCheck.stopCheck()
  ffmpegCheck.stopCheck()
  checkProcess.value = false;
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

function loadSelfGroup() {
  m3uData.value = [...unref(m3uData)].map(item => {
    const groupName = handleUserGroup(item.name) || item.group
    console.log(item.name, handleUserGroup(item.name))
    item.group = groupName
    return item
  })
}

// 皮肤
const theme = useTheme()
const chackWrapperColor = computed(() => theme.mode === "dark" ? "#203446" : "#20344660")

// 检测是否有IPV6的网络
const common = useCommon()
onMounted(() => {
  common.openIpv6(true, false)
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

.check-wrapper {
  display: flex;
  font-size: 16px;
  background-color: v-bind(chackWrapperColor);
  border-radius: 5px;
  padding: 5px 15px;

  .check-number {
    flex-grow: 1;
    display: flex;

    span {
      flex-basis: 150px;
    }
  }

  .check-progress {
    flex-basis: 200px;
  }
}
</style>
