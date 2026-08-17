# Wails 3 迁移状态

当前入口为根目录 `main.go`，前端仍复用原有 `src` 目录。

## 本地构建

```bash
npm install
npm run build:wails:frontend
wails3 generate bindings
wails3 build
```

## 原生 FFmpeg

探测 / 版本 / 播放转封装通过 cgo 链接 `libavformat`、`libavcodec`、`libavutil`：

| 平台 | 库路径 | 获取方式 |
|------|--------|----------|
| macOS | `native/ffmpeg` | 仓库已包含 dylib |
| Linux | `native/ffmpeg/linux` | `bash scripts/fetch-ffmpeg.sh linux amd64` |
| Windows | `native/ffmpeg/windows` | `bash scripts/fetch-ffmpeg.sh windows amd64` |

Windows / Linux 使用 [BtbN/FFmpeg-Builds](https://github.com/BtbN/FFmpeg-Builds) 的 `n5.1` `lgpl-shared` 构建，与现有 macOS 5.x ABI 对齐。打包时会把对应 `.so` / `.dll` 一并打进安装包。

若本机访问 GitHub 较慢，可设置镜像后再拉取，例如：

```bash
export FFMPEG_DOWNLOAD_BASE="https://ghproxy.net/https://github.com/BtbN/FFmpeg-Builds/releases/download/autobuild-2025-01-31-12-58"
bash scripts/fetch-ffmpeg.sh linux amd64
```

Windows 构建需启用 CGO（MinGW GCC）。GitHub Actions 的 `build.yml` 已覆盖三端打包。
