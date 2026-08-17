package ffmpeg

func Version() (string, error) {
	return nativeVersion()
}
