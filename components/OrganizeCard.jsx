import React from "react";
import { View, Text, Image, Pressable, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { Calendar, Users } from "lucide-react-native";
import { stories } from "../utils/story";
import { deleteGroup } from "../utils/authService";
import { useUser } from "../utils/userContext";
import { useMemo } from "react";

const getStoryCover = (storyId) => {
  const story = stories.find((s) => s.id === storyId);
  return story ? story.cover : null;
};

// 1. 橫向滑動卡片 (RecentGroupCard)
export function RecentGroupCard({ group, colorScheme, isLight }) {
  const coverImage = getStoryCover(group.storyId);
  const otherPeopleCount = Math.max(0, (group.currentPeople || 1) - 1);

  return (
    <Pressable
      onPress={() =>
        router.push(`/subPage/GroupDetail?id=${group.id}&showJoinBtn=true`)
      }
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

// 2. 滿版縱向卡片 (GroupListCard)
export function GroupListCard({
  group,
  colorScheme,
  isLight,
  displayBtn = true,
}) {
  const coverImage = getStoryCover(group.storyId);
  const otherPeopleCount = Math.max(0, (group.currentPeople || 1) - 1);

  return (
    <Pressable
      onPress={() =>
        router.push(
          `/subPage/GroupDetail?id=${group.id}&showJoinBtn=${displayBtn}`,
        )
      }
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

// 3. 你的揪團狀態卡片 (MyGroupCard)
export function MyGroupCard({
  group,
  colorScheme,
  isLight,
  onRefresh,
  onHide,
}) {
  const { user } = useUser(); // 取得當前登入使用者的預約資料
  const todayStr = new Date().toISOString().split("T")[0];

  const isFull = group.neededPeople <= 0;
  const isExpired = !isFull && group.endDate < todayStr;
  const story = stories.find((s) => s.id === group.storyId) || {};

  const isCompletedReservation = useMemo(() => {
    if (!user?.appointments || !group.title) return false;

    const cleanGroupTitle = group.title.trim().replace(/\s+/g, "");
    const cleanGroupDate = group.startDate ? group.startDate.trim() : "";

    console.log(`正在比對揪團: ${cleanGroupTitle} (${cleanGroupDate})`);

    return user.appointments.some((appt) => {
      const cleanApptTitle = appt.title
        ? appt.title.trim().replace(/\s+/g, "")
        : "";
      const cleanApptDate = appt.date ? appt.date.trim() : "";

      const isTitleMatch =
        cleanApptTitle === cleanGroupTitle ||
        cleanApptTitle.includes(cleanGroupTitle) ||
        cleanGroupTitle.includes(cleanApptTitle);
      if (isTitleMatch)
        console.log(cleanApptTitle, cleanGroupTitle, "完成預約");
      else
        console.log(
          "cleanApptTitle : " +
            cleanApptTitle +
            "cleanGroupTitle : " +
            cleanGroupTitle,
        );

      return isTitleMatch;
    });
  }, [user?.appointments, group.startDate, group.title]);

  const handleDelete = () => {
    Alert.alert(
      "刪除揪團",
      "確定要刪除這個已過期的揪團嗎？刪除後列表將同步更新。",
      [
        { text: "取消", style: "cancel" },
        {
          text: "確認刪除",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteGroup(group.id);
              if (onRefresh) onRefresh();
            } catch (error) {
              Alert.alert("錯誤", "刪除失敗");
            }
          },
        },
      ],
    );
  };

  const goReservation = () => {
    router.push({
      pathname: "/subPage/Reservation",
      params: {
        title: story.title || group.title || "未知劇本",
        hour: story.time || "4",
        people: Array.isArray(story.people)
          ? story.people.join("-")
          : story.people,
        price: story.price?.toString() || "0",
      },
    });
  };

  return (
    <View style={{ position: "relative", marginBottom: 16 }}>
      <GroupListCard
        group={group}
        colorScheme={colorScheme}
        isLight={isLight}
        displayBtn={false}
      />

      {isCompletedReservation ? (
        <View style={styles.overlayContainer}>
          <Text style={styles.overlayText}>已完成預約</Text>
          <Pressable
            onPress={() => {
              if (onHide) onHide(group.id); // 觸發純前端隱藏
            }}
            style={[styles.overlayBtn, { backgroundColor: "#ff8c8c" }]}
          >
            <Text style={styles.overlayBtnText}>點擊以移除此顯示</Text>
          </Pressable>
        </View>
      ) : (
        isFull && (
          <View style={styles.overlayContainer}>
            <Text style={styles.overlayText}>揪團已滿</Text>
            <Pressable style={styles.overlayBtn} onPress={goReservation}>
              <Text style={styles.overlayBtnText}>前往預約</Text>
            </Pressable>
          </View>
        )
      )}

      {isExpired && !isCompletedReservation && (
        <Pressable style={styles.overlayContainer} onPress={handleDelete}>
          <Text style={styles.overlayText}>揪團已過期</Text>
          <Text
            style={[styles.overlayBtnText, { marginTop: 8, color: "#ff8c8c" }]}
          >
            點擊卡片以刪除此紀錄
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  recentCard: {
    width: 160,
    borderRadius: 12,
    marginRight: 14,
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
    backgroundColor: "#ccc",
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
    marginLeft: -6,
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
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.75)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  overlayText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  overlayBtn: {
    backgroundColor: "#FFA000",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  overlayBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
