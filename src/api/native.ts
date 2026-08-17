// Wails 3 beta currently generates JavaScript bindings with JSDoc types.
// Keep the generated import behind this small adapter until the generator
// emits TypeScript declarations directly.
// @ts-ignore Generated Wails binding has no .d.ts file.
import { FFmpegService, StoreService, FileService, ClipboardService } from '../../frontend/bindings/wtv/services/index.js'

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
