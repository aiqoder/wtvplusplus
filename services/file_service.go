package services

import (
	"errors"
	"os"
	"path/filepath"
	"unicode/utf8"

	"github.com/wailsapp/wails/v3/pkg/application"
	"golang.org/x/text/encoding/simplifiedchinese"
	"golang.org/x/text/transform"
)

type FileService struct {
	root string
}

func NewFileService() *FileService {
	home, err := os.UserHomeDir()
	if err != nil {
		home = "."
	}
	return &FileService{root: filepath.Join(home, "Documents", "yigechengzipro")}
}

func (s *FileService) Read(path string) (string, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return "", err
	}
	if utf8.Valid(data) {
		return string(data), nil
	}
	decoded, _, err := transform.Bytes(simplifiedchinese.GBK.NewDecoder(), data)
	if err == nil {
		return string(decoded), nil
	}
	return string(data), nil
}

func (s *FileService) Write(path, data string) error {
	if path == "" {
		return errors.New("file path is empty")
	}
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return err
	}
	temporary, err := os.CreateTemp(filepath.Dir(path), ".wtv-*")
	if err != nil {
		return err
	}
	temporaryPath := temporary.Name()
	defer os.Remove(temporaryPath)

	if _, err = temporary.WriteString(data); err != nil {
		temporary.Close()
		return err
	}
	if err = temporary.Close(); err != nil {
		return err
	}
	return os.Rename(temporaryPath, path)
}

func (s *FileService) AppDataPath(name string) (string, error) {
	path := filepath.Join(s.root, filepath.Clean(name))
	if err := os.MkdirAll(path, 0o755); err != nil {
		return "", err
	}
	return path, nil
}

func (s *FileService) ReadPath(path string) (string, error) {
	return s.Read(path)
}

func (s *FileService) SelectAndRead() (map[string]string, error) {
	path, err := application.Get().Dialog.OpenFileWithOptions(&application.OpenFileDialogOptions{
		Title:                   "选择 M3U/TXT 文件",
		CanChooseFiles:          true,
		AllowsOtherFileTypes:    true,
		AllowsMultipleSelection: false,
		Filters:                 []application.FileFilter{{DisplayName: "M3U/TXT", Pattern: "*.m3u;*.m3u8;*.txt"}},
	}).PromptForSingleSelection()
	if err != nil {
		return nil, err
	}
	if path == "" {
		return map[string]string{}, nil
	}
	data, err := s.Read(path)
	if err != nil {
		return nil, err
	}
	return map[string]string{"path": path, "data": data}, nil
}
