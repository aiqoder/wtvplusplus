# Wails 3 迁移状态

当前入口为根目录 `main.go`，前端仍复用原有 `src` 目录。

## 本地构建

```bash
npm install
npm run build:wails:frontend
wails3 generate bindings
wails3 build
```

macOS 的 FFmpeg 原生库位于 `native/ffmpeg`，通过 cgo 链接 `libavformat`、`libavcodec` 和 `libavutil`。当前已实现原生视频流探测、版本读取、播放转封装和 WebSocket 输出。
