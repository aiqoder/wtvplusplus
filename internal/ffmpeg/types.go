package ffmpeg

type VideoInfo struct {
	FormatName string        `json:"formatName"`
	Duration   float64       `json:"duration"`
	Bitrate    int64         `json:"bitrate"`
	Streams    []VideoStream `json:"streams"`
}

type VideoStream struct {
	Index       int     `json:"index"`
	CodecName   string  `json:"codecName"`
	CodecType   string  `json:"codecType"`
	Width       int     `json:"width"`
	Height      int     `json:"height"`
	FrameRate   float64 `json:"frameRate"`
	PixelFormat string  `json:"pixelFormat"`
}
