import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  Modal,
  FlatList,
} from "react-native";

import { Stack, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Weekly from "../../components/Weekly";
import HomeBtn from "../../components/HomeBtn";
import Payment from "../../components/Payment";
import Footer from "../../components/Footer";
import { useUser } from "../../utils/userContext";
import { useAppStyles } from "../../utils/useAppStyles";

import { User, Bell } from "lucide-react-native";
import { subscribeMyNotifications } from "../../utils/authService";
import { useState, useEffect } from "react";

export default function Home() {
  const { styles, isLight } = useAppStyles();

  const { user, loading } = useUser();
  const data = [
    { btnName: "查找野團", route: "/subPage/OrganizeHome", id: "1" },
    { btnName: "你的揪團", route: "/subPage/YourOrganize", id: "2" },
  ];
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      return;
    }

    const unsubscribe = subscribeMyNotifications(user.uid, (list) => {
      setNotifications(list || []);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  return (
    <>
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <Stack.Screen />

        <ScrollView style={{ padding: 20 }}>
          <View style={{ gap: 24, marginBottom: 32 }}>
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                width: "100%",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {/* Greeting */}
              <View style={{ gap: 4 }}>
                <Text style={[styles.content5]}>
                  Hello {user?.displayName || "訪客"}
                </Text>
                <Text style={styles.content6}>查看今天的推理之旅</Text>
              </View>
              {/* Nav */}
              <View style={{ flexDirection: "row", gap: 12 }}>
                <Pressable
                  onPress={() => setShowDropdown(!showDropdown)}
                  style={[
                    styles.notifyIcon,
                    { maxWidth: 48, maxHeight: 48, position: "relative" },
                  ]}
                >
                  <Bell
                    color={isLight ? "#000" : "#fff"}
                    opacity={0.8}
                    size={24}
                  />
                  <View
                    style={{
                      position: "absolute",
                      right: 0,
                      top: 0,
                      width: 18,
                      height: 18,
                      backgroundColor: "#ff3131",
                      borderRadius: 9,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: 600 }}>
                      {notifications.length}
                    </Text>
                  </View>
                </Pressable>
                {/* Profile */}
                {user?.photoURL ? (
                  <Image
                    source={{ uri: user.photoURL }}
                    style={[styles.avatar, { maxWidth: 48, maxHeight: 48 }]}
                  />
                ) : (
                  <View
                    style={[
                      styles.emptyAvatar,
                      { maxWidth: 48, maxHeight: 48 },
                    ]}
                  >
                    <User
                      color={isLight ? "#000" : "#fff"}
                      opacity={0.8}
                      size={24}
                    />
                  </View>
                )}
              </View>
            </View>
            {/* Weekly */}
            <Weekly />
            {/* Payment */}
            {/* <Payment /> */}
            {/* Other */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
                gap: 24,
              }}
            >
              {data.map((item) => (
                <HomeBtn key={item.id} path={item.route} name={item.btnName} />
              ))}
            </View>
          </View>
        </ScrollView>
        <View style={{ height: 120 }} />
      </SafeAreaView>
      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)" }}
          onPress={() => setShowDropdown(false)}
        >
          <View
            style={{
              position: "absolute",
              top: 80,
              right: 20,
              width: 280,
              backgroundColor: isLight ? "#fff" : "#2a2a2a",
              borderRadius: 12,
              padding: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 5,
              elevation: 5,
            }}
          >
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 16,
                color: isLight ? "#000" : "#fff",
                marginBottom: 10,
              }}
            >
              最新通知
            </Text>

            {notifications.length === 0 ? (
              <Text
                style={{
                  color: "#888",
                  paddingVertical: 10,
                  textAlign: "center",
                }}
              >
                目前沒有新通知
              </Text>
            ) : (
              <FlatList
                data={notifications.slice(0, 3)}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View
                    style={{
                      borderBottomWidth: 0.5,
                      borderColor: isLight ? "#eee" : "#3a3a3a",
                      paddingVertical: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "600",
                        fontSize: 14,
                        color: isLight ? "#222" : "#eee",
                      }}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={{ fontSize: 12, color: "#777", marginTop: 2 }}
                      numberOfLines={1}
                    >
                      {item.message}
                    </Text>
                  </View>
                )}
              />
            )}

            <Pressable
              onPress={() => {
                setShowDropdown(false);
                router.push("/subPage/Notifications");
              }}
              style={{
                marginTop: 12,
                backgroundColor: "#FFA000",
                paddingVertical: 8,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 14 }}>
                查看所有通知
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
      <Footer page={1} />
    </>
  );
}
