package services

import (
	"strings"

	"wtv/internal/db"
	"wtv/internal/model"
)

type PlaylistChannelInput struct {
	Name   string  `json:"name"`
	URL    string  `json:"url"`
	Group  string  `json:"group"`
	Width  int     `json:"width"`
	Height int     `json:"height"`
	FPS    float64 `json:"fps"`
	Speed  int     `json:"speed"`
	Codec  string  `json:"codec"`
}

type PlaylistItem struct {
	Name  string `json:"name"`
	URL   string `json:"url"`
	Group string `json:"group"`
}

type PlaylistGroup struct {
	Group string         `json:"group"`
	Items []PlaylistItem `json:"items"`
}

type PlaylistService struct{}

func NewPlaylistService() *PlaylistService {
	return &PlaylistService{}
}

func (s *PlaylistService) Upsert(input PlaylistChannelInput) error {
	gdb, err := db.Open()
	if err != nil {
		return err
	}

	name := strings.TrimSpace(input.Name)
	url := strings.TrimSpace(input.URL)
	group := strings.TrimSpace(input.Group)
	if name == "" || url == "" {
		return nil
	}
	if group == "" {
		group = "未知分组"
	}

	var existing model.PlaylistChannel
	tx := gdb.Where("url = ?", url).First(&existing)
	if tx.Error == nil {
		existing.Name = name
		existing.Group = group
		existing.Width = input.Width
		existing.Height = input.Height
		existing.FPS = input.FPS
		existing.Speed = input.Speed
		existing.Codec = input.Codec
		return gdb.Save(&existing).Error
	}

	channel := model.PlaylistChannel{
		Name:   name,
		URL:    url,
		Group:  group,
		Width:  input.Width,
		Height: input.Height,
		FPS:    input.FPS,
		Speed:  input.Speed,
		Codec:  input.Codec,
	}
	return gdb.Create(&channel).Error
}

func (s *PlaylistService) ListGrouped() ([]PlaylistGroup, error) {
	gdb, err := db.Open()
	if err != nil {
		return nil, err
	}

	var rows []model.PlaylistChannel
	if err := gdb.Order("channel_group ASC, name ASC, id ASC").Find(&rows).Error; err != nil {
		return nil, err
	}

	// 同分组同名合并 URL（# 分隔），与播放页多源尝试逻辑一致
	type key struct {
		group string
		name  string
	}
	merged := make(map[key]*PlaylistItem)
	order := make([]key, 0)
	groupOrder := make([]string, 0)
	groupSeen := map[string]struct{}{}

	for _, row := range rows {
		k := key{group: row.Group, name: row.Name}
		if item, ok := merged[k]; ok {
			if !containsURL(item.URL, row.URL) {
				item.URL = item.URL + "#" + row.URL
			}
			continue
		}
		merged[k] = &PlaylistItem{Name: row.Name, URL: row.URL, Group: row.Group}
		order = append(order, k)
		if _, ok := groupSeen[row.Group]; !ok {
			groupSeen[row.Group] = struct{}{}
			groupOrder = append(groupOrder, row.Group)
		}
	}

	result := make([]PlaylistGroup, 0, len(groupOrder))
	for _, g := range groupOrder {
		pg := PlaylistGroup{Group: g, Items: []PlaylistItem{}}
		for _, k := range order {
			if k.group != g {
				continue
			}
			pg.Items = append(pg.Items, *merged[k])
		}
		result = append(result, pg)
	}
	return result, nil
}

func (s *PlaylistService) Clear() error {
	gdb, err := db.Open()
	if err != nil {
		return err
	}
	return gdb.Where("1 = 1").Delete(&model.PlaylistChannel{}).Error
}

func containsURL(joined, url string) bool {
	for _, part := range strings.Split(joined, "#") {
		if part == url {
			return true
		}
	}
	return false
}
