//go:build darwin

package ffmpeg

/*
#cgo CFLAGS: -I${SRCDIR}/../../native/ffmpeg/include
#cgo LDFLAGS: -L${SRCDIR}/../../native/ffmpeg/lib -lavformat -lavcodec -lavutil -Wl,-rpath,${SRCDIR}/../../native/ffmpeg/lib
#include <stdlib.h>
#include "libavformat/avformat.h"
#include "libavcodec/avcodec.h"
#include "libavutil/avutil.h"

char* wtv_probe(const char* url, int* cancelled);
const char* wtv_version(void);
int wtv_remux(const char* url, int fd, int* cancelled);
void wtv_cancel(int* cancelled);
*/
import "C"

import (
	"context"
	"errors"
	"io"
	"os"
	"runtime"
	"unsafe"
)

func nativeProbe(ctx context.Context, url string) (VideoInfo, error) {
	if runtime.GOOS != "darwin" {
		return VideoInfo{}, ErrNativeUnavailable
	}
	select {
	case <-ctx.Done():
		return VideoInfo{}, ctx.Err()
	default:
	}
	cURL := C.CString(url)
	defer C.free(unsafe.Pointer(cURL))
	cancelled := (*C.int)(C.calloc(1, C.size_t(unsafe.Sizeof(C.int(0)))))
	defer C.free(unsafe.Pointer(cancelled))
	stopCancel := make(chan struct{})
	cancelDone := make(chan struct{})
	go func() {
		select {
		case <-ctx.Done():
			C.wtv_cancel(cancelled)
		case <-stopCancel:
		}
		close(cancelDone)
	}()
	result := C.wtv_probe(cURL, cancelled)
	close(stopCancel)
	<-cancelDone
	if result == nil {
		return VideoInfo{}, errors.New("FFmpeg failed to open input")
	}
	defer C.free(unsafe.Pointer(result))
	return decodeProbeJSON(C.GoString(result))
}

func nativeVersion() (string, error) {
	version := C.GoString(C.wtv_version())
	if version == "" {
		return "", errors.New("FFmpeg version is unavailable")
	}
	return version, nil
}

func nativeRemux(ctx context.Context, url string, writer OutputWriter) error {
	cURL := C.CString(url)
	defer C.free(unsafe.Pointer(cURL))
	reader, output, err := os.Pipe()
	if err != nil {
		return err
	}
	defer reader.Close()
	cancelled := (*C.int)(C.calloc(1, C.size_t(unsafe.Sizeof(C.int(0)))))
	defer C.free(unsafe.Pointer(cancelled))
	stopCancel := make(chan struct{})
	cancelDone := make(chan struct{})
	resultChannel := make(chan C.int, 1)
	go func() {
		resultChannel <- C.wtv_remux(cURL, C.int(output.Fd()), cancelled)
		output.Close()
	}()
	go func() {
		select {
		case <-ctx.Done():
			C.wtv_cancel(cancelled)
			output.Close()
		case <-stopCancel:
		}
		close(cancelDone)
	}()
	buffer := make([]byte, 32*1024)
	var aborted error
	for {
		select {
		case <-ctx.Done():
			aborted = ctx.Err()
		default:
		}
		if aborted != nil {
			break
		}
		n, readErr := reader.Read(buffer)
		if n > 0 {
			if _, err = writer.Write(buffer[:n]); err != nil {
				aborted = err
				break
			}
		}
		if readErr == io.EOF {
			break
		}
		if readErr != nil {
			aborted = readErr
			break
		}
	}
	if aborted != nil {
		C.wtv_cancel(cancelled)
		output.Close()
	}
	result := <-resultChannel
	close(stopCancel)
	<-cancelDone
	if aborted != nil {
		return aborted
	}
	select {
	case <-ctx.Done():
		return ctx.Err()
	default:
	}
	if result < 0 {
		return errors.New("FFmpeg failed to remux input")
	}
	return nil
}
