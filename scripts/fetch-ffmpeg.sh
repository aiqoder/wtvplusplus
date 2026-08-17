#!/usr/bin/env bash
# Download BtbN FFmpeg 5.1 lgpl-shared builds for Windows/Linux native linking.
#
# Pinned to a known autobuild that still publishes n5.1 shared assets
# (the rolling "latest" tag may drop older release branches).
#
# Optional env:
#   FFMPEG_DOWNLOAD_BASE  Override download base URL (useful behind a mirror)
#   Example:
#     export FFMPEG_DOWNLOAD_BASE="https://ghproxy.net/https://github.com/BtbN/FFmpeg-Builds/releases/download/autobuild-2025-01-31-12-58"
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PLATFORM="${1:-}"
ARCH="${2:-amd64}"

RELEASE_TAG="autobuild-2025-01-31-12-58"
ASSET_PREFIX="ffmpeg-n5.1.6-16-g6e63e49496"

if [[ -z "$PLATFORM" ]]; then
  case "$(uname -s)" in
    Linux*) PLATFORM="linux" ;;
    MINGW*|MSYS*|CYGWIN*|Windows_NT*) PLATFORM="windows" ;;
    *)
      echo "Usage: $0 <linux|windows> [amd64|arm64]" >&2
      exit 1
      ;;
  esac
fi

case "$PLATFORM" in
  linux|windows) ;;
  *)
    echo "Unsupported platform: $PLATFORM (expected linux|windows)" >&2
    exit 1
    ;;
esac

case "$ARCH" in
  amd64|x86_64) ARCH="amd64" ;;
  arm64|aarch64) ARCH="arm64" ;;
  *)
    echo "Unsupported arch: $ARCH" >&2
    exit 1
    ;;
esac

DEST="$ROOT_DIR/native/ffmpeg/$PLATFORM"
MARKER="$DEST/.ffmpeg-version"
VARIANT="lgpl-shared-5.1"
BASE_URL="${FFMPEG_DOWNLOAD_BASE:-https://github.com/BtbN/FFmpeg-Builds/releases/download/${RELEASE_TAG}}"

if [[ "$PLATFORM" == "linux" && "$ARCH" == "amd64" ]]; then
  ASSET="${ASSET_PREFIX}-linux64-${VARIANT}.tar.xz"
elif [[ "$PLATFORM" == "linux" && "$ARCH" == "arm64" ]]; then
  ASSET="${ASSET_PREFIX}-linuxarm64-${VARIANT}.tar.xz"
elif [[ "$PLATFORM" == "windows" && "$ARCH" == "amd64" ]]; then
  ASSET="${ASSET_PREFIX}-win64-${VARIANT}.zip"
elif [[ "$PLATFORM" == "windows" && "$ARCH" == "arm64" ]]; then
  ASSET="${ASSET_PREFIX}-winarm64-${VARIANT}.zip"
else
  echo "No FFmpeg asset mapping for $PLATFORM/$ARCH" >&2
  exit 1
fi

EXPECTED="${RELEASE_TAG}/${ASSET}"
if [[ -f "$MARKER" ]] && [[ "$(cat "$MARKER")" == "$EXPECTED" ]] \
  && [[ -d "$DEST/include" ]] && [[ -d "$DEST/lib" ]]; then
  echo "FFmpeg already present for $PLATFORM/$ARCH ($EXPECTED)"
  exit 0
fi

TMP="$(mktemp -d)"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT

URL="$BASE_URL/$ASSET"
echo "Downloading $URL ..."
curl -fL --connect-timeout 30 --retry 5 --retry-delay 3 --retry-all-errors \
  -o "$TMP/$ASSET" "$URL"

rm -rf "$DEST"
mkdir -p "$DEST"
EXTRACT="$TMP/extract"
mkdir -p "$EXTRACT"

if [[ "$ASSET" == *.zip ]]; then
  if command -v unzip >/dev/null 2>&1; then
    unzip -q "$TMP/$ASSET" -d "$EXTRACT"
  else
    python3 - <<PY
import zipfile
zipfile.ZipFile(r"$TMP/$ASSET").extractall(r"$EXTRACT")
PY
  fi
else
  tar -xJf "$TMP/$ASSET" -C "$EXTRACT"
fi

ROOT_EXTRACT="$(find "$EXTRACT" -mindepth 1 -maxdepth 1 -type d | head -n 1)"
if [[ -z "$ROOT_EXTRACT" ]]; then
  echo "Failed to locate extracted FFmpeg root" >&2
  exit 1
fi

cp -R "$ROOT_EXTRACT/include" "$DEST/include"
mkdir -p "$DEST/lib" "$DEST/bin"
if [[ -d "$ROOT_EXTRACT/lib" ]]; then
  cp -R "$ROOT_EXTRACT/lib/." "$DEST/lib/"
fi
if [[ -d "$ROOT_EXTRACT/bin" ]]; then
  cp -R "$ROOT_EXTRACT/bin/." "$DEST/bin/"
fi

if [[ ! -f "$DEST/include/libavformat/avformat.h" ]]; then
  echo "Missing avformat.h after extract" >&2
  exit 1
fi

if [[ "$PLATFORM" == "windows" ]]; then
  if ! ls "$DEST/bin"/*.dll >/dev/null 2>&1; then
    echo "Windows FFmpeg bin/*.dll missing after extract" >&2
    exit 1
  fi
  if ! ls "$DEST/lib"/libavformat* >/dev/null 2>&1 && ! ls "$DEST/lib"/avformat* >/dev/null 2>&1; then
    echo "Windows FFmpeg import libraries missing under lib/" >&2
    exit 1
  fi
else
  if ! ls "$DEST/lib"/libavformat.so* >/dev/null 2>&1; then
    echo "Linux FFmpeg libavformat.so* missing after extract" >&2
    exit 1
  fi
fi

echo "$EXPECTED" > "$MARKER"
echo "Installed FFmpeg into $DEST"
ls -la "$DEST"
