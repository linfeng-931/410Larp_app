import {
  View,
  ScrollView,
  Image,
  Text,
  Switch,
  Pressable,
  Alert,
} from "react-native";
import { logout, checkDeleteAccount } from "../../utils/authService";
import { Stack, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useRef } from "react";
import { useUser } from "../../utils/userContext";
import { useAppStyles } from "../../utils/useAppStyles";
import {
  CircleUserRound,
  ScrollText,
  ChevronRight,
  Bell,
  SunMoon,
  User,
  Mail,
  Star,
  Trash2,
  LogOut,
} from "lucide-react-native";

import Footer from "../../components/Footer";
import Header from "../../components/Header";
import SettingCard from "../../components/SettingCard";

export default function Setting() {
  const { styles, colorScheme, isLight, setMode } = useAppStyles();
  const toggleTheme = (value) => {
    setMode(value ? "dark" : "light");
  };

  const scrollRef = useRef(null);
  const [checked, setChecked] = useState(false);

  const { user, setUser, isGuest } = useUser();
  const handleLogout = async () => {
    if (isGuest) {
      router.replace("subPage/LogIn");
    } else {
      try {
        Alert.alert("登出", "您確定要登出嗎?", [
          {
            text: "登出",
            style: "destructive",
            onPress: async () => {
              await logout();
              setUser(null);
              router.replace("subPage/LogIn");
            },
          },
          { text: "取消", style: "cancel" },
        ]);
      } catch (error) {
        console.error("登出失敗：", error);
      }
    }
  };
  const handleDeletePress = () => {
    if (isGuest) {
      Alert.alert("訪客帳號不予刪除");
      return;
    }
    Alert.alert("刪除帳號", "這將永久刪除您的所有資料，確定要繼續嗎？", [
      { text: "取消", style: "cancel" },
      {
        text: "確定刪除",
        style: "destructive",
        onPress: async () => {
          try {
            await checkDeleteAccount();
            setUser(null);

            Alert.alert("已刪除", "您的帳號與資料已從系統移除。", [
              { text: "確定", onPress: () => router.replace("/subPage/LogIn") },
            ]);
          } catch (error) {
            console.log(error.code);
          }
        },
      },
    ]);
  };

  const accountDetail = [
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        alignItems: "center",
      }}
    >
      <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
        <CircleUserRound style={styles.cardIcon} />
        <Text style={styles.content1}>會員資料</Text>
      </View>
      <ChevronRight style={styles.cardIcon} />
    </View>,
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        alignItems: "center",
      }}
    >
      <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
        <ScrollText style={styles.cardIcon} />
        <Text style={styles.content1}>預約紀錄</Text>
      </View>

      <ChevronRight style={styles.cardIcon} />
    </View>,
  ];
  const accountDetailLink = [
    "/subPage/AccountSetting",
    "/subPage/PurchaseHistory",
  ];

  const basicSetting = [
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        alignItems: "center",
      }}
    >
      <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
        <Bell style={styles.cardIcon} />
        <Text style={styles.content1}>通知</Text>
      </View>
      <Switch
        value={checked}
        onValueChange={setChecked}
        trackColor={{ true: "#FFA000" }}
        style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
      />
    </View>,
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        alignItems: "center",
      }}
    >
      <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
        <SunMoon style={styles.cardIcon} />
        <Text style={styles.content1}>
          {!isLight ? "淺色模式" : "深色模式"}
        </Text>
      </View>
      <Switch
        value={!isLight}
        onValueChange={toggleTheme}
        trackColor={{ true: "#FFA000" }}
        style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
      />
    </View>,
  ];
  const help = [
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        alignItems: "center",
      }}
    >
      <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
        <Mail style={styles.cardIcon} />
        <Text style={styles.content1}>意見回饋</Text>
      </View>
      <View />
    </View>,
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        alignItems: "center",
      }}
    >
      <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
        <Star style={styles.cardIcon} />
        <Text style={styles.content1}>評論App</Text>
      </View>
      <View />
    </View>,
  ];

  const deleteBtn = [
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        alignItems: "center",
      }}
    >
      <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
        <Trash2
          style={{
            justifyContent: "center",
            alignItems: "center",
            color: "rgb(225, 0, 0)aba",
            opacity: 0.9,
          }}
        />
        <Text style={{ color: "rgb(225, 0, 0)aba", fontSize: 16 }}>
          刪除帳戶
        </Text>
      </View>
      <View />
    </View>,
  ];

  return (
    <>
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <Stack.Screen options={{ headerShown: false }} />

        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
            ref={scrollRef}
          >
            <Header styles={styles} font={"設定"} />

            <View
              style={{
                flexDirection: "row",
                gap: 24,
                width: "100%",
                paddingHorizontal: 32,
                marginVertical: 32,
              }}
            >
              {/* Profile */}
              {user?.photoURL ? (
                <Image
                  source={{ uri: user.photoURL }}
                  style={[styles.avatar, { maxWidth: 72, maxHeight: 72 }]}
                />
              ) : (
                <View
                  style={[styles.emptyAvatar, { maxWidth: 72, maxHeight: 72 }]}
                >
                  <User
                    color={isLight ? "#000" : "#fff"}
                    opacity={0.8}
                    size={24}
                  />
                </View>
              )}
              <View style={{ justifyContent: "center", gap: 8 }}>
                <Text style={styles.title}>{user?.displayName || "訪客"}</Text>
                <Text style={styles.content4}>{user?.email || "訪客"}</Text>
              </View>
            </View>
            <View
              style={{
                width: "100%",
                paddingHorizontal: 32,
                gap: 16,
                marginBottom: 32,
              }}
            >
              <Text style={styles.content4}>會員專區</Text>
              <SettingCard
                contents={accountDetail}
                colorScheme={colorScheme}
                link={accountDetailLink}
                type={0}
              />
            </View>
            <View
              style={{
                width: "100%",
                paddingHorizontal: 32,
                gap: 16,
                marginBottom: 32,
              }}
            >
              <Text style={styles.content4}>基本設定</Text>
              <SettingCard
                contents={basicSetting}
                colorScheme={colorScheme}
                link={accountDetailLink}
                type={0}
              />
            </View>
            <View
              style={{
                width: "100%",
                paddingHorizontal: 32,
                gap: 16,
                marginBottom: 32,
              }}
            >
              <Text style={styles.content4}>需要幫助？</Text>
              <SettingCard
                contents={help}
                colorScheme={colorScheme}
                link={accountDetailLink}
                type={0}
              />
            </View>
            <View
              style={{
                width: "100%",
                paddingHorizontal: 32,
                gap: 16,
                marginBottom: 32,
              }}
            >
              <Text style={styles.content4}>帳戶</Text>
              <SettingCard
                contents={deleteBtn}
                colorScheme={colorScheme}
                link={handleDeletePress}
                type={1}
              />
            </View>

            <Pressable
              style={({ pressed }) => ({
                width: "100%",
                opacity: pressed ? 0.5 : 1,
              })}
              onPress={() => {
                handleLogout();
              }}
            >
              <View
                style={{
                  width: "100%",
                  alignItems: "center",
                  gap: 16,
                  justifyContent: "center",
                  flexDirection: "row",
                }}
              >
                <LogOut color={isLight ? "#000" : "#fff"} size={24} />
                <Text style={styles.content1}>登出</Text>
              </View>
            </Pressable>
          </ScrollView>
        </View>
      </SafeAreaView>
      <Footer page={4} />
    </>
  );
}
