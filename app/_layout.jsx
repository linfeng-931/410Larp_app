import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
SplashScreen.preventAutoHideAsync();

export default function RootLayout(){
    useEffect(() => {
        SplashScreen.hideAsync();
    }, []);

    return(
        <>
            <KeyboardProvider>
                <Stack>
                    <Stack.Screen name="index" options={{ headerShown: false }}/>
                    <Stack.Screen name="subPage/Home" />
                    <Stack.Screen name="story/[id]"/>
                    <Stack.Screen name="subPage/Library"/>
                    <Stack.Screen name="subPage/myBook"/>
                    <Stack.Screen name="subPage/Reservation"/>
                </Stack>
                <StatusBar style="auto"/>
            </KeyboardProvider>
        </>
    );
}
