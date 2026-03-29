import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { KeyboardProvider } from "react-native-keyboard-controller";

export default function RootLayout(){
    return(
        <>
            <KeyboardProvider>
                <Stack>
                    <Stack.Screen name="index"/>
                    <Stack.Screen name="item/[id]"/>
                    <Stack.Screen name="subPage/bookMark"/>
                    <Stack.Screen name="subPage/myBook"/>
                </Stack>
                <StatusBar style="auto"/>
            </KeyboardProvider>
        </>
    );
}