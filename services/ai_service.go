package services

import (
	"encoding/json"
	"strings"

	"wtv/internal/aigroup"
	"wtv/internal/prompt"
)

const (
	settingAIBaseURL            = "aiBaseUrl"
	settingAIAPIKey             = "aiApiKey"
	settingAIModel              = "aiModel"
	settingOverwriteImportGroup = "overwriteImportGroup"
	settingAIRule               = "aiRule"
)

type AISettingsDTO struct {
	BaseURL              string `json:"baseUrl"`
	APIKey               string `json:"apiKey"`
	Model                string `json:"model"`
	OverwriteImportGroup bool   `json:"overwriteImportGroup"`
}

type ClassifyResultDTO struct {
	Index       int    `json:"index"`
	DisplayName string `json:"displayName"`
	Group       string `json:"group"`
}

type RuleGroupDTO struct {
	Name     string   `json:"name"`
	Channels []string `json:"channels"`
}

type RuleConfigDTO struct {
	Groups []RuleGroupDTO `json:"groups"`
}

type AIService struct {
	store *StoreService
}

func NewAIService(store *StoreService) *AIService {
	return &AIService{store: store}
}

func (s *AIService) GetSettings() AISettingsDTO {
	return AISettingsDTO{
		BaseURL:              s.stringSetting(settingAIBaseURL, "https://api.deepseek.com/v1"),
		APIKey:               s.stringSetting(settingAIAPIKey, ""),
		Model:                s.stringSetting(settingAIModel, "gpt-4o-mini"),
		OverwriteImportGroup: s.boolSetting(settingOverwriteImportGroup, true),
	}
}

func (s *AIService) SaveSettings(settings AISettingsDTO) error {
	if settings.BaseURL == "" {
		settings.BaseURL = "https://api.deepseek.com/v1"
	}
	if settings.Model == "" {
		settings.Model = "gpt-4o-mini"
	}
	if err := s.store.Set(settingAIBaseURL, settings.BaseURL); err != nil {
		return err
	}
	if err := s.store.Set(settingAIAPIKey, settings.APIKey); err != nil {
		return err
	}
	if err := s.store.Set(settingAIModel, settings.Model); err != nil {
		return err
	}
	return s.store.Set(settingOverwriteImportGroup, settings.OverwriteImportGroup)
}

func (s *AIService) GetRule() RuleConfigDTO {
	raw := s.stringSetting(settingAIRule, "")
	if strings.TrimSpace(raw) == "" {
		// 未自定义时返回内置默认对照表（与 monitor-lite-api defaultgroup 一致）
		return s.GetDefaultRule()
	}
	var cfg RuleConfigDTO
	if err := json.Unmarshal([]byte(raw), &cfg); err != nil {
		return s.GetDefaultRule()
	}
	if len(cfg.Groups) == 0 {
		return s.GetDefaultRule()
	}
	return cfg
}

// HasCustomRule 是否已保存用户自定义规则（非内置默认）
func (s *AIService) HasCustomRule() bool {
	raw := s.stringSetting(settingAIRule, "")
	if strings.TrimSpace(raw) == "" {
		return false
	}
	var cfg RuleConfigDTO
	if err := json.Unmarshal([]byte(raw), &cfg); err != nil {
		return false
	}
	return len(cfg.Groups) > 0
}

func (s *AIService) GetDefaultRule() RuleConfigDTO {
	return toRuleDTO(prompt.DefaultConfig())
}

// ResetRule 清除自定义规则，恢复使用内置默认
func (s *AIService) ResetRule() error {
	return s.store.Set(settingAIRule, "")
}

func (s *AIService) SaveRule(cfg RuleConfigDTO) error {
	if cfg.Groups == nil {
		cfg.Groups = []RuleGroupDTO{}
	}
	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return err
	}
	return s.store.Set(settingAIRule, string(data))
}

func (s *AIService) ListModels(baseURL, apiKey string) ([]string, error) {
	settings := s.runtimeSettings()
	if strings.TrimSpace(baseURL) != "" {
		settings.BaseURL = strings.TrimSpace(baseURL)
	}
	if strings.TrimSpace(apiKey) != "" {
		settings.APIKey = strings.TrimSpace(apiKey)
	}
	return aigroup.ListModels(settings)
}

func (s *AIService) ClassifyChannels(names []string) ([]ClassifyResultDTO, error) {
	settings := s.runtimeSettings()
	cfg := s.promptConfig()
	results, err := aigroup.ClassifyAll(settings, cfg, names)
	if err != nil {
		return nil, err
	}
	out := make([]ClassifyResultDTO, 0, len(results))
	for _, r := range results {
		out = append(out, ClassifyResultDTO{
			Index:       r.Index,
			DisplayName: r.DisplayName,
			Group:       r.Group,
		})
	}
	return out, nil
}

func (s *AIService) promptConfig() prompt.Config {
	raw := s.stringSetting(settingAIRule, "")
	cfg, err := prompt.Parse(raw)
	if err != nil {
		return prompt.DefaultConfig()
	}
	return cfg
}

func (s *AIService) runtimeSettings() aigroup.AISettings {
	dto := s.GetSettings()
	return aigroup.AISettings{
		BaseURL: dto.BaseURL,
		APIKey:  dto.APIKey,
		Model:   dto.Model,
	}
}

func toRuleDTO(cfg prompt.Config) RuleConfigDTO {
	out := RuleConfigDTO{Groups: make([]RuleGroupDTO, 0, len(cfg.Groups))}
	for _, g := range cfg.Groups {
		out.Groups = append(out.Groups, RuleGroupDTO{
			Name:     g.Name,
			Channels: append([]string{}, g.Channels...),
		})
	}
	return out
}

func (s *AIService) stringSetting(key, fallback string) string {
	v := s.store.Get(key)
	if v == nil {
		return fallback
	}
	switch t := v.(type) {
	case string:
		if strings.TrimSpace(t) == "" {
			return fallback
		}
		return t
	default:
		return fallback
	}
}

func (s *AIService) boolSetting(key string, fallback bool) bool {
	v := s.store.Get(key)
	if v == nil {
		return fallback
	}
	switch t := v.(type) {
	case bool:
		return t
	case string:
		switch strings.ToLower(strings.TrimSpace(t)) {
		case "1", "true", "yes", "y", "是":
			return true
		case "0", "false", "no", "n", "否":
			return false
		}
	case float64:
		return t != 0
	}
	return fallback
}
