<template>
  <n-form ref="formRef" :model="model" :rules="rules" label-placement="left" require-mark-placement="right-hanging">
    <n-form-item label="导出格式" path="type">
      <n-radio-group v-model:value="model.type" name="type">
        <n-space>
          <n-radio value="m3u"> m3u</n-radio>
          <n-radio value="txt"> txt</n-radio>
          <n-radio value="txt-merge"> txt 合并相同频道</n-radio>
        </n-space>
      </n-radio-group>
    </n-form-item>
    <n-form-item label="响应速度" path="speed">
      <n-input-number v-model:value="model.speed" placeholder="请输入合适的响应速度" :min="minSpeed">
        <template #prefix> 小于 </template>
        <template #suffix> ms </template>
      </n-input-number>
    </n-form-item>
    <n-form-item label="分辨率" path="pixs" v-if="pixArray.length > 0">
      <n-checkbox-group v-model:value="model.pixs">
        <n-space item-style="display: flex;">
          <n-checkbox v-for="pix in pixArray" :value="pix" :label="pix" />
          <n-tag size="small" @click="model.pixs = [...pixArray]" type="info"
            v-if="model.pixs.length < pixArray.length">全选</n-tag>
          <n-tag size="small" @click="model.pixs.length = 0" type="error" v-else>取消全选</n-tag>
        </n-space>
      </n-checkbox-group>
    </n-form-item>
    <n-form-item label="导出状态" path="success">
      <n-checkbox-group v-model:value="model.success">
        <n-space item-style="display: flex;">
          <n-checkbox :value="1" label="可用" />
          <n-checkbox :value="0" label="无效源" />
          <n-checkbox :value="2" label="待检测" />
        </n-space>
      </n-checkbox-group>
    </n-form-item>
    <n-form-item label="分组" path="success">
      <n-radio-group v-model:value="model.isGroup">
        <n-radio :value="1">分组导出</n-radio>
        <n-radio :value="0">普通导出</n-radio>
      </n-radio-group>
    </n-form-item>
  </n-form>
  <div style="display: flex; justify-content: flex-end">
    <n-space>
      <n-button round color="#8a2be2" text-color="#FFF" @click="handleValidateButtonClick">导出到磁盘</n-button>
      <n-button round color="#8a2be2" text-color="#FFF" @click="handleValidateButtonClickClip">导出到剪贴板</n-button>
    </n-space>
  </div>
</template>
<script lang="ts" setup>
import { getAIRule, selectAndWrite, writeClipboard, type RuleConfig } from '@/api/native'
import { useSpeed } from '@/store/checkSpeed';
import { getTvgLogoByName, message } from '@/utils/data';
import { sortByAIRuleOrder, splitChannelGroups } from '@/utils/groupRuleSort'
import { groupBy, map, uniqBy } from 'lodash';
import { FormRules } from 'naive-ui';
import { PropType } from 'vue';
import { M3UObject } from '../../../utils/file';
import { isString } from 'howtools';

const formRef = shallowRef()
const speed = useSpeed()
interface ModelType {
  type: "m3u" | "txt" | "txt-merge",
  isGroup: 1 | 0, // 1 : 分组 2: 普通 默认0: 分组 必须输入1或0 不然会报错
  speed: number,
  pixs: string[], //有效或者无效 true代表有效
  success: (0 | 1 | 2)[], // 0 无效源 1 有效源 2 待检测
}

const props = defineProps({
  data: {
    type: Array as PropType<M3UObject[]>,
    default: () => []
  }
})

const pixArray = computed<string[]>(() => map(uniqBy(props.data, "ratio"), (item) => item.ratio).filter(Boolean) as string[])
const minSpeed = computed<number>(() => Math.min(...map(props.data, (item) => Number(item.rSpeed?.replace('ms', '')) || 0).filter(n => n >= 0)))

const model = reactive<ModelType>({
  type: "m3u",
  isGroup: 1,
  speed: speed.timeout * 1000,
  pixs: [],
  success: [1]
})

async function exportM3u(_suffix: string, exportType: 'file' | 'clip' = 'file') {
  function _to_M3u(jData: M3UObject[]) {
    const lines: string[] = [
      `#EXTM3U x-tvg-url=http://epg.51zmt.top:8000/cc.xml,http://epg.51zmt.top:8000/difang.xml`,
    ];
    jData.forEach((item) => {
      const tvgId = getTvgLogoByName(item.name);
      if (tvgId) {
        lines.push(
          `#EXTINF:-1 tvg-id="${tvgId}" tvg-name="${tvgId}" ${model.isGroup ? 'group-title="' + item.group + '"' : ''},${item.name}\n${item.url}`
        );
      } else {
        lines.push(`#EXTINF:-1,${item.name}\n${item.url}`);
      }
    });
    return lines.join("\n");
  }

  // 按已排序数据的出现顺序建组，保证分组/节目顺序与 AI 规则一致
  function getGroupArray(jData: M3UObject[]) {
    const groupObj: Record<string, M3UObject[]> = {}
    const groupOrder: string[] = []
    jData.forEach((item) => {
      const group = item.group || '未知分组'
      if (!groupObj[group]) {
        groupObj[group] = []
        groupOrder.push(group)
      }
      groupObj[group].push(item)
    });
    return { groupObj, groupOrder }
  }

  function expandByGroups(items: M3UObject[]): M3UObject[] {
    const out: M3UObject[] = []
    for (const item of items) {
      const groups = splitChannelGroups(item.group)
      if (groups.length <= 1) {
        out.push({ ...item, group: groups[0] || item.group || '未知分组' })
        continue
      }
      for (const group of groups) {
        out.push({ ...item, group })
      }
    }
    return out
  }

  function _to_Text(jData: M3UObject[]) {
    const lines: string[] = [];
    const { groupObj, groupOrder } = getGroupArray(jData)
    for (const group of groupOrder) {
      const item = groupObj[group]
      if (model.isGroup) {
        lines.push(lines.length == 0 ? `${group},#genre#` : `\n${group},#genre#`)
      }
      lines.push(...item.map(it => `${it.name},${it.url}`))
    }
    return lines.join("\n");
  }

  function _to_Txt_Merge(jData: M3UObject[]) {
    const lines: string[] = []
    const { groupObj, groupOrder } = getGroupArray(jData)
    for (const group of groupOrder) {
      const item = groupObj[group]
      const dataGroupBy = groupBy(item, "name")
      if (model.isGroup) {
        lines.push(lines.length == 0 ? `${group},#genre#` : `\n${group},#genre#`)
      }
      for (const [name, arr] of Object.entries(dataGroupBy)) {
        lines.push(`${name},${arr.map(it => it.url).join("#").replace(/[\n\r]/g, "")}`)
      }
    }
    return lines.join("\n")
  }

  const title = "wtv++_" + new Date().getTime() + `.${_suffix.replaceAll("-merge", "").replaceAll("-origin", "")}`;

  const success = model.success.map(item => {
    if (item === 1) return true
    if (item === 0) return false
    if (item === 2) return undefined
  })

  const fixSpeed = (speed: unknown) => {
    if (speed == "-1") return -1
    if (isString(speed)) return Number(speed.replace("ms", ""))
    return -1
  }

  let rule: RuleConfig | null = null
  try {
    rule = await getAIRule()
  } catch {
    // 规则读取失败时仍按名称/分组兜底排序
  }

  const filtered = props.data
    .filter(item => model.pixs.includes(item.ratio as string))
    .filter(item => success.includes(item.success))
    .filter(item => model.speed > fixSpeed(item.rSpeed))
  const exportData = sortByAIRuleOrder(
    model.isGroup ? expandByGroups(filtered) : filtered,
    rule,
  )

  const type = _suffix as "m3u" | "txt" | "txt-merge"
  let content = ""
  if (type === "m3u") {
    content = _to_M3u(exportData)
  } else if (type === "txt") {
    content = _to_Text(exportData)
  } else if (type === "txt-merge") {
    content = _to_Txt_Merge(exportData)
  }

  if (exportType === 'clip') {
    await writeClipboard(content)
    message.success("文本已经成功复制到剪贴板")
    return
  }

  try {
    const path = await selectAndWrite(title, content)
    if (!path) return
    message.success("导出成功")
  } catch (e: any) {
    message.error(e?.message || "导出失败")
  }
}


function handleValidateButtonClick(e: MouseEvent) {
  e.preventDefault()
  formRef.value?.validate((errors) => {
    if (!errors) {
      void exportM3u(model.type)
    }
  })
}

function handleValidateButtonClickClip(e: MouseEvent) {
  e.preventDefault()
  formRef.value?.validate((errors) => {
    if (!errors) {
      void exportM3u(model.type, "clip")
    }
  })
}

const rules: FormRules = {
  type: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请选择'
  },
  pixs: {
    required: true,
    type: 'array',
    trigger: ['blur', 'input'],
    message: '请选择需要导出的分辨率'
  },
}
</script>
