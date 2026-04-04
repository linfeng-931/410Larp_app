import {
  View,
  useColorScheme,
  ImageBackground,
  Text,
  TextInput,
  Pressable,
} from "react-native";
import { getStyles } from "../../utils/styleFormat";
import { useFonts } from "expo-font";
import Images from "../../assets/images/images";
import { Stack, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { Mail, Lock, CircleAlert } from "lucide-react-native";

export default function LogIn() {
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme);
  const isLight = colorScheme === "light";

  // 表單狀態
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
      setEmailError("郵箱格式不正確");
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

  const handleLogIn = () => {
    if (validate()) console.log("成功登入");
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
      <ImageBackground
        style={styles.logInContainer}
        source={Images[colorScheme].LogIn}
      >
        {/* Header */}
        <View style={{ alignItems: "center", gap: 8 }}>
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
                emailError ? { borderColor: "#ff3131", borderWidth: 1 } : null,
              ]}
            >
              <Mail color={isLight ? "#000" : "#fff"} />
              <TextInput
                onChangeText={(val) => {
                  setEmail(val);
                  setEmailError("");
                }}
                value={email}
                placeholder="example@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                style={{
                  fontSize: 16,
                  flex: 1,
                  height: "100%",
                  paddingVertical: 8,
                  color: isLight ? "#000" : "#fff",
                }}
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
                  setePasswordError("");
                }}
                value={password}
                placeholder="輸入密碼"
                secureTextEntry
                style={{
                  fontSize: 16,
                  flex: 1,
                  height: "100%",
                  paddingVertical: 8,
                  color: isLight ? "#000" : "#fff",
                }}
              />
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
          <Pressable>
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
          <Text style={{ fontSize: 16, color: "#fff", fontWeight: 900 }}>
            登入
          </Text>
        </Pressable>
        <Pressable onPress={() => router.push("/subPage/Home")}>
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
      </ImageBackground>
    </SafeAreaView>
  );
}
