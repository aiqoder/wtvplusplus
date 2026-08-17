package main

import (
	"embed"
	"log"

	"github.com/wailsapp/wails/v3/pkg/application"
	"wtv/services"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	app := application.New(application.Options{
		Name:        "wtv",
		Description: "一个橙子pro工具箱",
		Services: []application.Service{
			application.NewService(services.NewFileService()),
			application.NewService(services.NewStoreService()),
			application.NewService(services.NewFFmpegService()),
			application.NewService(services.NewClipboardService()),
		},
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(assets),
		},
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: true,
		},
	})

	app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title:            "一个橙子pro工具箱",
		Width:            1240,
		Height:           700,
		MinWidth:         375,
		MinHeight:        650,
		MaxWidth:         1920,
		BackgroundColour: application.NewRGB(24, 24, 28),
		URL:              "/",
	})

	if err := app.Run(); err != nil {
		log.Fatal(err)
	}
}
