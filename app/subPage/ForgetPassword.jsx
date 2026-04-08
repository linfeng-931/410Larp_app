import {
  View,
  useColorScheme,
  ImageBackground,
  Text,
  TextInput,
  Pressable,
  Platform,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { getStyles } from "../../utils/styleFormat";
import { useFonts } from "expo-font";
import { Stack, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useRef } from "react";
import Images from "../../assets/images/images";
import { Mail, CircleAlert } from "lucide-react-native";
import LottieView from "lottie-react-native";
import { resetPassword } from "../../utils/authService";
import { useAppStyles } from "../../utils/useAppStyles";

export default function ForgetPassword() {
  const { styles, isLight, colorScheme } = useAppStyles();
  const animationRef = useRef(null);
  const loadingAnimation = require("../../assets/animation/Loading.json");
  const scrollRef = useRef(null);
  // 表單狀態
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // 錯誤訊息
  const [emailError, setEmailError] = useState("");

  // 表單驗證
  const validate = () => {
    let isValid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("請輸入電子郵件");
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError("電子郵件格式不正確");
      isValid = false;
    } else {
      setEmailError("");
    }

    return isValid;
  };

  const handleReset = async () => {
    if (validate()) {
      setLoading(true);
      try {
        await resetPassword(email);
        Alert.alert(
          "重設信件已發送",
          "請檢查您的電子郵件收件匣，並點擊連結重設密碼。",
          [{ text: "確定", onPress: () => router.push("/subPage/LogIn") }],
        );
      } catch (error) {
        console.log("重設密碼錯誤:", error.code);
        if (error.code === "auth/user-not-found") {
          setEmailError("該電子郵件尚未註冊");
        } else if (error.code === "auth/invalid-email") {
          setEmailError("電子郵件格式無效");
        } else {
          Alert.alert("發送失敗", "暫時無法發送郵件，請稍後再試。");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  // 文字載入
  let [fontsLoaded] = useFonts({
    Nobills: require("../../assets/fonts/PostNoBills.ttf"),
    ChFont: require("../../assets/fonts/ChFont.ttf"),
  });
  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.container, { gap: 32 }]}
          showsVerticalScrollIndicator={false}
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
        >
          <ImageBackground
            style={styles.logInContainer}
            source={Images[colorScheme].LogIn}
          >
            {/* Header */}
            <View
              style={{
                alignItems: "center",
                gap: Platform.select({
                  ios: 8,
                  android: -8,
                }),
              }}
            >
              <Text style={styles.logInTitle}>忘記密碼</Text>
              <Text style={styles.content3}>輸入電子郵件來重設密碼</Text>
            </View>
            {/* Form Area */}
            {/* Email */}
            <View style={{ gap: 8, alignItems: "flex-end" }}>
              <View
                style={[
                  styles.inputFrame,
                  emailError
                    ? { borderColor: "#ff3131", borderWidth: 1 }
                    : null,
                ]}
              >
                <Mail color={isLight ? "#000" : "#fff"} />
                <TextInput
                  onChangeText={(val) => {
                    setEmail(val);
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                    if (emailError && emailRegex.test(val)) {
                      setEmailError("");
                    }
                  }}
                  value={email}
                  placeholder="example@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.textInput}
                />
              </View>
              {emailError ? (
                <View
                  style={{
                    flexDirection: "row",
                    gap: 4,
                    alignItems: "center",
                    alignSelf: "flex-end",
                  }}
                >
                  <CircleAlert color={"#ff3131"} size={12} />
                  <Text style={styles.warnText}>{emailError}</Text>
                </View>
              ) : null}
            </View>
            <Pressable
              onPress={handleReset}
              style={({ pressed }) => ({
                width: "100%",
                maxWidth: 338,
                height: 60,
                backgroundColor: pressed ? "#e69303" : "#FFA000",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 8,
                // iOS 陰影
                shadowColor: "#000",
                shadowOpacity: 0.15,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 0 },

                // Android 陰影
                elevation: 5,
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
                <Text style={{ fontSize: 16, color: "#fff", fontWeight: 900 }}>
                  重設密碼
                </Text>
              )}
            </Pressable>
            <Pressable onPress={() => router.push("/subPage/LogIn")}>
              {({ pressed }) => (
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Text
                    style={{
                      color: pressed ? "#bababa" : "#FFA000",
                      fontSize: 16,
                      fontWeight: "600",
                      textDecorationLine: "underline",
                    }}
                  >
                    返回登入
                  </Text>
                </View>
              )}
            </Pressable>
            <View
              style={{
                alignItems: "center",
                paddingTop: 24,
                width: "100%",
                maxWidth: 338,
                borderTopWidth: 1,
                borderTopColor: "#bababa",
              }}
            >
              <Pressable onPress={() => router.push("/subPage/SignUp")}>
                {({ pressed }) => (
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <Text style={styles.content1}>尚未加入?</Text>
                    <Text
                      style={{
                        color: pressed ? "#e69303" : "#FFA000",
                        fontSize: 16,
                        fontWeight: "600",
                        textDecorationLine: "underline",
                      }}
                    >
                      點此註冊
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>
          </ImageBackground>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
