//go:build !darwin

package ffmpeg

import "context"

func nativeProbe(context.Context, string) (VideoInfo, error) {
	return VideoInfo{}, ErrNativeUnavailable
}

func nativeVersion() (string, error) {
	return "", ErrNativeUnavailable
}
