package ffmpeg

import (
	"context"
	"errors"
)

var ErrNativeUnavailable = errors.New("native FFmpeg libraries are unavailable on this platform")

func Probe(ctx context.Context, url string) (VideoInfo, error) {
	if url == "" {
		return VideoInfo{}, errors.New("video URL is empty")
	}
	select {
	case <-ctx.Done():
		return VideoInfo{}, ctx.Err()
	default:
	}
	return nativeProbe(ctx, url)
}
