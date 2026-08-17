// Wails 3 beta currently generates JavaScript bindings with JSDoc types.
// Keep the generated import behind this small adapter until the generator
// emits TypeScript declarations directly.
// @ts-ignore Generated Wails binding has no .d.ts file.
import { FFmpegService, StoreService, FileService, ClipboardService, AIService, PlaylistService } from '../../frontend/bindings/wtv/services/index.js'

export interface NativeVideoStream {
  index: number
  codecName: string
  codecType: string
  width: number
  height: number
  frameRate: number
  pixelFormat: string
}

export interface NativeVideoInfo {
  formatName: string
  duration: number
  bitrate: number
  streams: NativeVideoStream[]
}

export function getVideoInfo(url: string, timeoutMs = 8000): any {
  return FFmpegService.GetVideoInfo(url, timeoutMs)
}

export function getStore(key: string): Promise<any> {
  return StoreService.Get(key)
}

export function setStore(key: string, value: any): Promise<void> {
  return StoreService.Set(key, value)
}

export interface AISettings {
  baseUrl: string
  apiKey: string
  model: string
  overwriteImportGroup: boolean
}

export interface ClassifyResult {
  index: number
  displayName: string
  group: string
}

export function getAISettings(): Promise<AISettings> {
  return AIService.GetSettings()
}

export function saveAISettings(settings: AISettings): Promise<void> {
  return AIService.SaveSettings(settings)
}

export function listAIModels(baseUrl: string, apiKey: string): Promise<string[]> {
  return AIService.ListModels(baseUrl, apiKey)
}

export function classifyChannels(names: string[]): Promise<ClassifyResult[]> {
  return AIService.ClassifyChannels(names)
}

export interface RuleGroup {
  name: string
  channels: string[]
}

export interface RuleConfig {
  groups: RuleGroup[]
}

export function getAIRule(): Promise<RuleConfig> {
  return AIService.GetRule()
}

export function getDefaultAIRule(): Promise<RuleConfig> {
  return AIService.GetDefaultRule()
}

export function saveAIRule(rule: RuleConfig): Promise<void> {
  return AIService.SaveRule(rule)
}

export function hasCustomAIRule(): Promise<boolean> {
  return AIService.HasCustomRule()
}

export function resetAIRule(): Promise<void> {
  return AIService.ResetRule()
}

export interface PlaylistChannelInput {
  name: string
  url: string
  group?: string
  width?: number
  height?: number
  fps?: number
  speed?: number
  codec?: string
}

export interface PlaylistItem {
  name: string
  url: string
  group: string
}

export interface PlaylistGroup {
  group: string
  items: PlaylistItem[]
}

export function upsertPlaylistChannel(input: PlaylistChannelInput): Promise<void> {
  return PlaylistService.Upsert(input)
}

export function listPlaylistGrouped(): Promise<PlaylistGroup[]> {
  return PlaylistService.ListGrouped()
}

export function clearPlaylist(): Promise<void> {
  return PlaylistService.Clear()
}

export function readFile(path: string): Promise<string> {
  return FileService.Read(path)
}

export function selectAndRead(): Promise<{ path: string, data: string }> {
  return FileService.SelectAndRead()
}

export function writeFile(path: string, data: string): Promise<void> {
  return FileService.Write(path, data)
}

export function readClipboard(): Promise<string> {
  return ClipboardService.ReadText()
}

export function writeClipboard(text: string): Promise<void> {
  return ClipboardService.WriteText(text)
}

export function getStreamURL(): Promise<string> {
  return FFmpegService.StreamURL()
}

export function startPlayback(url: string): Promise<void> {
  return FFmpegService.StartPlayback(url)
}

export function stopPlayback(): Promise<void> {
  return FFmpegService.StopPlayback()
}

export function cancelProbes(): Promise<void> {
  return FFmpegService.CancelProbes()
}
