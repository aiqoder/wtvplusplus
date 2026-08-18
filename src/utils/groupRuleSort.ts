import type { RuleConfig, RuleGroup } from '@/api/native'

export const UNKNOWN_GROUP = '未知分组'
const RANK_EXTRA = 1_000_000
const RANK_UNKNOWN = 2_000_000

export type RuleIndex = {
  groupRank: Map<string, number>
  nameRank: Map<string, Map<string, number>>
  nameToGroups: Map<string, string[]>
}

export function buildRuleIndex(groups: RuleGroup[] | undefined): RuleIndex {
  const groupRank = new Map<string, number>()
  const nameRank = new Map<string, Map<string, number>>()
  const nameToGroups = new Map<string, string[]>()
  let groupPos = 0

  for (const g of groups || []) {
    const name = String(g?.name || '').trim()
    if (!name || name === UNKNOWN_GROUP) continue
    if (!groupRank.has(name)) {
      groupRank.set(name, groupPos++)
    }
    if (!nameRank.has(name)) nameRank.set(name, new Map())
    const channelRanks = nameRank.get(name)!
    let channelPos = channelRanks.size
    for (const raw of g.channels || []) {
      const channel = String(raw || '').trim()
      if (!channel) continue
      const owned = nameToGroups.get(channel)
      if (!owned) {
        nameToGroups.set(channel, [name])
      } else if (!owned.includes(name)) {
        owned.push(name)
      }
      if (!channelRanks.has(channel)) {
        channelRanks.set(channel, channelPos++)
      }
    }
  }

  return { groupRank, nameRank, nameToGroups }
}

function groupKey(idx: RuleIndex, name: string): number {
  const g = String(name || '').trim()
  if (!g || g === UNKNOWN_GROUP) return RANK_UNKNOWN
  return idx.groupRank.get(g) ?? RANK_EXTRA
}

function channelKey(idx: RuleIndex, group: string, name: string): number {
  const ranks = idx.nameRank.get(String(group || '').trim())
  if (!ranks) return RANK_EXTRA
  return ranks.get(String(name || '').trim()) ?? RANK_EXTRA
}

/**
 * 节目名精确匹配到的全部分组（规则表顺序）。
 */
export function matchExactGroupsByIndex(
  channelName: string,
  idx?: RuleIndex | null,
): string[] {
  const name = String(channelName || '').trim()
  if (!name || !idx) return []
  const groups = idx.nameToGroups.get(name)
  return groups?.length ? [...groups] : []
}

/**
 * 节目名与规则表精确相等时返回分组。
 * 一名可属多组：当前分组仍在候选中则保留，否则取规则表中首次出现的分组。
 */
export function matchExactGroupByIndex(
  channelName: string,
  idx?: RuleIndex | null,
  currentGroup?: string,
): string | undefined {
  const groups = matchExactGroupsByIndex(channelName, idx)
  if (!groups.length) return undefined
  const current = String(currentGroup || '').trim()
  if (current && groups.includes(current)) return current
  return groups[0]
}

export function matchExactGroupByRule(
  channelName: string,
  rule?: RuleConfig | null,
  currentGroup?: string,
): string | undefined {
  return matchExactGroupByIndex(channelName, buildRuleIndex(rule?.groups), currentGroup)
}

/** 逗号分隔的多分组拆成独立分组名 */
export function splitChannelGroups(group?: string): string[] {
  return String(group || '')
    .split(',')
    .map((g) => g.trim())
    .filter(Boolean)
}

/** 按 AI 规则：分组顺序 → 组内节目顺序；未知分组靠后，规则外名称保持相对稳定 */
export function sortByAIRuleOrder<T extends { name: string; group?: string }>(
  items: T[],
  rule?: RuleConfig | null,
): T[] {
  const idx = buildRuleIndex(rule?.groups)
  return [...items].sort((a, b) => {
    const ga = splitChannelGroups(a.group)[0] || UNKNOWN_GROUP
    const gb = splitChannelGroups(b.group)[0] || UNKNOWN_GROUP
    const gka = groupKey(idx, ga)
    const gkb = groupKey(idx, gb)
    if (gka !== gkb) return gka - gkb
    if (ga !== gb) return ga.localeCompare(gb, 'zh-CN')

    const cka = channelKey(idx, ga, a.name)
    const ckb = channelKey(idx, gb, b.name)
    if (cka !== ckb) return cka - ckb
    return a.name.localeCompare(b.name, 'zh-CN')
  })
}
