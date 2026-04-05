import {
  View,
  useColorScheme,
  Text,
  TextInput,
  Pressable,
  Platform,
  ScrollView,
} from "react-native";

import { getStyles } from "../../utils/styleFormat";
import Images from "../../assets/images/images";
import { Stack, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useRef } from "react";
import Footer from "../../components/Footer";

export default function Home() {
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme);
  const isLight = colorScheme === "light";
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <Footer page={1} />
    </SafeAreaView>
  );
}
