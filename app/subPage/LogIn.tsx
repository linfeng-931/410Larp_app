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
import { useFonts } from "expo-font";
import Images from "../../assets/images/images";
import { Stack, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useRef } from "react";
import { Mail, Lock, CircleAlert, Eye, EyeClosed } from "lucide-react-native";
import { checkSignIn } from "../../utils/authService";
import { useUser } from "../../utils/userContext";
import LottieView from "lottie-react-native";
import { useAppStyles } from "../../utils/useAppStyles";

export default function LogIn() {
  const { styles, isLight, colorScheme } = useAppStyles();

  const animationRef = useRef(null);
  const loadingAnimation = require("../../assets/animation/Loading.json");
  const scrollRef = useRef(null);
  const { setUser, setGuest } = useUser();

  // 表單狀態
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordShow, setPassWordShow] = useState(false);

  // 錯誤訊息
  const [emailError, setEmailError] = useState("");
  const [passwordError, setePasswordError] = useState("");

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
    if (!password) {
      setePasswordError("請輸入密碼");
      isValid = false;
    } else {
      setePasswordError("");
    }

    return isValid;
  };

  const handleLogIn = async () => {
    if (validate()) {
      setLoading(true);
      try {
        await checkSignIn(email, password);
        setGuest(false);
        Alert.alert("登入成功", "歡迎來到推理之旅！", [
          { text: "確定", onPress: () => router.push("/subPage/Home") },
        ]);
      } catch (error: any) {
        console.log("登入錯誤代碼:", error.code);

        if (
          error.code === "auth/invalid-credential" ||
          error.code === "auth/wrong-password" ||
          error.code === "auth/user-not-found"
        ) {
          Alert.alert("登入失敗", "帳號或密碼錯誤。");
          setEmailError("帳號或密碼錯誤");
          setePasswordError("帳號或密碼錯誤");
        } else if (error.code === "auth/too-many-requests") {
          Alert.alert("登入失敗", "嘗試次數過多，請稍後再試。");
        } else {
          Alert.alert("登入失敗", "伺服器異常，請聯繫管理員。");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <Stack.Screen />
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
              <Text style={styles.logInTitle}>LogIn</Text>
              <Text style={styles.content3}>開啟你的推理之旅</Text>
            </View>
            {/* Form Area */}
            <View style={{ gap: 16, alignItems: "flex-end" }}>
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
                    placeholderTextColor={
                      isLight
                        ? "rgba(0, 0, 0, 0.4)"
                        : "rgba(255, 255, 255, 0.4)"
                    }
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
              {/* Password */}
              <View style={{ gap: 8, alignItems: "flex-end" }}>
                <View
                  style={[
                    styles.inputFrame,
                    passwordError
                      ? { borderColor: "#ff3131", borderWidth: 1 }
                      : null,
                  ]}
                >
                  <Lock color={isLight ? "#000" : "#fff"} />
                  <TextInput
                    onChangeText={(val) => {
                      setPassword(val);

                      if (passwordError) {
                        setePasswordError("");
                      }
                    }}
                    value={password}
                    placeholder="輸入密碼"
                    placeholderTextColor={
                      isLight
                        ? "rgba(0, 0, 0, 0.4)"
                        : "rgba(255, 255, 255, 0.4)"
                    }
                    secureTextEntry={!passwordShow}
                    style={styles.textInput}
                  />
                  <Pressable onPress={() => setPassWordShow(!passwordShow)}>
                    {passwordShow ? (
                      <Eye color={isLight ? "#000" : "#fff"} size={20} />
                    ) : (
                      <EyeClosed color={isLight ? "#000" : "#fff"} size={20} />
                    )}
                  </Pressable>
                </View>
                {passwordError ? (
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 4,
                      alignItems: "center",
                      alignSelf: "flex-end",
                    }}
                  >
                    <CircleAlert color={"#ff3131"} size={12} />
                    <Text style={styles.warnText}>{passwordError}</Text>
                  </View>
                ) : null}
              </View>

              {/* Forget Password */}
              <Pressable onPress={() => router.push("/subPage/ForgetPassword")}>
                {({ pressed }) => (
                  <Text
                    style={{
                      color: pressed ? "#e69303" : "#FFA000",
                      fontSize: 16,
                      fontWeight: "600",
                      textDecorationLine: "underline",
                    }}
                  >
                    忘記密碼?
                  </Text>
                )}
              </Pressable>
            </View>
            <Pressable
              onPress={handleLogIn}
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
                  登入
                </Text>
              )}
            </Pressable>
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
              <Pressable
                onPress={() => {
                  setUser(null);
                  setGuest(true);
                  router.push("/subPage/Home");
                }}
              >
                {({ pressed }) => (
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <Text
                      style={{
                        color: !pressed ? "#bababa" : "#FFA000",
                        fontSize: 16,
                        fontWeight: "600",
                        textDecorationLine: "underline",
                      }}
                    >
                      訪客登入
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
