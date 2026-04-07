import { View, Text, ScrollView, ActivityIndicator, Image } from "react-native";

import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Weekly from "../../components/Weekly";
import HomeBtn from "../../components/HomeBtn";
import Payment from "../../components/Payment";
import Footer from "../../components/Footer";
import { useFonts } from "expo-font";
import { useUser } from "../../utils/userContext";
import { useAppStyles } from "../../utils/useAppStyles";

import { User } from "lucide-react-native";

export default function Home() {
  const { styles, isLight } = useAppStyles();

  const { user, loading } = useUser();
  const data = [
    { btnName: "查找野團", route: "/subPage/Home", id: "1" },
    { btnName: "你的揪團", route: "/subPage/Home", id: "2" },
  ];

  /* 文字載入 */
  let [fontsLoaded] = useFonts({
    Nobills: require("../../assets/fonts/PostNoBills.ttf"),
    ChFont: require("../../assets/fonts/ChFont.ttf"),
  });
  if (!fontsLoaded) return null;

  return (
    <>
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <Stack.Screen options={{ headerShown: false }} />

        <ScrollView style={{ padding: 20 }}>
          {loading ? (
            <ActivityIndicator size="large" />
          ) : (
            <View style={{ gap: 24 }}>
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
              {/* Weekly */}
              <Weekly />
              {/* Appoint */}
              {/* Payment */}
              <Payment />
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
                  <HomeBtn
                    key={item.id}
                    path={item.route}
                    name={item.btnName}
                  />
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
      <Footer page={1} />
    </>
  );
}
