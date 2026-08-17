#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_NAME="${APP_NAME:-wtvplusplus}"
PRODUCT_NAME="${PRODUCT_NAME:-wtv++}"
VERSION="${VERSION:-${APP_VERSION:-0.0.0}}"
BIN_DIR="${BIN_DIR:-bin}"
DIST_DIR="${DIST_DIR:-dist}"
ARCH="$(uname -m)"
case "$ARCH" in
  arm64|aarch64) ARCH_LABEL="arm64" ;;
  x86_64|amd64) ARCH_LABEL="amd64" ;;
  *) ARCH_LABEL="$ARCH" ;;
esac

cd "$ROOT_DIR"
mkdir -p "$DIST_DIR" "$BIN_DIR/payload"

# Use filesystem-safe app bundle name; display name stays PRODUCT_NAME in Info.plist
APP_BUNDLE="$BIN_DIR/${APP_NAME}.app"
rm -rf "$APP_BUNDLE"
mkdir -p "$APP_BUNDLE/Contents/MacOS/ffmpeg/lib"
mkdir -p "$APP_BUNDLE/Contents/Resources"

cp "$BIN_DIR/$APP_NAME" "$APP_BUNDLE/Contents/MacOS/$APP_NAME"
cp "$BIN_DIR/ffmpeg/lib/"*.dylib "$APP_BUNDLE/Contents/MacOS/ffmpeg/lib/"
cp build/darwin/Info.plist "$APP_BUNDLE/Contents/Info.plist"

# Patch version into Info.plist for this build
/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString $VERSION" "$APP_BUNDLE/Contents/Info.plist" 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion $VERSION" "$APP_BUNDLE/Contents/Info.plist" 2>/dev/null || true
sed -i '' "s#<string>3.0.0</string>#<string>${VERSION}</string>#g" "$APP_BUNDLE/Contents/Info.plist" 2>/dev/null || true

if [[ ! -f build/darwin/icons.icns ]]; then
  echo "Missing build/darwin/icons.icns — run: task generate:icons" >&2
  exit 1
fi
cp build/darwin/icons.icns "$APP_BUNDLE/Contents/Resources/icons.icns"

install_name_tool -delete_rpath @executable_path/ffmpeg/lib "$APP_BUNDLE/Contents/MacOS/$APP_NAME" 2>/dev/null || true
install_name_tool -add_rpath @executable_path/ffmpeg/lib "$APP_BUNDLE/Contents/MacOS/$APP_NAME"

codesign --force --deep --sign - "$APP_BUNDLE" 2>/dev/null || true

PKG_PATH="$DIST_DIR/${APP_NAME}_${VERSION}_darwin-${ARCH_LABEL}.pkg"
rm -f "$PKG_PATH"
pkgbuild \
  --install-location /Applications \
  --component "$APP_BUNDLE" \
  "$PKG_PATH"

# Also ship a zip of the .app for users who prefer drag-install
ZIP_PATH="$DIST_DIR/${APP_NAME}_${VERSION}_darwin-${ARCH_LABEL}.zip"
rm -f "$ZIP_PATH"
ditto -c -k --sequesterRsrc --keepParent "$APP_BUNDLE" "$ZIP_PATH"

echo "Created $PKG_PATH"
echo "Created $ZIP_PATH"
ls -lh "$DIST_DIR"
