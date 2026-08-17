//go:build cgo && (darwin || linux || windows)

package ffmpeg

/*
#cgo darwin CFLAGS: -I${SRCDIR}/../../native/ffmpeg/include
#cgo darwin LDFLAGS: -L${SRCDIR}/../../native/ffmpeg/lib -lavformat -lavcodec -lavutil -Wl,-rpath,${SRCDIR}/../../native/ffmpeg/lib

#cgo linux CFLAGS: -I${SRCDIR}/../../native/ffmpeg/linux/include
#cgo linux LDFLAGS: -L${SRCDIR}/../../native/ffmpeg/linux/lib -lavformat -lavcodec -lavutil -lm -lpthread -ldl -Wl,-rpath,$ORIGIN/ffmpeg/lib -Wl,-rpath,${SRCDIR}/../../native/ffmpeg/linux/lib

#cgo windows CFLAGS: -I${SRCDIR}/../../native/ffmpeg/windows/include
#cgo windows LDFLAGS: -L${SRCDIR}/../../native/ffmpeg/windows/lib -lavformat -lavcodec -lavutil -lws2_32 -lsecur32 -lbcrypt -luser32

#include <stdint.h>
#include <stdlib.h>
#include "libavformat/avformat.h"
#include "libavcodec/avcodec.h"
#include "libavutil/avutil.h"

typedef int (*wtv_write_cb)(uintptr_t user, uint8_t *buf, int buf_size);

char* wtv_probe(const char* url, int* cancelled);
const char* wtv_version(void);
int wtv_remux(const char* url, wtv_write_cb write_cb, uintptr_t user, int* cancelled);
void wtv_cancel(int* cancelled);

extern int goWtvWrite(uintptr_t user, uint8_t* buf, int size);
*/
import "C"

import (
	"context"
	"errors"
	"runtime/cgo"
	"unsafe"
)

//export goWtvWrite
func goWtvWrite(user C.uintptr_t, buf *C.uint8_t, size C.int) C.int {
	handle := cgo.Handle(user)
	writer, ok := handle.Value().(OutputWriter)
	if !ok || writer == nil || size <= 0 {
		return -1
	}
	n, err := writer.Write(C.GoBytes(unsafe.Pointer(buf), size))
	if err != nil {
		return -1
	}
	return C.int(n)
}

func nativeProbe(ctx context.Context, url string) (VideoInfo, error) {
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
	cancelled := (*C.int)(C.calloc(1, C.size_t(unsafe.Sizeof(C.int(0)))))
	defer C.free(unsafe.Pointer(cancelled))
	handle := cgo.NewHandle(writer)
	defer handle.Delete()

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

	result := C.wtv_remux(cURL, C.wtv_write_cb(C.goWtvWrite), C.uintptr_t(handle), cancelled)
	close(stopCancel)
	<-cancelDone

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
