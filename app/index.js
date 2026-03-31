import { TouchableOpacity, Text, View, Image, useColorScheme, } from "react-native";
import { useState } from "react";
import { getStyles } from "../utils/styleFormat";
import Footer from "../components/Footer";
import { useFonts } from "expo-font";

export default function Page() {
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme);

  let [fontsLoaded] = useFonts({
    "no-bills": require("../assets/fonts/post-no-bills-colombo.extrabold.ttf"),
  });
  return (
    <View style={styles.container}>
      <View style={styles.main}></View>

      <Footer page={1} />
    </View>
  );
}
