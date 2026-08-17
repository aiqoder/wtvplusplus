#!/bin/sh
# WebKitGTK 在部分 NVIDIA / Wayland 环境下可能白屏，启动前设置兼容环境变量。
export WEBKIT_DISABLE_DMABUF_RENDERER="${WEBKIT_DISABLE_DMABUF_RENDERER:-1}"
export WEBKIT_DISABLE_COMPOSITING_MODE="${WEBKIT_DISABLE_COMPOSITING_MODE:-1}"
if [ -z "${__NV_DISABLE_EXPLICIT_SYNC+x}" ]; then
  export __NV_DISABLE_EXPLICIT_SYNC=1
fi
exec /usr/lib/wtvplusplus/wtvplusplus "$@"
