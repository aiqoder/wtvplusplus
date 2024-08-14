<template>
    <div class=" fixed w-[180px] bg-[#8a2be2] p-2 rounded z-36 select-none" ref="target" :style="style">
        <n-tabs placement="left">
            <n-tab-pane tab="嗅源神探" name="1">
                <n-button class=" h-full w-full" type="primary" v-if="!detectiveVisible" @click="startDetective(!detectiveVisible)">开启</n-button>
                <n-button class=" h-full w-full" type="primary" v-else @click="startDetective(!detectiveVisible)">关闭</n-button>
            </n-tab-pane>
            <n-tab-pane tab="自主检测" name="2">
                <n-button class=" h-full w-full" type="primary" v-if="!autocheckVisible" @click="startAutocheck(!autocheckVisible)">开启</n-button>
                <n-button class=" h-full w-full" type="primary" v-else @click="startAutocheck(!autocheckVisible)">关闭</n-button>
            </n-tab-pane>
        </n-tabs>
    </div>
    <div class=" fixed bg-[rgba(0,0,0,.5)] z-35 cursor-not-allowed" style=" inset: 0;">

    </div>
</template>
<script lang="ts" setup>
import { useDraggable, useToggle } from '@vueuse/core';
const target = ref()
const { style } = useDraggable(target)
const [detectiveVisible, toogleDetective] = useToggle() // 嗅源神探
const [autocheckVisible, toogleAutocheck] = useToggle() // 自主检测

function startDetective(toggle){
    toogleDetective(toggle)
}

function startAutocheck(toggle){
    toogleAutocheck(toggle)
}
</script>