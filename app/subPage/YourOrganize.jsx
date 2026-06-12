import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Stack, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Footer from "../../components/Footer";
import { useUser } from "../../utils/userContext";
import { useAppStyles } from "../../utils/useAppStyles";
import { ChevronLeft, ClipboardList } from "lucide-react-native";
import { subscribeMyOrganizedGroups } from "../../utils/authService";
import { MyGroupCard } from "../../components/OrganizeCard";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function YourOrganize() {
  const { styles, isLight, colorScheme } = useAppStyles();
  const { user } = useUser();
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const [hiddenGroupIds, setHiddenGroupIds] = useState([]);

  useEffect(() => {
    const loadHiddenGroups = async () => {
      if (!user?.uid) return;
      try {
        const storedHiddenIds = await AsyncStorage.getItem(
          `hiddenGroups_${user.uid}`,
        );
        if (storedHiddenIds) {
          setHiddenGroupIds(JSON.parse(storedHiddenIds));
        }
      } catch (error) {
        console.error("讀取本地隱藏揪團紀錄失敗:", error);
      }
    };

    loadHiddenGroups();
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);

    const unsubscribe = subscribeMyOrganizedGroups(user.uid, (data) => {
      setMyGroups(data || []);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user?.uid]);

  const totalPending = myGroups.reduce((acc, curr) => {
    return acc + (curr.pendingApprovals ? curr.pendingApprovals.length : 0);
  }, 0);

  const handleHideGroup = async (groupId) => {
    if (!user?.uid) return;

    try {
      const updatedIds = [...hiddenGroupIds, groupId];
      setHiddenGroupIds(updatedIds);
      await AsyncStorage.setItem(
        `hiddenGroups_${user.uid}`,
        JSON.stringify(updatedIds),
      );
    } catch (error) {
      console.error("同步隱藏紀錄至本地失敗:", error);
    }
  };

  const visibleGroups = myGroups.filter(
    (group) => !hiddenGroupIds.includes(group.id),
  );

  return (
    <>
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ paddingHorizontal: 20, paddingVertical: 10 }}>
            <View
              style={{
                width: "100%",
                justifyContent: "space-between",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <Pressable onPress={() => router.push("/subPage/Home")}>
                <ChevronLeft size={24} style={styles.cardIcon} />
              </Pressable>
              <Text style={[styles.title, { textAlign: "center" }]}>
                你的揪團
              </Text>
              <View style={{ width: 24 }} />
            </View>
          </View>

          <View style={{ paddingHorizontal: 20, marginTop: 24, gap: 32 }}>
            <View style={{ gap: 12 }}>
              <Text style={[styles.title, { fontSize: 17 }]}>待辦事項</Text>
              <Pressable
                onPress={() => router.push("/subPage/PendingApprovals")}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 16,
                  backgroundColor: pressed
                    ? isLight
                      ? "#e0e0e0"
                      : "#333"
                    : isLight
                      ? "#f5f5f5"
                      : "#2a2a2a",
                  borderRadius: 12,
                })}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <ClipboardList color="#FFA000" size={24} />
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: isLight ? "#000" : "#fff",
                    }}
                  >
                    待審核清單
                  </Text>
                </View>

                {totalPending > 0 ? (
                  <View
                    style={{
                      backgroundColor: "#ff3131",
                      borderRadius: 16,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: 14,
                      }}
                    >
                      {totalPending}
                    </Text>
                  </View>
                ) : (
                  <Text style={{ color: "#888" }}>無</Text>
                )}
              </Pressable>
            </View>

            <View style={{ gap: 12 }}>
              <Text style={[styles.title, { fontSize: 17 }]}>
                歷史與進行中的揪團
              </Text>

              {loading ? (
                <ActivityIndicator
                  size="large"
                  color="#FFA000"
                  style={{ marginTop: 40 }}
                />
              ) : visibleGroups.length === 0 ? (
                <View style={{ alignItems: "center", paddingVertical: 40 }}>
                  <Text style={{ color: "#888" }}>
                    目前沒有發起中的揪團喔！
                  </Text>
                </View>
              ) : (
                visibleGroups.map((group) => (
                  <MyGroupCard
                    key={group.id}
                    group={group}
                    colorScheme={colorScheme}
                    isLight={isLight}
                    onHide={handleHideGroup}
                  />
                ))
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      <Footer page={1} />
    </>
  );
}
