import echarts from 'echarts/lib/echarts';
import 'echarts/lib/component/legend'
import 'echarts/lib/component/tooltip'

import type { EChartOption } from "echarts"
import { onMounted, nextTick } from "@vue/composition-api"
import type { Ref } from "@vue/composition-api"

export default function useECharts(el: Ref<HTMLDivElement>,
    theme: 'light' | 'dark' | 'default' = 'dark') {

    //echarts图实例
    let echartInstance: NonNullable<any> = null;

    //初始化echarts图
    onMounted(() => {
        if (!el.value) return
        echartInstance = echarts.init(el.value, theme);
    })

    //设置默认样式数据
    const defaultOption: EChartOption = {
        backgroundColor: theme == 'dark' ? 'rgba(0,0,0,0)' : 'rgba(255,555,255)'
    }

    function addDefaultOption(option: EChartOption) {
        Object.assign(defaultOption, option)
    }


    async function setOption(option: EChartOption) {
        if (!el.value) {
            await nextTick();
            echartInstance = echarts.init(el.value, theme);
        }
        if (!echartInstance) throw new Error("echarts 实例没有创建成功");

        echartInstance?.setOption(Object.assign(defaultOption, option), true)
    }


    function resize() {
        echartInstance?.resize()
    }

    return {
        addDefaultOption,
        setOption,
        resize,
        echartInstance
    }
}
