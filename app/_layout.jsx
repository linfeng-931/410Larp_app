import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { KeyboardProvider } from "react-native-keyboard-controller";

export default function RootLayout(){
    return(
        <>
            <KeyboardProvider>
                <Stack>
                    <Stack.Screen name="index"/>
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