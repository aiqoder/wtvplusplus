package prompt

import (
	"encoding/json"
	"strings"
)

// RuleGroup 分组及其下的规范频道名称
type RuleGroup struct {
	Name     string   `json:"name"`
	Channels []string `json:"channels"`
}

type Config struct {
	Groups []RuleGroup `json:"groups"`
}

const systemPrompt = `你是专业的中国 IPTV 直播频道分类助手。根据原始频道名称，输出规范的展示名称（displayName）和分组（group）。

核心规则：
1. displayName 优先匹配用户提供的「规范名称与分组对照表」，使用表中的规范名称
2. group 必须是对照表中已有的分组名；禁止自创分组名，也不要使用对照表已改名/删除的旧分组名
3. CCTV / CGTN / CETV、各省卫视、数字轮播、地方台等，一律按对照表中的分组归属填写
4. 注意区分易混淆频道：CCTV-5 与 CCTV-5+（体育赛事）、CCTV-4 与各语言版本
5. 纯数字、乱码、无法识别的名称归入「未知分组」，displayName 使用清理后的原名
6. 只返回 JSON 对象，格式为 {"results":[{"index":0,"displayName":"...","group":"..."}]}，不要 markdown 代码块`

const userPromptTemplate = `以下是用户维护的「规范名称与分组对照表」，分类时优先参考：
{{channels_table}}

待处理的原始频道名称（JSON 数组，每项含 index 与 rawName）：
{{raw_channels}}

请严格返回 JSON 对象，格式：{"results":[{"index":0,"displayName":"规范名称","group":"分组名"},...]}
若无法识别，group 填「未知分组」，displayName 使用清理后的原名。`

func DefaultConfig() Config {
	cfg, err := ConfigFromDefaultGroup()
	if err != nil || len(cfg.Groups) == 0 {
		return Config{Groups: []RuleGroup{}}
	}
	return cfg
}

func Parse(content string) (Config, error) {
	content = strings.TrimSpace(content)
	if content == "" {
		return DefaultConfig(), nil
	}
	var cfg Config
	if err := json.Unmarshal([]byte(content), &cfg); err != nil {
		return Config{}, err
	}
	if len(cfg.Groups) == 0 {
		return DefaultConfig(), nil
	}
	return cfg, nil
}

func (c Config) SystemPrompt() string {
	return systemPrompt
}

func (c Config) BuildUserPrompt(rawChannelsJSON string) string {
	out := userPromptTemplate
	out = strings.ReplaceAll(out, "{{channels_table}}", c.FormatChannelsTable())
	out = strings.ReplaceAll(out, "{{raw_channels}}", rawChannelsJSON)
	return out
}

func (c Config) FormatChannelsTable() string {
	if len(c.Groups) == 0 {
		return "（暂无对照表，请按通用规则分类）"
	}
	var b strings.Builder
	for _, g := range c.Groups {
		for _, name := range g.Channels {
			name = strings.TrimSpace(name)
			if name == "" {
				continue
			}
			b.WriteString("- ")
			b.WriteString(name)
			b.WriteString(" → ")
			b.WriteString(g.Name)
			b.WriteString("\n")
		}
	}
	return b.String()
}
