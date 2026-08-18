<template>
    <div class="pd flex">
        <div class="playlist-side">
            <div class="playlist-toolbar">
                <n-button
                    class="playlist-toolbar-btn"
                    size="tiny"
                    type="primary"
                    secondary
                    :loading="aiGrouping"
                    :disabled="!hasChannels || aiGrouping"
                    :title="regroupButtonTitle"
                    @click="handleRegroup"
                >
                    <template #icon>
                        <n-icon><RefreshOutline /></n-icon>
                    </template>
                    {{ regroupButtonLabel }}
                </n-button>
                <n-button
                    class="playlist-toolbar-btn"
                    size="tiny"
                    secondary
                    :disabled="!hasChannels || aiGrouping"
                    @click="showExportVisible = true"
                >
                    <template #icon>
                        <n-icon><DownloadOutline /></n-icon>
                    </template>
                    导出数据
                </n-button>
            </div>
            <div class="playlist-scroll">
                <n-collapse arrow-placement="right" accordion>
                    <n-collapse-item
                        v-for="g in groupList"
                        :key="g.group"
                        :title="`【${g.group}】`"
                        :name="g.group"
                    >
                        <n-list hoverable clickable>
                            <n-list-item
                                v-for="a in g.items"
                                :key="`${g.group}-${a.name}-${a.url}`"
                                :class="{ color: currentName == a.name }"
                                @click="handleDeboucePlay(a)"
                            >
                                {{ a.name }}
                            </n-list-item>
                        </n-list>
                    </n-collapse-item>
                </n-collapse>
            </div>
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

        <n-modal
            v-model:show="showExportVisible"
            :mask-closable="false"
            preset="card"
            title="导出播放列表"
            :style="{ width: '520px' }"
        >
            <ExportPlaylistModal :groups="groupList" />
        </n-modal>
    </div>
</template>
<script setup lang="ts">
import {
    cancelProbes,
    getVideoInfo,
    listPlaylistGrouped,
    rematchPlaylistByRule,
    stopPlayback,
    type PlaylistGroup,
    type PlaylistItem,
} from '@/api/native'
import VideoPlayer from './VideoPlayer.vue'
import ExportPlaylistModal from './ExportPlaylistModal.vue'
import AIGroupProgressModal from '@/components/AIGroupProgressModal.vue'
import { useLoadingBar, useMessage, useNotification } from 'naive-ui'
import { Warning, RefreshOutline, DownloadOutline } from '@vicons/ionicons5'
import { useToggle } from '@vueuse/core'
import { debounce } from 'lodash-es'
import { applyAIGroupToUnknown } from '@/utils/aiGroup'

const [failVisible, toogleFail] = useToggle()
const failUrls = ref<{ name: string; url: string }[]>([])

const loadingBar = useLoadingBar()
const message = useMessage()
const notification = useNotification()
const msg = ref('')
const groupList = ref<PlaylistGroup[]>([])
const showExportVisible = ref(false)
const currentName = ref()
const aiGrouping = ref(false)
const aiGroupAbort = ref<AbortController | null>(null)
const aiGroupProgress = reactive({
    done: 0,
    total: 0,
    message: '',
})

const hasChannels = computed(() =>
    groupList.value.some((g) => (g.items || []).length > 0),
)

const onlyUnknownGroup = computed(() => {
    const withItems = groupList.value.filter((g) => (g.items || []).length > 0)
    return withItems.length > 0 && withItems.every((g) => g.group === '未知分组')
})

const regroupButtonLabel = computed(() =>
    onlyUnknownGroup.value ? 'AI一键分组' : '重新分组',
)

const regroupButtonTitle = computed(() =>
    onlyUnknownGroup.value
        ? '对未知分组进行 AI 分组'
        : '按规则回填分组，再对未知分组做 AI 分组',
)

function unknownItems(): PlaylistItem[] {
    const group = groupList.value.find((g) => g.group === '未知分组')
    return (group?.items || []).map((item) => ({
        name: item.name,
        url: item.url,
        group: '未知分组',
    }))
}

async function loadGroups() {
    const list = await listPlaylistGrouped()
    groupList.value = list || []
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
    currentName.value = undefined
    void cancelProbes()
    void stopPlayback()
    loadingBar.finish()
})

const currentUrl = ref()
const currentInfo = ref({})

function cancelAIGroup() {
    if (!aiGroupAbort.value) return
    aiGroupProgress.message = '正在取消…'
    aiGroupAbort.value.abort()
}

async function runAIOnUnknown(prefixMessage?: string) {
    const items = unknownItems()
    if (!items.length) {
        return { updated: 0, cancelled: false, skipped: true as const }
    }

    aiGroupProgress.done = 0
    aiGroupProgress.total = 0
    aiGroupProgress.message = prefixMessage || '准备 AI 分组…'
    const controller = new AbortController()
    aiGroupAbort.value = controller

    const result = await applyAIGroupToUnknown(items, {
        signal: controller.signal,
        onProgress: (p) => {
            aiGroupProgress.done = p.done
            aiGroupProgress.total = p.total
            aiGroupProgress.message = p.message
        },
    })
    return { ...result, skipped: false as const }
}

async function handleRegroup() {
    if (!hasChannels.value || aiGrouping.value) return

    aiGrouping.value = true
    aiGroupProgress.done = 0
    aiGroupProgress.total = 0
    aiGroupProgress.message = '正在按规则整理分组…'

    try {
        const rematch = await rematchPlaylistByRule()
        await loadGroups()

        const unknownCount = unknownItems().length
        if (!unknownCount) {
            message.success(
                rematch.updated > 0
                    ? `已按规则整理，更新 ${rematch.updated} 条`
                    : '分组已与规则一致，无需调整',
            )
            return
        }

        const { updated, cancelled, skipped } = await runAIOnUnknown(
            `已整理 ${rematch.updated} 条，正在对未知分组进行 AI 分组…`,
        )
        await loadGroups()

        if (skipped) {
            message.success(`已按规则整理，更新 ${rematch.updated} 条`)
            return
        }
        if (cancelled) {
            message.info(
                updated > 0
                    ? `本地已整理 ${rematch.updated} 条，AI 已取消（已更新 ${updated} 条）`
                    : `本地已整理 ${rematch.updated} 条，AI 已取消`,
            )
            return
        }
        message.success(
            `重新分组完成：本地更新 ${rematch.updated} 条，AI 更新 ${updated} 条`,
        )
    } catch (err: any) {
        await loadGroups().catch(() => {})
        notification.warning({
            title: '重新分组失败',
            content: err?.message || '请检查规则与 AI 设置',
            duration: 3500,
        })
    } finally {
        aiGroupAbort.value = null
        aiGrouping.value = false
    }
}

async function handlePlay(a: PlaylistItem) {
    currentName.value = a.name
    const url = a.url
    const urls = url.split('#')
    msg.value = `发现${urls.length}个链接，正在尝试解析...`

    for (const [index, u] of urls.entries()) {
        if (a.name != currentName.value) {
            return
        }
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
            msg.value = '解析完成，正在尝试获取流信息...'
            currentUrl.value = u
            currentInfo.value = info
            setTimeout(() => {
                msg.value = ''
            }, 1000)
            break
        } else {
            failUrls.value.push({ name: a.name, url: u })
        }
        msg.value = `链接：${u} 解析失败，正在尝试获取下一个链接...`

        if (index === urls.length - 1) {
            msg.value = '没有找到可用的视频，请尝试别的链接'
        }
    }

    if (!currentUrl.value) {
        msg.value = '没有找到合适的链接，请尝试别的链接'
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

.playlist-side {
    width: 220px;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.playlist-toolbar {
    display: flex;
    gap: 6px;
    padding: 0 4px;
    width: 100%;
    box-sizing: border-box;
    flex-shrink: 0;
}

.playlist-toolbar-btn {
    flex: 1 1 0;
    min-width: 0;
}

.playlist-scroll {
    flex: 1;
    min-height: 0;
    overflow: auto;
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
