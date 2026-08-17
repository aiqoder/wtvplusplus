//go:build !cgo || (!darwin && !linux && !windows)

package ffmpeg

import "context"

func nativeProbe(context.Context, string) (VideoInfo, error) {
	return VideoInfo{}, ErrNativeUnavailable
}

func nativeVersion() (string, error) {
	return "", ErrNativeUnavailable
}

func nativeRemux(context.Context, string, OutputWriter) error {
	return ErrNativeUnavailable
}
