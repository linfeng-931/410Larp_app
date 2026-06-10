import {
    View,
    Text,
    Pressable,
    ScrollView,
    Platform,
    KeyboardAvoidingView,
} from "react-native";
import { Stack, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";
import Footer from "../../components/Footer";
import { useAppStyles } from "../../utils/useAppStyles";
import { useRef, useState } from "react";

export default function OrganizeComplete() {
    const { styles, isLight, colorScheme } = useAppStyles();
    const scrollRef = useRef(null);

  const animationRef = useRef(null);
  const loadingAnimation = require("../../assets/animation/Loading.json");
    const [loading, setLoading] = useState(false);
    return (
        <>
            <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
                <Stack.Screen />
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        contentContainerStyle={[styles.container, { gap: 32, justifyContent: 'center' }]}
                        showsVerticalScrollIndicator={false}
                        ref={scrollRef}
                        keyboardShouldPersistTaps="handled"
                    >
                        <LottieView
                            source={require('../../assets/animation/LottieSuccess.json')}
                            autoPlay
                            loop={false}
                            style={{
                                width: 100,
                                height: 100,
                            }}
                            colorFilters={[
                                {
                                    keypath: "Shape Layer 1",
                                    color: "#FFA500",
                                }
                            ]}
                        />

                        {/* Header */}
                        <Text style={styles.title}>成功發佈揪團</Text>

                        <View
                            style={{
                                width: "100%",
                                paddingHorizontal: 32,
                                gap: 24,
                            }}
                        >
                            {/* Button */}
                            <View
                                style={{
                                    gap: 18
                                }}
                            >
                                <Pressable
                                    onPress={() => router.replace("/")}
                                    disabled={loading}
                                    style={({ pressed }) => ({
                                        justifyContent: "center",
                                        alignItems: "center",
                                        padding: 8,
                                        flex: 1,
                                        height: 60,
                                        borderRadius: 8,
                                        backgroundColor: pressed ? "#e69303" : "#FFA000",
                                    })}
                                >
                                    {loading ? (
                                        <LottieView
                                            ref={animationRef}
                                            source={loadingAnimation}
                                            autoPlay
                                            loop={true}
                                            resizeMode="cover"
                                            style={{ width: "50%", height: "50%" }}
                                        />
                                    ) : (
                                        <Text
                                            style={{ fontSize: 16, color: "#fff", fontWeight: 900 }}
                                        >
                                            你的揪團
                                        </Text>
                                    )}
                                </Pressable>
                                <Pressable
                                    onPress={() => router.replace("/")}
                                    style={({ pressed }) => ({
                                        justifyContent: "center",
                                        alignItems: "center",
                                        padding: 8,
                                        flex: 1,
                                        height: 60,
                                        borderWidth: 1.5,
                                        borderRadius: 8,
                                        backgroundColor: pressed ? "#FFA000" : null,
                                        borderColor: pressed
                                            ? "#FFA000"
                                            : isLight
                                                ? "rgba(0,0,0,0.4)"
                                                : "rgba(255,255,255,0.4)",
                                    })}
                                >
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            color: isLight ? "#000" : "#fff",
                                            fontWeight: 900,
                                        }}
                                    >
                                        回到首頁
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                        <View style={{ height: 48 }} />
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>

            <Footer page={2} />
        </>
    );
}
