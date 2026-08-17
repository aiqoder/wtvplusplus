package db

import (
	"os"
	"path/filepath"
	"sync"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"wtv/internal/model"
)

var (
	once sync.Once
	gdb  *gorm.DB
	err  error
)

func Open() (*gorm.DB, error) {
	once.Do(func() {
		home, homeErr := os.UserHomeDir()
		if homeErr != nil {
			home = "."
		}
		dir := filepath.Join(home, "Documents", "yigechengzipro")
		if mkErr := os.MkdirAll(dir, 0o755); mkErr != nil {
			err = mkErr
			return
		}
		path := filepath.Join(dir, "playlist.db")
		gdb, err = gorm.Open(sqlite.Open(path), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Warn),
		})
		if err != nil {
			return
		}
		err = gdb.AutoMigrate(&model.PlaylistChannel{})
	})
	return gdb, err
}
