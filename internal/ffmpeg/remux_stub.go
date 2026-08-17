//go:build !darwin

package ffmpeg

import "context"

func nativeRemux(context.Context, string, OutputWriter) error {
	return ErrNativeUnavailable
}
