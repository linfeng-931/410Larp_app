import { View, useColorScheme} from "react-native";
import { Stack } from "expo-router";
import { useState } from "react";
import { getStyles } from "../utils/styleFormat";
import Footer from "../components/Footer";
import { useFonts } from "expo-font";

export default function Page() {
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme);
  return (
    <>
      <Stack.Screen 
          options={{ 
            headerLeft: () => null,
            headerBackVisible: false,
            title: "首頁" 
          }} 
        />
        <View style={styles.container}>
        <View style={styles.main}>
        </View>

        <Footer page={1} />
      </View>
    </>
    
  );
}
