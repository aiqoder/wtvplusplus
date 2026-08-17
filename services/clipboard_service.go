package services

import "github.com/wailsapp/wails/v3/pkg/application"

type ClipboardService struct{}

func NewClipboardService() *ClipboardService {
	return &ClipboardService{}
}

func (s *ClipboardService) ReadText() string {
	text, _ := application.Get().Clipboard.Text()
	return text
}

func (s *ClipboardService) WriteText(text string) {
	application.Get().Clipboard.SetText(text)
}
