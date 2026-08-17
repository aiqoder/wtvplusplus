package aigroup

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"wtv/internal/prompt"
)

type AISettings struct {
	BaseURL string
	APIKey  string
	Model   string
}

type ChannelInput struct {
	Index   int    `json:"index"`
	RawName string `json:"rawName"`
}

type ClassifyResult struct {
	Index       int    `json:"index"`
	DisplayName string `json:"displayName"`
	Group       string `json:"group"`
}

type Client struct {
	settings AISettings
	http     *http.Client
}

func NewClient(settings AISettings) *Client {
	if settings.Model == "" {
		settings.Model = "gpt-4o-mini"
	}
	if settings.BaseURL == "" {
		settings.BaseURL = "https://api.deepseek.com/v1"
	}
	settings.BaseURL = strings.TrimRight(settings.BaseURL, "/")

	return &Client{
		settings: settings,
		http:     &http.Client{Timeout: 120 * time.Second},
	}
}

func (c *Client) Enabled() bool {
	return c.settings.APIKey != ""
}

func (c *Client) ClassifyBatch(cfg prompt.Config, channels []ChannelInput) ([]ClassifyResult, error) {
	if len(channels) == 0 {
		return nil, nil
	}

	channelsJSON, err := json.Marshal(channels)
	if err != nil {
		return nil, err
	}

	userPrompt := cfg.BuildUserPrompt(string(channelsJSON))

	type message struct {
		Role    string `json:"role"`
		Content string `json:"content"`
	}
	type reqBody struct {
		Model          string    `json:"model"`
		Messages       []message `json:"messages"`
		Temperature    float64   `json:"temperature"`
		ResponseFormat *struct {
			Type string `json:"type"`
		} `json:"response_format,omitempty"`
	}

	body := reqBody{
		Model: c.settings.Model,
		Messages: []message{
			{Role: "system", Content: cfg.SystemPrompt()},
			{Role: "user", Content: userPrompt},
		},
		Temperature: 0.1,
		ResponseFormat: &struct {
			Type string `json:"type"`
		}{Type: "json_object"},
	}

	payload, err := json.Marshal(body)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest(http.MethodPost, c.settings.BaseURL+"/chat/completions", bytes.NewReader(payload))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+c.settings.APIKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	raw, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	type chatResp struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
		Error *struct {
			Message string `json:"message"`
		} `json:"error"`
	}

	var parsed chatResp
	_ = json.Unmarshal(raw, &parsed)

	if resp.StatusCode >= 400 {
		msg := string(raw)
		if parsed.Error != nil && parsed.Error.Message != "" {
			msg = parsed.Error.Message
		}
		return nil, fmt.Errorf("AI 接口错误: %s", msg)
	}
	if len(parsed.Choices) == 0 {
		return nil, fmt.Errorf("AI 返回为空")
	}

	content := strings.TrimSpace(parsed.Choices[0].Message.Content)
	content = strings.TrimPrefix(content, "```json")
	content = strings.TrimPrefix(content, "```")
	content = strings.TrimSuffix(content, "```")
	content = strings.TrimSpace(content)

	return parseResults(content)
}

func parseResults(content string) ([]ClassifyResult, error) {
	var wrapper struct {
		Results []ClassifyResult `json:"results"`
	}
	if err := json.Unmarshal([]byte(content), &wrapper); err == nil && len(wrapper.Results) > 0 {
		return wrapper.Results, nil
	}

	var list []ClassifyResult
	if err := json.Unmarshal([]byte(content), &list); err == nil {
		return list, nil
	}

	var obj map[string]json.RawMessage
	if err := json.Unmarshal([]byte(content), &obj); err != nil {
		return nil, fmt.Errorf("无法解析 AI 响应: %w", err)
	}
	for _, v := range obj {
		if err := json.Unmarshal(v, &list); err == nil && len(list) > 0 {
			return list, nil
		}
	}
	return nil, fmt.Errorf("无法解析 AI 响应 JSON")
}

const BatchSize = 25

func ClassifyAll(settings AISettings, cfg prompt.Config, rawNames []string) ([]ClassifyResult, error) {
	client := NewClient(settings)
	if !client.Enabled() {
		return nil, fmt.Errorf("未配置 AI API Key")
	}

	out := make([]ClassifyResult, 0, len(rawNames))
	for start := 0; start < len(rawNames); start += BatchSize {
		end := start + BatchSize
		if end > len(rawNames) {
			end = len(rawNames)
		}
		batch := make([]ChannelInput, 0, end-start)
		for i := start; i < end; i++ {
			batch = append(batch, ChannelInput{Index: i, RawName: rawNames[i]})
		}
		results, err := client.ClassifyBatch(cfg, batch)
		if err != nil {
			return out, err
		}
		out = append(out, results...)
	}
	return out, nil
}
