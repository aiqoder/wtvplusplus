package services

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sync"
)

type StoreService struct {
	mu   sync.RWMutex
	path string
	data map[string]any
}

func NewStoreService() *StoreService {
	home, err := os.UserHomeDir()
	if err != nil {
		home = "."
	}
	path := filepath.Join(home, "Documents", "yigechengzipro", "config.json")
	service := &StoreService{path: path, data: map[string]any{}}
	service.load()
	return service
}

func (s *StoreService) Get(key string) any {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.data[key]
}

func (s *StoreService) Set(key string, value any) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.data[key] = value
	return s.saveLocked()
}

func (s *StoreService) load() {
	data, err := os.ReadFile(s.path)
	if err == nil {
		_ = json.Unmarshal(data, &s.data)
	}
}

func (s *StoreService) saveLocked() error {
	if err := os.MkdirAll(filepath.Dir(s.path), 0o755); err != nil {
		return err
	}
	data, err := json.MarshalIndent(s.data, "", "  ")
	if err != nil {
		return err
	}
	temporary, err := os.CreateTemp(filepath.Dir(s.path), ".wtv-store-*")
	if err != nil {
		return err
	}
	temporaryPath := temporary.Name()
	defer os.Remove(temporaryPath)
	if _, err = temporary.Write(data); err != nil {
		temporary.Close()
		return err
	}
	if err = temporary.Close(); err != nil {
		return err
	}
	return os.Rename(temporaryPath, s.path)
}
