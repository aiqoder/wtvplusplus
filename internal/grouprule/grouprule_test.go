package grouprule

import (
	"sort"
	"testing"
)

func testIndex(t *testing.T) Index {
	t.Helper()
	return Build([]Group{
		{Name: "央视频道", Channels: []string{"CCTV-1综合", "CCTV-2财经", "CCTV-10科教"}},
		{Name: "卫视频道", Channels: []string{"湖南卫视", "浙江卫视"}},
	})
}

func TestRematchRenameAndUnknown(t *testing.T) {
	idx := Build([]Group{
		{Name: "央视", Channels: []string{"CCTV-1综合", "CCTV-2财经"}},
		{Name: "卫视", Channels: []string{"湖南卫视"}},
	})

	if got := idx.Rematch("CCTV-1综合", "央视频道"); got != "央视" {
		t.Fatalf("rename group: got %q", got)
	}
	if got := idx.Rematch("湖南卫视", "央视"); got != "卫视" {
		t.Fatalf("move channel: got %q", got)
	}
	if got := idx.Rematch("地方台XYZ", "湖南省"); got != UnknownGroup {
		t.Fatalf("unknown name: got %q", got)
	}
	if got := idx.Rematch("地方台XYZ", "已删除分组"); got != UnknownGroup {
		t.Fatalf("missing group: got %q", got)
	}
}

func TestSortFollowsRuleOrder(t *testing.T) {
	idx := testIndex(t)
	groups := []string{"卫视频道", "未知分组", "自定义", "央视频道"}
	sort.SliceStable(groups, func(i, j int) bool {
		return idx.GroupLess(groups[i], groups[j])
	})
	want := []string{"央视频道", "卫视频道", "自定义", "未知分组"}
	for i := range want {
		if groups[i] != want[i] {
			t.Fatalf("group order: got %v want %v", groups, want)
		}
	}

	names := []string{"CCTV-10科教", "CCTV-1综合", "其他", "CCTV-2财经"}
	sort.SliceStable(names, func(i, j int) bool {
		return idx.ChannelLess("央视频道", names[i], names[j])
	})
	wantNames := []string{"CCTV-1综合", "CCTV-2财经", "CCTV-10科教", "其他"}
	for i := range wantNames {
		if names[i] != wantNames[i] {
			t.Fatalf("channel order: got %v want %v", names, wantNames)
		}
	}
}

func TestRematchKeepsValidMultiGroup(t *testing.T) {
	idx := Build([]Group{
		{Name: "卫视频道", Channels: []string{"湖南卫视", "浙江卫视"}},
		{Name: "湖南地区", Channels: []string{"湖南卫视", "金鹰卡通"}},
	})

	if got := idx.Rematch("湖南卫视", "湖南地区"); got != "湖南地区" {
		t.Fatalf("keep current multi-group: got %q", got)
	}
	if got := idx.Rematch("湖南卫视", "卫视频道"); got != "卫视频道" {
		t.Fatalf("keep first multi-group: got %q", got)
	}
	if got := idx.Rematch("湖南卫视", "未知分组"); got != "卫视频道" {
		t.Fatalf("unknown falls back to first group: got %q", got)
	}
	if got := idx.Rematch("湖南卫视", "已删除分组"); got != "卫视频道" {
		t.Fatalf("invalid group falls back to first: got %q", got)
	}
}
