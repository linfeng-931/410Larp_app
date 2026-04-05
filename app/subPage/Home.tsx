import {
  View,
  useColorScheme,
  Text,
  TextInput,
  Pressable,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";

import { getStyles } from "../../utils/styleFormat";
import Images from "../../assets/images/images";
import { Stack, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import Footer from "../../components/Footer";
import { useFonts } from "expo-font";
import { useUser } from "../../utils/userContext";

import { User } from "lucide-react-native";

export default function Home() {
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme);

  const { user, loading } = useUser();

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
            <View>
              {/* Header */}
              <View>
                {/* Greeting */}
                <View style={{ gap: 4 }}>
                  <Text
                    style={[styles.content5, { textTransform: "capitalize" }]}
                  >
                    Hello {user?.displayName || "訪客"}
                  </Text>
                  <Text style={styles.content6}>查看今天的推理之旅</Text>
                </View>
                {/* Profile */}
                {user.photoURL ? (
                  <Image
                    source={{ uri: user.photoURL }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.emptyAvatar}>
                    <User
                      color={isLight ? "#000" : "#fff"}
                      opacity={0.8}
                      size={36}
                    />
                  </View>
                )}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
      <Footer page={1} />
    </>
  );
}
