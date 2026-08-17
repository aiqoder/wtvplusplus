package aigroup

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sort"
	"strings"
)

// ListModels 调用 OpenAI 兼容接口 GET /models 获取可用模型列表
func ListModels(settings AISettings) ([]string, error) {
	client := NewClient(settings)
	if !client.Enabled() {
		return nil, fmt.Errorf("未配置 API Key")
	}

	req, err := http.NewRequest(http.MethodGet, client.settings.BaseURL+"/models", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+client.settings.APIKey)

	resp, err := client.http.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	raw, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	type modelsResp struct {
		Data []struct {
			ID string `json:"id"`
		} `json:"data"`
		Error *struct {
			Message string `json:"message"`
		} `json:"error"`
	}

	var parsed modelsResp
	_ = json.Unmarshal(raw, &parsed)

	if resp.StatusCode >= 400 {
		msg := string(raw)
		if parsed.Error != nil && parsed.Error.Message != "" {
			msg = parsed.Error.Message
		}
		return nil, fmt.Errorf("获取模型列表失败: %s", msg)
	}

	seen := make(map[string]struct{})
	models := make([]string, 0, len(parsed.Data))
	for _, item := range parsed.Data {
		id := strings.TrimSpace(item.ID)
		if id == "" {
			continue
		}
		if _, ok := seen[id]; ok {
			continue
		}
		seen[id] = struct{}{}
		models = append(models, id)
	}
	sort.Strings(models)
	return models, nil
}
