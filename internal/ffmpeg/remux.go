package ffmpeg

import "context"

type OutputWriter interface {
	Write([]byte) (int, error)
}

func RemuxToFLV(ctx context.Context, url string, writer OutputWriter) error {
	return nativeRemux(ctx, url, writer)
}
