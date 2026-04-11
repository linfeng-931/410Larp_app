import {
  View,
  useColorScheme,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
  Image,
  KeyboardAvoidingView,
  Alert,
  Keyboard,
} from "react-native";
import { getStyles } from "../../utils/styleFormat";
import { useFonts } from "expo-font";
import { pickImage } from "../../utils/photoHandler";
import { checkSignUp } from "../../utils/authService";
import { Stack, router } from "expo-router";
import { useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Mail,
  Lock,
  CircleAlert,
  Camera,
  User,
  Pen,
  SquareCheck,
  Square,
  Phone,
  Calendar,
  Ellipsis,
  EyeClosed,
  Eye,
} from "lucide-react-native";
import LottieView from "lottie-react-native";
import { useAppStyles } from "../../utils/useAppStyles";
import { useUser } from "../../utils/userContext";

export default function SignUp() {
  const { styles, isLight } = useAppStyles();
  const scrollRef = useRef(null);
  const animationRef = useRef(null);
  const loadingAnimation = require("../../assets/animation/Loading.json");
  const { setGuest } = useUser();

  //   表單輸入
  const [photo, setPhoto] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [passWord, showPassWord] = useState(false);
  const [confirmPassword, showconfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    uid: "",
    displayName: "",
    firstName: "",
    lastName: "",
    gender: "male",
    birthday: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    agreeTerms: false,
    profilePhoto: "",
  });

  // 圖片
  const handleSelectPhoto = async () => {
    const base64String = await pickImage();

    if (base64String) {
      if (base64String.length > 300000) {
        Alert.alert("檔案太大請選擇其他照片");
        return;
      }

      setPhoto(base64String);
      setFormData((prev) => ({ ...prev, profilePhoto: base64String }));

      setErrors((prev) => {
        const { profilePhoto, ...rest } = prev;
        return rest;
      });
    }
  };

  // 日期
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === "ios");
    setDate(currentDate);

    const formattedDate = `${currentDate.getFullYear()}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getDate().toString().padStart(2, "0")}`;
    setFormData({ ...formData, birthday: formattedDate });

    if (errors.birthday) {
      setErrors((prev) => {
        const { birthday, ...rest } = prev;
        return rest;
      });
    }
  };

  //   錯誤驗證
  const [errors, setErrors] = useState({});
  const validate = () => {
    let newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const phoneRegex = /^09\d{8}$/;

    if (!formData.displayName) newErrors.displayName = "請輸入ID名稱";
    if (!formData.firstName || !formData.lastName)
      newErrors.name = "請輸入姓名";

    if (!formData.birthday) newErrors.birthday = "請選擇生日";

    if (!formData.email) newErrors.email = "請輸入電子郵件";
    else if (!emailRegex.test(formData.email))
      newErrors.email = "電子郵件格式錯誤";

    if (!formData.password) newErrors.password = "請輸入密碼";
    else if (!passRegex.test(formData.password))
      newErrors.password = "密碼格式不符";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "密碼不一致";

    if (!formData.phone) newErrors.phone = "請輸入手機號碼";
    else if (!phoneRegex.test(formData.phone)) newErrors.phone = "手機格式錯誤";

    if (!formData.agreeTerms) newErrors.terms = "請勾選同意條款";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
    return Object.keys(newErrors).length === 0;
  };

  //   資料上傳
  const handleSignUp = async () => {
    if (validate()) {
      setLoading(true);
      try {
        await checkSignUp(formData.email, formData.password, formData);
        setGuest(false);
        Alert.alert("註冊成功", "歡迎來到推理之旅！", [
          { text: "確定", onPress: () => router.push("/subPage/Home") },
        ]);
      } catch (error) {
        console.log(error.code);
        if (error.code === "auth/email-already-in-use") {
          Alert.alert("註冊失敗", "該電子郵件已被使用。");
        } else {
          Alert.alert("註冊失敗", error.message);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  // 錯誤訊息
  const ErrorTip = ({ msg }) =>
    msg ? (
      <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
        <CircleAlert color="#ff3131" size={12} />
        <Text style={styles.warnText}>{msg}</Text>
      </View>
    ) : null;

  /* 文字載入 */
  let [fontsLoaded] = useFonts({
    Nobills: require("../../assets/fonts/PostNoBills.ttf"),
    ChFont: require("../../assets/fonts/ChFont.ttf"),
  });
  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <Stack.Screen />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.container, { gap: 32 }]}
          showsVerticalScrollIndicator={false}
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
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
            <Text style={styles.logInTitle}>Create Account</Text>
            <Pressable onPress={() => router.push("/subPage/LogIn")}>
              {({ pressed }) => (
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Text style={styles.content1}>已有帳號?</Text>
                  <Text
                    style={{
                      color: pressed ? "#e69303" : "#FFA000",
                      fontSize: 16,
                      fontWeight: "600",
                      textDecorationLine: "underline",
                    }}
                  >
                    點此登入
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
          {/* Form Area */}
          <View style={{ width: "100%", paddingHorizontal: 32, gap: 32 }}>
            {/* Profile */}
            <View style={{ gap: 16 }}>
              <Text style={[styles.content1, { fontWeight: 600 }]}>
                個人資料
              </Text>
              <Pressable
                style={styles.avatarContainer}
                onPress={handleSelectPhoto}
              >
                {photo ? (
                  <Image source={{ uri: photo }} style={styles.avatar} />
                ) : (
                  <View style={styles.emptyAvatar}>
                    <User
                      color={isLight ? "#000" : "#fff"}
                      opacity={0.8}
                      size={36}
                    />
                  </View>
                )}
                <View style={styles.cameraBtn}>
                  <Camera color="#fff" size={16} />
                </View>
              </Pressable>
              {/* UserName(Unreal) */}
              <View style={{ gap: 8 }}>
                <Text style={styles.content1}>名稱</Text>
                <View style={[styles.inputFrame]}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="輸入ID名稱"
                    placeholderTextColor={
                      isLight
                        ? "rgba(0, 0, 0, 0.4)"
                        : "rgba(255, 255, 255, 0.4)"
                    }
                    value={formData.displayName}
                    onChangeText={(t) => {
                      setFormData({ ...formData, displayName: t });
                      if (errors.displayName) {
                        setErrors((prev) => {
                          const { displayName, ...rest } = prev;
                          return rest;
                        });
                      }
                    }}
                  />
                  <Pen color={isLight ? "#000" : "#fff"} />
                </View>
                <Text style={styles.content3}>用於群組的ID名稱</Text>
                <ErrorTip msg={errors.displayName} />
              </View>
              {/* UserName(Real) */}
              <View style={{ gap: 12 }}>
                <View
                  style={{
                    flexDirection: "row",
                    width: "100%",
                    maxWidth: 338,
                    gap: 16,
                  }}
                >
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.content1}>姓</Text>
                    <TextInput
                      style={styles.inputFrame}
                      placeholder="您的姓氏"
                      placeholderTextColor={
                        isLight
                          ? "rgba(0, 0, 0, 0.4)"
                          : "rgba(255, 255, 255, 0.4)"
                      }
                      value={formData.firstName}
                      onChangeText={(t) => {
                        setFormData({ ...formData, firstName: t });
                        if (errors.name) {
                          setErrors((prev) => {
                            const { name, ...rest } = prev;
                            return rest;
                          });
                        }
                      }}
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 2 }]}>
                    <Text style={styles.content1}>名</Text>
                    <TextInput
                      style={styles.inputFrame}
                      placeholder="您的名字"
                      placeholderTextColor={
                        isLight
                          ? "rgba(0, 0, 0, 0.4)"
                          : "rgba(255, 255, 255, 0.4)"
                      }
                      value={formData.lastName}
                      onChangeText={(t) => {
                        setFormData({ ...formData, lastName: t });
                        if (errors.name) {
                          setErrors((prev) => {
                            const { name, ...rest } = prev;
                            return rest;
                          });
                        }
                      }}
                    />
                  </View>
                </View>
                <ErrorTip msg={errors.name} />
                <Text style={styles.content3}>
                  請填寫真實姓名，需與遊戲外送時核對身份
                </Text>
              </View>
              {/* Gender */}
              <View style={{ gap: 12, marginTop: 8 }}>
                <Text style={styles.content1}>性別</Text>
                <View style={{ flexDirection: "row", gap: 48 }}>
                  <Pressable
                    style={styles.radioRow}
                    onPress={() => setFormData({ ...formData, gender: "male" })}
                  >
                    <View style={styles.radioCircle}>
                      {formData.gender === "male" && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                    <Text style={styles.content1}>先生</Text>
                  </Pressable>
                  <Pressable
                    style={styles.radioRow}
                    onPress={() =>
                      setFormData({ ...formData, gender: "female" })
                    }
                  >
                    <View style={styles.radioCircle}>
                      {formData.gender === "female" && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                    <Text style={styles.content1}>女士</Text>
                  </Pressable>
                </View>
              </View>
              {/* Birthday */}
              <View style={{ gap: 8 }}>
                <Text style={styles.content1}>生日</Text>
                <Pressable
                  style={styles.inputFrame}
                  onPress={() => {
                    Keyboard.dismiss();
                    setShowDatePicker(true);
                  }}
                >
                  <Text
                    style={[
                      {
                        flex: 1,
                      },
                      styles.content1,
                    ]}
                  >
                    {formData.birthday || "YYYY/MM/DD"}
                  </Text>
                  <Calendar color={isLight ? "#000" : "#fff"} size={20} />
                </Pressable>
                {showDatePicker && (
                  <View
                    style={
                      Platform.OS === "ios" ? styles.iosPickerContainer : null
                    }
                  >
                    {Platform.OS === "ios" && (
                      <View style={styles.toolbar}>
                        <Pressable onPress={() => setShowDatePicker(false)}>
                          <Text
                            style={{
                              color: "#FFA000",
                              fontWeight: "bold",
                              fontSize: 16,
                            }}
                          >
                            完成
                          </Text>
                        </Pressable>
                      </View>
                    )}
                    <DateTimePicker
                      value={date}
                      mode="date"
                      display="spinner"
                      maximumDate={new Date()}
                      onChange={onDateChange}
                      textColor={isLight ? "#000" : "#fff"}
                    />
                  </View>
                )}
                <ErrorTip msg={errors.birthday} />
              </View>
            </View>
            {/* Account */}
            <View style={{ gap: 16 }}>
              <Text style={styles.content1}>帳號</Text>
              <View style={styles.inputFrame}>
                <Mail color={isLight ? "#000" : "#fff"} size={20} />
                <TextInput
                  style={styles.textInput}
                  placeholder="example@email.com"
                  placeholderTextColor={
                    isLight ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.4)"
                  }
                  value={formData.email}
                  onChangeText={(t) => {
                    setFormData({ ...formData, email: t });
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (errors.email && emailRegex.test(t)) {
                      setErrors((prev) => {
                        const { email, ...rest } = prev;
                        return rest;
                      });
                    }
                  }}
                />
              </View>
              <ErrorTip msg={errors.email} />

              <View style={styles.inputFrame}>
                <TextInput
                  style={styles.textInput}
                  placeholder="輸入密碼"
                  placeholderTextColor={
                    isLight ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.4)"
                  }
                  secureTextEntry={!passWord}
                  value={formData.password}
                  onChangeText={(t) => {
                    setFormData({ ...formData, password: t });
                    const passRegex =
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
                    if (errors.password && passRegex.test(t)) {
                      setErrors((prev) => {
                        const { password, ...rest } = prev;
                        return rest;
                      });
                    }
                  }}
                />
                <Pressable onPress={() => showPassWord(!passWord)}>
                  {passWord ? (
                    <Eye color={isLight ? "#000" : "#fff"} size={20} />
                  ) : (
                    <EyeClosed color={isLight ? "#000" : "#fff"} size={20} />
                  )}
                </Pressable>
              </View>
              <ErrorTip msg={errors.password} />
              <Text style={styles.content3}>
                請設定 8 位以上密碼，需包含大小寫字母、數字及特殊符號
              </Text>
              <Text style={styles.content1}>確認密碼</Text>
              <View style={styles.inputFrame}>
                <TextInput
                  style={styles.textInput}
                  placeholder="輸入密碼"
                  placeholderTextColor={
                    isLight ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.4)"
                  }
                  secureTextEntry={!confirmPassword}
                  value={formData.confirmPassword}
                  onChangeText={(t) => {
                    const newFormData = { ...formData, confirmPassword: t };
                    setFormData(newFormData);

                    const passRegex =
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

                    if (
                      errors.confirmPassword &&
                      passRegex.test(t) &&
                      t === formData.password
                    ) {
                      setErrors((prev) => {
                        const { confirmPassword, ...rest } = prev;
                        return rest;
                      });
                    }
                  }}
                />
                <Pressable
                  onPress={() => showconfirmPassword(!confirmPassword)}
                >
                  {confirmPassword ? (
                    <Eye color={isLight ? "#000" : "#fff"} size={20} />
                  ) : (
                    <EyeClosed color={isLight ? "#000" : "#fff"} size={20} />
                  )}
                </Pressable>
              </View>
              <ErrorTip msg={errors.confirmPassword} />
            </View>
            {/* Contact */}
            <View style={{ gap: 16 }}>
              <Text style={[styles.content1, { fontWeight: 600 }]}>
                聯絡資料
              </Text>
              {/* UserName(Unreal) */}
              <View style={{ gap: 8 }}>
                <Text style={styles.content1}>手機</Text>
                <View style={[styles.inputFrame]}>
                  <Phone color={isLight ? "#000" : "#fff"} />
                  <TextInput
                    style={styles.textInput}
                    keyboardType="number-pad"
                    placeholder="09xx-xxx-xxx"
                    placeholderTextColor={
                      isLight
                        ? "rgba(0, 0, 0, 0.4)"
                        : "rgba(255, 255, 255, 0.4)"
                    }
                    value={formData.phone}
                    maxLength={10}
                    onChangeText={(t) => {
                      setFormData({ ...formData, phone: t });
                      const phoneRegex = /^09\d{8}$/;
                      if (errors.phone && phoneRegex.test(t)) {
                        setErrors((prev) => {
                          const { phone, ...rest } = prev;
                          return rest;
                        });
                      }
                    }}
                  />
                </View>
                <ErrorTip msg={errors.phone} />
              </View>
            </View>
            {/* Check Policy */}
            <Pressable
              onPress={() => {
                Keyboard.dismiss();
                setFormData({ ...formData, agreeTerms: !formData.agreeTerms });
              }}
              style={{ flexDirection: "row", gap: 16, alignItems: "center" }}
            >
              {formData.agreeTerms ? (
                <SquareCheck fill="#FFA000" size={24} />
              ) : (
                <Square color="#666" size={24} />
              )}
              <Text
                style={[styles.content1, { flexWrap: "wrap", width: "100%" }]}
              >
                我已閱讀並同意天空中娛樂股份有限公司的{" "}
                <Pressable>
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
                        使用條款與申明
                      </Text>
                    </View>
                  )}
                </Pressable>
              </Text>
            </Pressable>
            <ErrorTip msg={errors.terms} />
            {/* Sign Up */}
            <Pressable
              onPress={handleSignUp}
              disabled={loading}
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
                  註冊
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
