import { h, ref, unref } from 'vue';
import { NTag, NButton, useNotification } from "naive-ui";
import { message, unique } from '@/utils/data';
import emitter from '@/utils/eventbus';
import { M3UObject } from '@/utils/file';
import { useSpeed } from '@/store/checkSpeed';
import { getVideoInfo } from '@/api/native';
import { useVideo } from '@/store/video';

export default function useM3uTable() {
    const check = useSpeed()
    const video = useVideo()

    const m3uData = ref<M3UObject[]>([])
    const notification = useNotification();
    const playDisabled = ref(false)

    // 右键位置
    const right = reactive<Record<string, any>>({
        row: {},
        rowProps: (row) => {
            return {
                onContextmenu: (e: MouseEvent) => {
                    e.preventDefault()
                    right.row = row
                }
            }
        }
    })


    //列表
    function copyText(text: string, id?: number) {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                notification.success({
                    title: "复制成功",
                    content: text,
                    duration: 1500
                });
            })
            .catch(() => {
                notification.error({
                    title: "复制失败",
                    content: text,
                    duration: 1500
                });
            });
    }

    const columns1SortOrder = ref<string | false>(false)

    const m3uColumns = computed(() => {
        return [
            {
                title: "名称",
                key: "name",
                width: 130,
                ellipsis: true,
                // sorter(rowA, rowB) {
                //     // m3uData.value.sort((rowA, rowB)=>-(rowA.name as string).localeCompare(rowB.name, 'zh-CN'))
                //     return -(rowA.name as string).localeCompare(rowB.name, 'zh-CN')
                // },
                sorter: true,
                sortOrder: columns1SortOrder.value,
                handleSorterChange,
                render(row: Record<string, string>, index: number) {
                    return h('span',
                        {
                            title: row.name,
                            style: {
                                minWidth: '120px',
                                display: 'inline-block',
                            },
                            ondblclick: () => {
                                m3uData.value.splice(index, 1)
                            }
                        },
                        row.name,
                    )
                },
            },
            {
                title: "链接",
                key: "url",
                ellipsis: true,
                render(row: Record<string, string>, index: number) {
                    return h('span',
                        {
                            title: row.url,
                        },
                        row.url,
                    )
                },
            },
            {
                title: "码率",
                key: "fps",
                width: 130,
                controlled: true,
            },
            {
                title: "分辨率",
                key: "ratio",
                width: 100,
            },
            {
                title: "响应速度",
                key: "rSpeed",
                width: 85,
                controlled: true,
            },
            {
                title: "分组",
                key: "group",
                ellipsis: true,
                width: 140,
                render(row: Record<string, string>) {
                    return h('span',
                        {
                            title: row.group,
                        },
                        row.group,
                    )
                },
            },
            {
                title: "状态",
                render(row: Record<string, unknown>) {
                    if (row.success === true) {
                        return h(
                            NTag,
                            {
                                type: "success",
                                size: "small",
                            },
                            {
                                default: () => "可用",
                            }
                        );
                    } else if (row.success === false) {
                        return h(
                            NTag,
                            {
                                type: "error",
                                size: "small",
                            },
                            {
                                default: () => "无效源",
                            }
                        );
                    } else {
                        return h(
                            NTag,
                            {
                                type: "warning",
                                size: "small",
                            },
                            {
                                default: () => "待检测",
                            }
                        );
                    }
                },
                width: 65
            },
            {
                title: "操作",
                render(row: Record<string, unknown>) {
                    return h('div', { style: "display:flex;gap: 5px" }, [
                        h(
                            NButton,
                            {
                                size: "small",
                                type: "primary",
                                onClick: () => copyText(row.url as string, row.id as number),
                            },
                            { default: () => "复制" }
                        ),
                        h(
                            NButton,
                            {
                                size: "small",
                                type: "info",
                                tertiary: true,
                                disabled: playDisabled.value,
                                onClick: () => {
                                    playDisabled.value = true;
                                    getVideoInfo(String(row.url), check.timeout * 1000).then((response) => {
                                        const stream = response.streams.find((item) => item.codecType === 'video' && item.width > 0 && item.height > 0)
                                        const info = stream ? { width: stream.width, height: stream.height, fps: stream.frameRate, codec: stream.codecName } : undefined
                                        if (info) {
                                            video.url = row.url
                                            video.toggle()
                                        } else {
                                            message.error("视频播放失败...")
                                        }
                                        playDisabled.value = false;
                                    }).catch(()=>{
                                        playDisabled.value = false;
                                    })
                                },
                            },
                            { default: () => "播放" }
                        )
                    ]);
                },
                width: 115
            },
        ]
    }) as any;

    function clearUnSuccessM3uData() {
        const unsucessArr = unref(m3uData).filter(item => item.success !== false)
        m3uData.value = unsucessArr
        notification.success({
            title: "提示!!!",
            content: "无效源全部清除完成",
            duration: 1500
        })
    }

    function removeDuplicationM3uData() {
        const _backm3u: unknown[] = [...unref(m3uData)]
        m3uData.value = unique(_backm3u, "url").map(item => {
            item.ratio = "未知"
            return item
        })
    }

    function rSpeedOrderBy() {
        const data = [...m3uData.value]
        const no_check_and_viod: any = [] // 未检测或者无效源
        const sData: any = [] //要排序的数据
        data.forEach(item => {
            const r = (item.rSpeed || "").replace("ms", "")
            if (r === "-1" || !r) {
                no_check_and_viod.push(item)
            } else {
                sData.push(item)
            }
        })
        sData.sort((a, b) => {
            const start = (a.rSpeed || "").replace("ms", "")
            const end = (b.rSpeed || "").replace("ms", "")
            return Number(start) - Number(end)
        })

        m3uData.value = [...sData, ...no_check_and_viod]
    }

    let normalData: any[] = []
    function handleSorterChange(sorter: { columnKey: 'name', sorter: boolean, order: 'descend' | 'ascend' | false }) {
        // 备份正常排序
        if (normalData.length === 0) normalData = [...m3uData.value]
        columns1SortOrder.value = sorter.order;
        const data = [...m3uData.value]
        if (sorter.order) {
            data.sort((rowA, rowB) => {
                if (sorter.order === 'ascend') {
                    return (rowA.name as string).localeCompare(rowB.name, 'zh-CN')
                } else {
                    return -(rowA.name as string).localeCompare(rowB.name, 'zh-CN')
                }
            })
            m3uData.value = data
        } else {
            // 没有排序状态时排序
            m3uData.value = [...normalData]
            normalData.length = 0
        }
    }

    const rowProps = (row: any) => {
        return {
            onContextmenu: (e: MouseEvent) => {
                emitter.emit("table-select-row", row)
                e.preventDefault()
            }
        }
    }

    return { m3uColumns, m3uData, right, clearUnSuccessM3uData, removeDuplicationM3uData, rSpeedOrderBy, handleSorterChange }
}
