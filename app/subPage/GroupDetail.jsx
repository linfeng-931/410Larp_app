import {
  View,
  Text,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CalendarDays,
  UsersRound,
  ShieldAlert,
  MessageSquareText,
} from "lucide-react-native";

import { stories } from "../../utils/story";
import { useAppStyles } from "../../utils/useAppStyles";
import { useUser } from "../../utils/userContext";
import { joinGroupEvent } from "../../utils/authService";
import Btn from "../../components/Btn";
import Header from "../../components/Header";

export default function GroupDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { styles, colorScheme } = useAppStyles();
  const { user, isGuest } = useUser();

  const [groupData, setGroupData] = useState(null);
  const [storyData, setStoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  // 抓取該揪團的詳細資料
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const docRef = doc(db, "groups", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setGroupData(data);
          // 透過揪團資料找尋本地端的劇本資源
          const sData = stories.find((s) => s.id === data.storyId);
          setStoryData(sData);
        } else {
          Alert.alert("錯誤", "找不到該揪團資訊");
          router.back();
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  // 處理點擊參與揪團
  const handleJoin = async () => {
    if (isGuest || !user) {
      Alert.alert("提示", "請先註冊或登入後再參與揪團", [
        { text: "取消", style: "cancel" },
        { text: "前往登入", onPress: () => router.push("/subPage/LogIn") },
      ]);
      return;
    }

    setJoining(true);
    try {
      // 呼叫我們在 authService 寫好的核心邏輯
      await joinGroupEvent(id, user.uid);

      Alert.alert(
        "成功",
        groupData.selectVerify
          ? "已送出申請，請等待主辦審核！"
          : "加入揪團成功！",
        [
          { text: "確定", onPress: () => router.replace("/") }, // 成功後返回首頁
        ],
      );
    } catch (error) {
      Alert.alert("無法加入", error.message || "發生錯誤，請稍後再試。");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#FFA000" />
      </SafeAreaView>
    );
  }

  if (!groupData || !storyData) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.main}>
          <Header styles={styles} font={"揪團詳細資訊"} />

          <View
            style={{
              paddingHorizontal: 32,
              width: "100%",
              gap: 32,
              alignItems: "center",
              marginTop: 24,
            }}
          >
            {/* 劇本封面 */}
            <Image
              source={storyData.cover}
              style={{ borderRadius: 8, width: 200, height: 280 }}
            />

            {/* 劇本與揪團名稱 */}
            <View style={{ alignItems: "center", gap: 8 }}>
              <Text style={styles.bigTitleNormal}>{groupData.title}</Text>
              <Text style={styles.content3}>{storyData.subtitle}</Text>
            </View>

            {/* 揪團相關資訊區塊 */}
            <View
              style={{
                width: "100%",
                gap: 16,
                backgroundColor:
                  colorScheme === "light" ? "#f5f5f5" : "#2a2a2a",
                padding: 20,
                borderRadius: 12,
              }}
            >
              <View style={styles.cardContent}>
                <UsersRound size={20} color="#FFA000" />
                <Text style={styles.content1}>
                  缺額人數：{groupData.neededPeople} 人
                </Text>
              </View>
              <View style={styles.cardContent}>
                <CalendarDays size={20} color="#FFA000" />
                <Text style={styles.content1}>
                  區間：{groupData.startDate} ~ {groupData.endDate}
                </Text>
              </View>
              <View style={styles.cardContent}>
                <ShieldAlert size={20} color="#FFA000" />
                <Text style={styles.content1}>
                  狀態：{groupData.selectVerify ? "須經審查" : "無條件加入"}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                  alignItems: "flex-start",
                }}
              >
                <MessageSquareText
                  size={20}
                  color="#FFA000"
                  style={{ marginTop: 2 }}
                />
                <Text style={[styles.content1, { flex: 1, lineHeight: 24 }]}>
                  備註：{groupData.otherRequire || "無"}
                </Text>
              </View>
            </View>

            {/* 劇本簡介 */}
            <View style={{ width: "100%", gap: 16 }}>
              <Text style={styles.title}>劇本概要</Text>
              <Text style={[styles.content2, { lineHeight: 24 }]}>
                {storyData.content}
              </Text>
            </View>

            {/* 參與揪團按鈕 */}
            <View style={{ width: "100%", marginTop: 16, marginBottom: 40 }}>
              <Btn
                colorScheme={colorScheme}
                font={joining ? "處理中..." : "參與揪團"}
                func={handleJoin}
                btnType={1}
                disabled={joining}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
