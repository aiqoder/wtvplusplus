package prompt

import (
	"strings"

	"wtv/internal/defaultgroup"
)

// ConfigFromDefaultGroup 从 defaultgroup 内置数据构建配置
func ConfigFromDefaultGroup() (Config, error) {
	groups, err := defaultgroup.All()
	if err != nil {
		return Config{}, err
	}
	result := make([]RuleGroup, 0, len(groups))
	for _, g := range groups {
		channels := make([]string, 0, len(g.TvNames))
		for _, name := range g.TvNames {
			name = strings.TrimSpace(name)
			if name == "" {
				continue
			}
			channels = append(channels, name)
		}
		if len(channels) == 0 {
			continue
		}
		result = append(result, RuleGroup{
			Name:     g.GroupName,
			Channels: channels,
		})
	}
	return Config{Groups: result}, nil
}
