<template>
    <div class="pd flex">
        <div style="width: 200px;overflow: auto;">
            <n-collapse arrow-placement="right" accordion>
                <n-collapse-item :title="`【${g}】`" :name="g" v-for="(arr, g) in groups" :key="g">
                    <template v-if="g === '未知分组'" #header-extra>
                        <n-button
                            size="tiny"
                            quaternary
                            type="primary"
                            :loading="aiGrouping"
                            :disabled="!arr.length || aiGrouping"
                            title="对未知分组进行 AI 分组"
                            @click.stop="handleAIGroupUnknown"
                        >
                            <template #icon>
                                <n-icon>
                                    <SparklesOutline />
                                </n-icon>
                            </template>
                            AI
                        </n-button>
                    </template>
                    <n-list hoverable clickable>
                        <n-list-item v-for="a in arr" @click="handleDeboucePlay(a)"
                            :class="{ 'color': currentName == a.name }">{{ a.name }}</n-list-item>
                    </n-list>
                </n-collapse-item>
            </n-collapse>
        </div>
        <div class="flex-1 bg-black flex flex-col justify-center items-center overflow-hidden pos-relative">
            <span class=" pos-absolute pos-top-0" style="color: aliceblue" v-if="msg">{{ msg }} {{ currentInfo }}</span>
            <span class=" pos-absolute pos-bottom-0 text-white" v-if="currentUrl">当前正在播放：{{ currentUrl }}</span>
            <div v-if="failUrls.length > 0" class=" pos-absolute pos-bottom-0 pos-right-0 text-white cursor-pointer"  title="播放失败清单" @click="toogleFail()">
                <Warning class="w-3rem text-red"/>
            </div>
            <div v-show="failVisible" class=" pos-absolute pos-inset-0 pos-bottom-[3rem] pos-top-2xl text-white p-1 overflow-auto z-10 bg-[rgba(0,0,0,.8)]">
                <div v-for="f in failUrls" class=" text-nowrap text-ellipsis overflow-hidden whitespace-nowrap">
                    {{ f.name }},{{ f.url }}
                </div>
            </div>
            <VideoPlayer :url="currentUrl" :info="currentInfo" />
        </div>

        <AIGroupProgressModal
            :show="aiGrouping"
            :running="aiGrouping"
            :done="aiGroupProgress.done"
            :total="aiGroupProgress.total"
            :message="aiGroupProgress.message"
            @cancel="cancelAIGroup"
        />
    </div>
</template>
<script setup lang="ts">
import { getVideoInfo, listPlaylistGrouped } from '@/api/native'
import VideoPlayer from "./VideoPlayer.vue"
import AIGroupProgressModal from '@/components/AIGroupProgressModal.vue'
import { useLoadingBar, useMessage, useNotification } from 'naive-ui'
import { Warning, SparklesOutline } from "@vicons/ionicons5"
import { useToggle } from '@vueuse/core'
import { debounce } from "lodash-es"
import { applyAIGroupToUnknown } from '@/utils/aiGroup'

const [failVisible, toogleFail] = useToggle()
const failUrls = ref<any[]>([])

const loadingBar = useLoadingBar()
const message = useMessage()
const notification = useNotification()
const msg = ref("")
const groups = ref<Record<string, { name: string; url: string }[]>>({})
const currentName = ref()
const aiGrouping = ref(false)
const aiGroupAbort = ref<AbortController | null>(null)
const aiGroupProgress = reactive({
    done: 0,
    total: 0,
    message: '',
})

async function loadGroups() {
    const list = await listPlaylistGrouped()
    const xgroup: Record<string, { name: string; url: string }[]> = {}
    for (const g of list || []) {
        xgroup[g.group] = (g.items || []).map((item) => ({
            name: item.name,
            url: item.url,
        }))
    }
    groups.value = xgroup
}

onMounted(async () => {
    loadingBar.start()
    try {
        await loadGroups()
    } catch (err: any) {
        msg.value = err?.message || '加载播放列表失败'
    } finally {
        loadingBar.finish()
    }
})

onUnmounted(() => {
    aiGroupAbort.value?.abort()
    loadingBar.finish()
})


const currentUrl = ref()
const currentInfo = ref({})

function cancelAIGroup() {
    if (!aiGroupAbort.value) return
    aiGroupProgress.message = '正在取消…'
    aiGroupAbort.value.abort()
}

async function handleAIGroupUnknown(e?: Event) {
    e?.stopPropagation?.()
    const unknownItems = groups.value['未知分组'] || []
    if (!unknownItems.length || aiGrouping.value) return

    aiGrouping.value = true
    aiGroupProgress.done = 0
    aiGroupProgress.total = 0
    aiGroupProgress.message = '准备 AI 分组…'
    const controller = new AbortController()
    aiGroupAbort.value = controller

    try {
        const { updated, cancelled } = await applyAIGroupToUnknown(
            unknownItems.map((item) => ({ ...item, group: '未知分组' })),
            {
                signal: controller.signal,
                onProgress: (p) => {
                    aiGroupProgress.done = p.done
                    aiGroupProgress.total = p.total
                    aiGroupProgress.message = p.message
                },
            },
        )
        await loadGroups()
        if (cancelled) {
            message.info(updated > 0 ? `已取消，已更新 ${updated} 条` : '已取消 AI 分组')
        } else {
            message.success(updated > 0 ? `AI 分组完成，更新 ${updated} 条` : '没有需要更新的分组')
        }
    } catch (err: any) {
        await loadGroups().catch(() => {})
        notification.warning({
            title: 'AI 分组失败',
            content: err?.message || '请检查 AI 设置',
            duration: 3500,
        })
    } finally {
        aiGroupAbort.value = null
        aiGrouping.value = false
    }
}

async function handlePlay(a) {
    currentName.value = a.name
    const url = a.url
    const urls = url.split("#")
    msg.value = `发现${urls.length}个链接，正在尝试解析...`

    for (const [index, u] of urls.entries()) {
        // 切换链接，原先的不继续检测
        if(a.name != currentName.value) {
            return
        }
        // 排除空连接
        if (!u) continue
        const response = await getVideoInfo(u, 5 * 1000)
        const stream = response.streams.find((item) => item.codecType === 'video' && item.width > 0 && item.height > 0)
        const info = stream ? {
            width: stream.width,
            height: stream.height,
            fps: stream.frameRate,
            codec: stream.codecName,
        } : undefined
        msg.value = `正在解析第${index + 1}视频，链接：${u}，正在尝试获取流信息...`
        if (info) {
            msg.value = "解析完成，正在尝试获取流信息..."
            currentUrl.value = u
            currentInfo.value = info
            setTimeout(() => {
                msg.value = ""
            }, 1000)
            break;
        }else {
            failUrls.value.push({name: a.name, url: u})
        }
        msg.value = `链接：${u} 解析失败，正在尝试获取下一个链接...`

        if (index === urls.length - 1) {
            msg.value = `没有找到可用的视频，请尝试别的链接`
        }
    }

    if (!currentUrl.value) {
        msg.value = `没有找到合适的链接，请尝试别的链接`
    }
}

const handleDeboucePlay = debounce(handlePlay, 400)
</script>
<style lang="scss" scoped>
.pd {
    padding: 0.5rem;
    height: calc(100vh - 20px);
}

.flex {
    display: flex;
}

.flex-1 {
    flex-grow: 1;
    width: 0;
}

.align-center {
    align-items: center;
}

.bg-black {
    background: black;
    min-height: 100%;
}

.color {
    color: #8a2be2;
    font-weight: 600
}

:global(.n-collapse-item__header-main) {
    justify-content: space-between;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
}
</style>
