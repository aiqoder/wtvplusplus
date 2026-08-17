package services

import (
	"context"
	"sync"
	"time"

	"wtv/internal/ffmpeg"
	"wtv/internal/stream"
)

type FFmpegService struct {
	stream       *stream.Server
	mu           sync.Mutex
	cancel       context.CancelFunc
	probeCancels map[int]context.CancelFunc
	nextProbeID  int
}

func NewFFmpegService() *FFmpegService {
	server, _ := stream.New()
	return &FFmpegService{stream: server, probeCancels: make(map[int]context.CancelFunc)}
}

func (s *FFmpegService) StreamURL() string {
	if s.stream == nil {
		return ""
	}
	return s.stream.URL()
}

func (s *FFmpegService) StartPlayback(url string) error {
	if s.stream == nil {
		return ffmpeg.ErrNativeUnavailable
	}
	s.mu.Lock()
	if s.cancel != nil {
		s.cancel()
	}
	ctx, cancel := context.WithCancel(context.Background())
	s.cancel = cancel
	s.mu.Unlock()
	err := ffmpeg.RemuxToFLV(ctx, url, s.stream)
	s.mu.Lock()
	s.cancel = nil
	s.mu.Unlock()
	return err
}

func (s *FFmpegService) StopPlayback() {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.cancel != nil {
		s.cancel()
		s.cancel = nil
	}
}

func (s *FFmpegService) GetVersion() (string, error) {
	return ffmpeg.Version()
}

func (s *FFmpegService) GetVideoInfo(url string, timeoutMs int) (ffmpeg.VideoInfo, error) {
	timeout := 10 * time.Second
	if timeoutMs > 0 {
		timeout = time.Duration(timeoutMs) * time.Millisecond
	}
	ctx, timeoutCancel := context.WithTimeout(context.Background(), timeout)
	s.mu.Lock()
	s.nextProbeID++
	probeID := s.nextProbeID
	ctx, cancel := context.WithCancel(ctx)
	s.probeCancels[probeID] = cancel
	s.mu.Unlock()
	defer cancel()
	defer func() {
		s.mu.Lock()
		delete(s.probeCancels, probeID)
		s.mu.Unlock()
		timeoutCancel()
	}()
	return ffmpeg.Probe(ctx, url)
}

func (s *FFmpegService) CancelProbes() {
	s.mu.Lock()
	defer s.mu.Unlock()
	for _, cancel := range s.probeCancels {
		cancel()
	}
}
