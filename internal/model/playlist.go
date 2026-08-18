package model

import "time"

// PlaylistChannel 检测成功后写入的播放列表频道
type PlaylistChannel struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"size:255;index;not null" json:"name"`
	URL       string    `gorm:"size:2048;uniqueIndex:idx_playlist_url_group;not null" json:"url"`
	Group     string    `gorm:"column:channel_group;size:128;uniqueIndex:idx_playlist_url_group;index;default:未知分组" json:"group"`
	Width     int       `json:"width"`
	Height    int       `json:"height"`
	FPS       float64   `json:"fps"`
	Speed     int       `json:"speed"`
	Codec     string    `gorm:"size:64" json:"codec"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func (PlaylistChannel) TableName() string {
	return "playlist_channels"
}
