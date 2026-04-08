import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useEffect } from "react";
import { UserProvider } from "../utils/userContext";
import * as SplashScreen from "expo-splash-screen";
import { ThemeProvider } from "../utils/useAppStyles";
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ThemeProvider>
      <UserProvider>
        <KeyboardProvider>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="subPage/LogIn" />
            <Stack.Screen name="subPage/SignUp" />
            <Stack.Screen name="subPage/Home" />
            <Stack.Screen name="story/[id]" />
            <Stack.Screen name="subPage/Library" />
            <Stack.Screen name="subPage/myBook" />
            <Stack.Screen name="subPage/Reservation" />
            <Stack.Screen name="subPage/Setting" />
            <Stack.Screen name="subPage/AccountSetting" />
          </Stack>
          <StatusBar style="auto" />
        </KeyboardProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
