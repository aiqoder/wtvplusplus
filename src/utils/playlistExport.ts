import type { PlaylistGroup } from '@/api/native'
import { getTvgLogoByName } from '@/utils/data'

export type PlaylistExportFormat = 'm3u' | 'txt' | 'txt-merge'

function splitURLs(url: string): string[] {
  return String(url || '')
    .split('#')
    .map((u) => u.trim())
    .filter(Boolean)
}

function flatten(groups: PlaylistGroup[]): { name: string; url: string; group: string }[] {
  const rows: { name: string; url: string; group: string }[] = []
  for (const g of groups || []) {
    for (const item of g.items || []) {
      rows.push({ name: item.name, url: item.url, group: g.group || item.group || '未知分组' })
    }
  }
  return rows
}

function toM3u(groups: PlaylistGroup[], grouped: boolean): string {
  const lines: string[] = [
    '#EXTM3U x-tvg-url=http://epg.51zmt.top:8000/cc.xml,http://epg.51zmt.top:8000/difang.xml',
  ]
  for (const item of flatten(groups)) {
    const urls = splitURLs(item.url)
    const tvgId = getTvgLogoByName(item.name)
    for (const url of urls) {
      if (tvgId) {
        const groupAttr = grouped ? ` group-title="${item.group}"` : ''
        lines.push(`#EXTINF:-1 tvg-id="${tvgId}" tvg-name="${tvgId}"${groupAttr},${item.name}`)
      } else {
        lines.push(`#EXTINF:-1,${item.name}`)
      }
      lines.push(url)
    }
  }
  return lines.join('\n')
}

function toTxt(groups: PlaylistGroup[], grouped: boolean, merge: boolean): string {
  const lines: string[] = []
  for (const g of groups || []) {
    const items = g.items || []
    if (!items.length) continue
    if (grouped) {
      lines.push(lines.length === 0 ? `${g.group},#genre#` : `\n${g.group},#genre#`)
    }
    for (const item of items) {
      if (merge) {
        const joined = splitURLs(item.url).join('#').replace(/[\n\r]/g, '')
        if (joined) lines.push(`${item.name},${joined}`)
      } else {
        for (const url of splitURLs(item.url)) {
          lines.push(`${item.name},${url}`)
        }
      }
    }
  }
  return lines.join('\n')
}

export function formatPlaylistExport(
  groups: PlaylistGroup[],
  format: PlaylistExportFormat,
  grouped = true,
): string {
  if (format === 'm3u') return toM3u(groups, grouped)
  if (format === 'txt-merge') return toTxt(groups, grouped, true)
  return toTxt(groups, grouped, false)
}

export function playlistExportFilename(format: PlaylistExportFormat): string {
  const suffix = format === 'txt-merge' ? 'txt' : format
  return `wtv++_playlist_${Date.now()}.${suffix}`
}
