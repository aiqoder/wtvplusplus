// 是否为视频
export const isVideo = (headers) => {
  const t = headers['content-type'].toLocaleLowerCase()
  return t.startsWith("video/") || t === "application/vnd.apple.mpegurl" || t === "application/x-mpegurl"
}

// 是否为音频
export const isAudio = (headers) => {
  const t = headers['content-type']
  return t.startsWith("audio/")
}