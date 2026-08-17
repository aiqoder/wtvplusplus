#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_NAME="${APP_NAME:-wtvplusplus}"
VERSION="${VERSION:-${APP_VERSION:-0.0.0}}"
BIN_DIR="${BIN_DIR:-bin}"
DIST_DIR="${DIST_DIR:-dist}"
ARCH="${GOARCH:-amd64}"

cd "$ROOT_DIR"
mkdir -p "$DIST_DIR"

EXE="$BIN_DIR/${APP_NAME}.exe"
if [[ ! -f "$EXE" ]]; then
  echo "Missing Windows binary: $EXE" >&2
  exit 1
fi

STAGE="$BIN_DIR/windows-stage"
rm -rf "$STAGE"
mkdir -p "$STAGE"
cp "$EXE" "$STAGE/${APP_NAME}.exe"

ZIP_PATH="$DIST_DIR/${APP_NAME}_${VERSION}_windows-${ARCH}.zip"
rm -f "$ZIP_PATH"

# Prefer portable zip creation (works on GitHub Windows runners)
if command -v python3 >/dev/null 2>&1 || command -v python >/dev/null 2>&1; then
  PYBIN="$(command -v python3 || command -v python)"
  "$PYBIN" - <<PY
import pathlib, zipfile
stage = pathlib.Path(r"$STAGE")
zip_path = pathlib.Path(r"$ZIP_PATH")
with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
    for p in stage.iterdir():
        zf.write(p, p.name)
print("zipped", zip_path)
PY
elif command -v zip >/dev/null 2>&1; then
  (cd "$STAGE" && zip -qr "$ROOT_DIR/$ZIP_PATH" .)
else
  echo "No python/zip available to create Windows archive" >&2
  exit 1
fi

cp "$EXE" "$DIST_DIR/${APP_NAME}_${VERSION}_windows-${ARCH}.exe"

echo "Created $ZIP_PATH"
ls -lh "$DIST_DIR"
