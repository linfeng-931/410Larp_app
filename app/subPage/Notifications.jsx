import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Stack, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Trash2, X, BellOff } from "lucide-react-native";
import { useUser } from "../../utils/userContext";
import { useAppStyles } from "../../utils/useAppStyles";
import {
  subscribeMyNotifications,
  deleteNotification,
} from "../../utils/authService";

export default function Notifications() {
  const { styles, isLight } = useAppStyles();
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    setLoading(true);

    // 訂閱通知
    const unsubscribe = subscribeMyNotifications(user.uid, (data) => {
      setNotifications(data || []);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // 處理刪除特定通知項目
  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
    } catch (error) {
      alert("刪除通知失敗，請稍後再試");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 15,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Pressable onPress={() => router.back()}>
          <ChevronLeft size={26} style={styles.cardIcon} />
        </Pressable>
        <Text style={[styles.title, { fontSize: 20 }]}>通知總覽</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#FFA000"
            style={{ marginTop: 40 }}
          />
        ) : notifications.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 80, gap: 12 }}>
            <BellOff size={48} color="#aaa" />
            <Text style={{ color: "#888", fontSize: 15 }}>
              目前沒有任何系統通知中心紀錄唷！
            </Text>
          </View>
        ) : (
          <View style={{ gap: 14, marginTop: 10 }}>
            {notifications.map((item) => (
              <View
                key={item.id}
                style={[
                  localStyles.notifyCard,
                  {
                    backgroundColor: isLight ? "#f9f9f9" : "#262626",
                    borderColor: isLight ? "#eee" : "#3a3a3a",
                  },
                ]}
              >
                {/* 內文區區塊 */}
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: isLight ? "#111" : "#fff",
                    }}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: isLight ? "#555" : "#bbb",
                      marginTop: 4,
                      lineHeight: 20,
                    }}
                  >
                    {item.message}
                  </Text>
                  {item.createdAt && (
                    <Text style={{ fontSize: 11, color: "#999", marginTop: 6 }}>
                      {new Date(item.createdAt.seconds * 1000).toLocaleString()}
                    </Text>
                  )}
                </View>

                <Pressable
                  onPress={() => handleDelete(item.id)}
                  style={({ pressed }) => [
                    localStyles.deleteBtn,
                    { opacity: pressed ? 0.5 : 1 },
                  ]}
                >
                  <X size={18} color={isLight ? "#666" : "#aaa"} />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  notifyCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  deleteBtn: {
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
