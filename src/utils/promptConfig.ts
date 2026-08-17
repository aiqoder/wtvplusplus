export interface RuleGroup {
  name: string
  channels: string[]
}

export interface RuleConfig {
  groups: RuleGroup[]
}

export const defaultGroupOptions = [
  '央视频道', '卫视频道', '数字频道', '电影轮播', '剧集轮播', '咪咕直播',
  '广东地区', '北京地区', '上海地区', '湖南地区', '浙江地区', '江苏地区',
  '山东地区', '四川地区', '河南地区', '湖北地区', '福建地区', '安徽地区',
  '河北地区', '辽宁地区', '陕西地区', '黑龙江地区', '吉林地区', '甘肃地区',
  '山西地区', '江西地区', '广西地区', '云南地区', '贵州地区', '海南地区',
  '宁夏地区', '青海地区', '新疆地区', '西藏地区', '内蒙古地区', '天津地区',
  '重庆地区', '台湾地区', '香港地区', '澳门地区', '纪录影片', '央视春晚', '未知分组',
]

export interface GroupEdit {
  id: number
  name: string
  channelsText: string
}

let nextGroupId = 0

export function createGroupEdit(group?: RuleGroup): GroupEdit {
  return {
    id: nextGroupId++,
    name: group?.name ?? '',
    channelsText: (group?.channels ?? []).join('\n'),
  }
}

export function parseChannelNames(text: string): string[] {
  const result: string[] = []
  const seen = new Set<string>()
  for (const line of text.split(/\n/)) {
    for (const part of line.split('#')) {
      const name = part.trim()
      if (!name || seen.has(name)) continue
      seen.add(name)
      result.push(name)
    }
  }
  return result
}

export function groupsToEdits(groups: RuleGroup[]): GroupEdit[] {
  return groups.map((g) => createGroupEdit(g))
}

export function editsToGroups(edits: GroupEdit[]): RuleGroup[] {
  const out: RuleGroup[] = []
  for (const g of edits) {
    const name = g.name.trim()
    if (!name) continue
    const channels = parseChannelNames(g.channelsText)
    if (channels.length === 0) continue
    out.push({ name, channels })
  }
  return out
}

export function groupOptionsFromConfig(config: RuleConfig) {
  const set = new Set(defaultGroupOptions)
  for (const g of config.groups ?? []) {
    if (g.name) set.add(g.name)
  }
  return [...set]
}
