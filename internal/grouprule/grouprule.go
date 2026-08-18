package grouprule

import (
	"strings"
)

const UnknownGroup = "未知分组"

const (
	rankExtra   = 1_000_000
	rankUnknown = 2_000_000
)

type Group struct {
	Name     string
	Channels []string
}

type Index struct {
	GroupRank    map[string]int
	NameToGroups map[string][]string
	NameRank     map[string]map[string]int
}

func Build(groups []Group) Index {
	idx := Index{
		GroupRank:    make(map[string]int),
		NameToGroups: make(map[string][]string),
		NameRank:     make(map[string]map[string]int),
	}
	groupPos := 0
	for _, g := range groups {
		name := strings.TrimSpace(g.Name)
		if name == "" || name == UnknownGroup {
			continue
		}
		if _, exists := idx.GroupRank[name]; !exists {
			idx.GroupRank[name] = groupPos
			groupPos++
		}
		if _, ok := idx.NameRank[name]; !ok {
			idx.NameRank[name] = make(map[string]int)
		}
		channelPos := len(idx.NameRank[name])
		for _, raw := range g.Channels {
			channel := strings.TrimSpace(raw)
			if channel == "" {
				continue
			}
			owned := idx.NameToGroups[channel]
			if !containsString(owned, name) {
				idx.NameToGroups[channel] = append(owned, name)
			}
			if _, exists := idx.NameRank[name][channel]; !exists {
				idx.NameRank[name][channel] = channelPos
				channelPos++
			}
		}
	}
	return idx
}

func (idx Index) Empty() bool {
	return len(idx.GroupRank) == 0 && len(idx.NameToGroups) == 0
}

// Rematch 按规则表回填分组：
// A. 名称能在规则表查到 → 规则表分组；一名多组时，当前分组仍有效则保留，否则取首次出现的分组
// B/C. 其余（分组已不存在，或名称全表都没有）→ 未知分组
func (idx Index) Rematch(name, currentGroup string) string {
	name = strings.TrimSpace(name)
	currentGroup = strings.TrimSpace(currentGroup)
	if currentGroup == "" {
		currentGroup = UnknownGroup
	}
	if idx.Empty() {
		return currentGroup
	}
	groups := idx.NameToGroups[name]
	if len(groups) == 0 {
		return UnknownGroup
	}
	if containsString(groups, currentGroup) {
		return currentGroup
	}
	return groups[0]
}

func containsString(list []string, target string) bool {
	for _, item := range list {
		if item == target {
			return true
		}
	}
	return false
}

func (idx Index) GroupLess(a, b string) bool {
	ka, kb := idx.groupKey(a), idx.groupKey(b)
	if ka != kb {
		return ka < kb
	}
	return a < b
}

func (idx Index) ChannelLess(group, a, b string) bool {
	ka, kb := idx.channelKey(group, a), idx.channelKey(group, b)
	if ka != kb {
		return ka < kb
	}
	return a < b
}

func (idx Index) groupKey(name string) int {
	name = strings.TrimSpace(name)
	if name == UnknownGroup || name == "" {
		return rankUnknown
	}
	if r, ok := idx.GroupRank[name]; ok {
		return r
	}
	return rankExtra
}

func (idx Index) channelKey(group, name string) int {
	group = strings.TrimSpace(group)
	name = strings.TrimSpace(name)
	if ranks, ok := idx.NameRank[group]; ok {
		if r, ok := ranks[name]; ok {
			return r
		}
	}
	return rankExtra
}
