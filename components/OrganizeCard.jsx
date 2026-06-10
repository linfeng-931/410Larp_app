import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Calendar, Users } from "lucide-react-native";
import { stories } from "../utils/story";

const getStoryCover = (storyId) => {
  const story = stories.find((s) => s.id === storyId);
  return story ? story.cover : null;
};

/* ────────────────────────────────────────────────────────
   1. 最近揪團 - 橫向滑動卡片 (RecentGroupCard)
   ──────────────────────────────────────────────────────── */
export function RecentGroupCard({ group, colorScheme, isLight }) {
  const coverImage = getStoryCover(group.storyId);
  const otherPeopleCount = Math.max(0, (group.currentPeople || 1) - 1);

  return (
    <Pressable
      onPress={() => router.push(`/subPage/GroupDetail?id=${group.id}`)}
      style={[
        styles.recentCard,
        { backgroundColor: isLight ? "#FFFFFF" : "#1E1E1E" },
      ]}
    >
      <Image
        source={coverImage}
        style={styles.recentCover}
        resizeMode="cover"
      />

      <View style={styles.recentContent}>
        <Text
          style={[styles.recentTitle, { color: isLight ? "#000" : "#fff" }]}
          numberOfLines={1}
        >
          {group.title}
        </Text>

        <View style={styles.dateRow}>
          <Calendar color="#FFA000" size={12} />
          <Text style={styles.dateText} numberOfLines={1}>
            {group.startDate} ~ {group.endDate}
          </Text>
        </View>

        <View style={styles.avatarRow}>
          {/* 修正點 3：添加預設頭像佔位樣式，防範未上傳圖片時出現的破圖 */}
          <View style={[styles.avatarWrapper, { backgroundColor: "#ccc" }]}>
            {group.hostPhotoURL ? (
              <Image
                source={{ uri: group.hostPhotoURL }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarPlaceholder} />
            )}
          </View>
          <View style={styles.plusBadge}>
            <Text style={styles.plusText}>+{otherPeopleCount}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

/* ────────────────────────────────────────────────────────
   2. 劇本查詢 - 滿版縱向卡片 (GroupListCard)
   ──────────────────────────────────────────────────────── */
export function GroupListCard({ group, colorScheme, isLight }) {
  const coverImage = getStoryCover(group.storyId);
  const otherPeopleCount = Math.max(0, (group.currentPeople || 1) - 1);

  return (
    <Pressable
      onPress={() => router.push(`/subPage/GroupDetail?id=${group.id}`)}
      style={[
        styles.listCard,
        { backgroundColor: isLight ? "#FFFFFF" : "#1E1E1E" },
      ]}
    >
      <Image source={coverImage} style={styles.listCover} resizeMode="cover" />

      <View style={styles.listContent}>
        <View style={{ gap: 4 }}>
          <Text
            style={[styles.listTitle, { color: isLight ? "#000" : "#fff" }]}
            numberOfLines={1}
          >
            {group.title}
          </Text>

          <View style={styles.dateRow}>
            <Calendar color="#FFA000" size={14} />
            <Text style={styles.dateText} numberOfLines={1}>
              {group.startDate} 至 {group.endDate}
            </Text>
          </View>
        </View>

        <View style={styles.listFooter}>
          <View style={styles.lackPeopleRow}>
            <Users color="#ff3131" size={16} />
            <Text style={styles.lackPeopleText}>
              缺{" "}
              <Text style={{ fontWeight: "bold" }}>{group.neededPeople}</Text>{" "}
              人
            </Text>
          </View>

          <View style={styles.avatarRow}>
            <View style={[styles.avatarWrapper, { backgroundColor: "#ccc" }]}>
              {group.hostPhotoURL ? (
                <Image
                  source={{ uri: group.hostPhotoURL }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarPlaceholder} />
              )}
            </View>
            <View style={styles.plusBadge}>
              <Text style={styles.plusText}>+{otherPeopleCount}</Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  recentCard: {
    width: 160,
    borderRadius: 12,
    marginRight: 14, // 透過右邊距控制橫向卡片彼此的間隔
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  recentCover: {
    width: "100%",
    height: 110,
  },
  recentContent: {
    padding: 10,
    gap: 6,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  listCard: {
    width: "100%",
    flexDirection: "row",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  listCover: {
    width: 90,
    height: 110,
  },
  listContent: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  listTitle: {
    fontSize: 15,
    fontWeight: "bold",
  },
  listFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    color: "#666",
    flex: 1,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrapper: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: "#fff",
    overflow: "hidden",
    zIndex: 2,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
  },
  plusBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#fff",
    marginLeft: -6, // 頭像些微疊加效果
    zIndex: 1,
  },
  plusText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#555",
  },
  lackPeopleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  lackPeopleText: {
    fontSize: 12,
    color: "#ff3131",
  },
});
