#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_NAME="${APP_NAME:-wtvplusplus}"
VERSION="${VERSION:-${APP_VERSION:-0.0.0}}"
BIN_DIR="${BIN_DIR:-bin}"
DIST_DIR="${DIST_DIR:-dist}"
ARCH="${GOARCH:-$(uname -m)}"
case "$ARCH" in
  x86_64|amd64) ARCH="amd64" ;;
  aarch64|arm64) ARCH="arm64" ;;
esac

cd "$ROOT_DIR"
mkdir -p "$DIST_DIR"

BIN="$BIN_DIR/$APP_NAME"
if [[ ! -f "$BIN" ]]; then
  echo "Missing Linux binary: $BIN" >&2
  exit 1
fi

FFMPEG_LIB="$ROOT_DIR/native/ffmpeg/linux/lib"
if [[ ! -d "$FFMPEG_LIB" ]]; then
  echo "Missing Linux FFmpeg shared libs. Run: bash scripts/fetch-ffmpeg.sh linux $ARCH" >&2
  exit 1
fi

STAGE="$BIN_DIR/linux-stage"
rm -rf "$STAGE"
mkdir -p "$STAGE/ffmpeg/lib"
cp "$BIN" "$STAGE/$APP_NAME"
cp -a "$FFMPEG_LIB"/*.so* "$STAGE/ffmpeg/lib/"
chmod +x "$STAGE/$APP_NAME"

# Ensure runtime rpath points at bundled libs (relative to executable).
if command -v patchelf >/dev/null 2>&1; then
  patchelf --set-rpath '$ORIGIN/ffmpeg/lib' "$STAGE/$APP_NAME"
fi

chmod +x build/linux/wtvplusplus.wrapper.sh
go install github.com/goreleaser/nfpm/v2/cmd/nfpm@latest

NFPM_FILE="$BIN_DIR/nfpm-linux.yaml"
cat > "$NFPM_FILE" <<EOF
name: ${APP_NAME}
arch: ${ARCH}
platform: linux
version: ${VERSION}
section: default
priority: optional
maintainer: 一个橙子pro <942242856@qq.com>
description: wtv++ IPTV 直播源检测与管理工具
depends:
  - libgtk-4-1
  - libwebkitgtk-6.0-4
  - libglib2.0-0
contents:
  - src: ${STAGE}/${APP_NAME}
    dst: /usr/lib/wtvplusplus/wtvplusplus
    file_info:
      mode: 0755
  - src: ${STAGE}/ffmpeg/lib
    dst: /usr/lib/wtvplusplus/ffmpeg/lib
    type: tree
    file_info:
      mode: 0755
  - src: ./build/linux/wtvplusplus.wrapper.sh
    dst: /usr/bin/wtvplusplus
    file_info:
      mode: 0755
  - src: ./build/linux/wtvplusplus.desktop
    dst: /usr/share/applications/wtvplusplus.desktop
    file_info:
      mode: 0644
  - src: ./build/appicon.png
    dst: /usr/share/icons/hicolor/256x256/apps/wtvplusplus.png
    file_info:
      mode: 0644
EOF

DEB_PATH="$DIST_DIR/${APP_NAME}_${VERSION}_${ARCH}.deb"
rm -f "$DEB_PATH"
nfpm package -f "$NFPM_FILE" -p deb --target "$DEB_PATH"

# Portable tarball with bundled FFmpeg
TAR_PATH="$DIST_DIR/${APP_NAME}_${VERSION}_linux-${ARCH}.tar.gz"
rm -f "$TAR_PATH"
tar -C "$STAGE" -czf "$TAR_PATH" "$APP_NAME" ffmpeg

echo "Created $DEB_PATH"
echo "Created $TAR_PATH"
ls -lh "$DIST_DIR"
