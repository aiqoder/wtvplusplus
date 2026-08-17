package defaultgroup

import (
	_ "embed"
	"encoding/json"
	"strings"
)

// GroupItem 默认分组：分组名与频道规范名称列表
type GroupItem struct {
	GroupName string   `json:"groupname"`
	TvNames   []string `json:"tvNames"`
}

//go:embed groups.json
var groupsJSON []byte

// All 返回内置默认分组数据
func All() ([]GroupItem, error) {
	var groups []GroupItem
	if err := json.Unmarshal(groupsJSON, &groups); err != nil {
		return nil, err
	}
	return groups, nil
}

// GroupMap 返回分组名 → # 分隔的频道名称字符串
func GroupMap() (map[string]string, error) {
	groups, err := All()
	if err != nil {
		return nil, err
	}
	m := make(map[string]string, len(groups))
	for _, g := range groups {
		m[g.GroupName] = strings.Join(g.TvNames, "#")
	}
	return m, nil
}
