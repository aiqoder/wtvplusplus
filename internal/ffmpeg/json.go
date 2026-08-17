package ffmpeg

import "encoding/json"

func decodeProbeJSON(data string) (VideoInfo, error) {
	var result VideoInfo
	if err := json.Unmarshal([]byte(data), &result); err != nil {
		return VideoInfo{}, err
	}
	return result, nil
}
