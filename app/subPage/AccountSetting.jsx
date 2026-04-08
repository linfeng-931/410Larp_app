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
import { checkSignUp, checkPersonalDetailUpdate, changeUserPassword, checkContactUpdate } from "../../utils/authService";
import { getPassword } from "../../utils/secureStorage";
import { Stack, router } from "expo-router";
import { useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
    Mail,
    CircleAlert,
    Camera,
    User,
    Pen,
    Phone,
    Calendar,
    EyeClosed,
    Eye,
} from "lucide-react-native";
import { useUser } from "../../utils/userContext";
import LottieView from "lottie-react-native";
import { useAppStyles } from "../../utils/useAppStyles";

import Header from "../../components/Header";

export default function AccountSetting() {
    const { styles, isLight } = useAppStyles();
    const scrollRef = useRef(null);
    const animationRef = useRef(null);
    const loadingAnimation = require("../../assets/animation/Loading.json");
    const { user, setUser, isGuest } = useUser();

    //   表單輸入
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [date, setDate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [passWord, showPassWord] = useState(false);
    const [confirmPassword, showconfirmPassword] = useState(false);
    const [confirmCurrentPassword, showconfirmCurrentPassword] = useState(false);
    const [formData, setFormData] = useState({
        uid: user.uid,
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        birthday: user.birthday,
        email: user.email,
        password: getPassword("user_pwd"),
        confirmPassword: "",
        confirmCurrentPassword: "",
        phone: user.phone,
        agreeTerms: false,
        profilePhoto: user.photoURL,
    });

    // 圖片
    const handleSelectPhoto = async () => {
        const base64String = await pickImage();

        if (base64String) {
            if (base64String.length > 300000) {
                Alert.alert("檔案太大請選擇其他照片");
                return;
            }

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
    const contactValidate = () => {
        let newErrors = {};
        const phoneRegex = /^09\d{8}$/;

        if (!formData.phone) newErrors.phone = "請輸入手機號碼";
        else if (!phoneRegex.test(formData.phone)) newErrors.phone = "手機格式錯誤";

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            scrollRef.current?.scrollTo({ y: 0, animated: true });
        }
        return Object.keys(newErrors).length === 0;
    };

    const personalValidate = () => {
        let newErrors = {};

        if (!formData.displayName) newErrors.displayName = "請輸入ID名稱";
        if (!formData.firstName || !formData.lastName)
            newErrors.name = "請輸入姓名";

        if (!formData.birthday) newErrors.birthday = "請選擇生日";

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            scrollRef.current?.scrollTo({ y: 0, animated: true });
        }
        return Object.keys(newErrors).length === 0;
    };

    const PasswordsValidate = () => {
        let newErrors = {};
        const passRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!formData.password) newErrors.password = "請輸入密碼";
        else if (!passRegex.test(formData.password))
            newErrors.password = "密碼格式不符";
        if (formData.password !== formData.confirmPassword)
            newErrors.confirmPassword = "新密碼不一致";
        if (formData.confirmCurrentPassword !== user.password)
            newErrors.confirmCurrentPassword = "目前密碼錯誤";

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            scrollRef.current?.scrollTo({ y: 0, animated: true });
        }
        return Object.keys(newErrors).length === 0;
    };

    //   資料上傳
    const handleContact = async () => {
        if (contactValidate()) {
            setLoading(true);
            try {
                await checkContactUpdate(formData.phone);
                setFormData((prev) => ({ ...prev, phone: formData.phone }));
                Alert.alert("聯絡資訊更改成功！");
            } catch (error) {
                console.log(error.code);
                Alert.alert("聯絡資訊更改失敗！", error.message);
            } finally {
                setLoading(false);
            }
        }
    };

    const handlePersonalDetail = async () => {
        if (personalValidate()) {
            setLoading(true);
            try {
                await checkPersonalDetailUpdate(formData);

                if (setUser) {
                    setUser((prevUser) => ({
                        ...prevUser,
                        displayName: formData.displayName,
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        gender: formData.gender,
                        birthday: formData.birthday,
                        photoURL: formData.profilePhoto || "",
                    }));
                }

                Alert.alert("更改成功");
            } catch (error) {
                console.log(error.code);
                Alert.alert("資料更改失敗", error.message);
            } finally {
                setLoading(false);
            }
        }
    };

    const handlePasswords = async () => {
        if (PasswordsValidate()) {
            setLoading(true);
            try {
                await changeUserPassword(formData.password);

                Alert.alert("密碼更改成功！");
                setFormData((prev) => ({ 
                    ...prev, 
                    password: getPassword("user_pwd"),
                    confirmPassword: "",
                    confirmCurrentPassword: "",
                 }));
                 showPassWord(false);
                 showconfirmPassword(false);
                 showconfirmCurrentPassword(false);

            } catch (error) {
                Alert.alert("密碼更改失敗！", error.message);
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

    return (
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />
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
                    <Header styles={styles} font={"會員資料"} />

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
                                {formData.profilePhoto ? (
                                    <Image source={{ uri: formData.profilePhoto }} style={styles.avatar} />
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
                                <Text style={styles.content2}>名稱</Text>
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
                                    <View style={[styles.inputGroup, { flex: 1, gap: 8 }]}>
                                        <Text style={styles.content2}>姓</Text>
                                        <TextInput
                                            style={styles.inputFrame}
                                            placeholder="您的姓氏"
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
                                    <View style={[styles.inputGroup, { flex: 2, gap: 8 }]}>
                                        <Text style={styles.content2}>名</Text>
                                        <TextInput
                                            style={styles.inputFrame}
                                            placeholder="您的名字"
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
                                </View>
                                <ErrorTip msg={errors.name} />
                                <Text style={styles.content3}>
                                    請填寫真實姓名，需與遊戲外送時核對身份
                                </Text>
                            </View>
                            {/* Gender */}
                            <View style={{ gap: 12, marginTop: 8 }}>
                                <Text style={styles.content2}>性別</Text>
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
                                <Text style={styles.content2}>生日</Text>
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
                                            onChange={onDateChange}
                                            textColor={isLight ? "#000" : "#fff"}
                                        />
                                    </View>
                                )}
                                <ErrorTip msg={errors.birthday} />
                            </View>
                        </View>
                        {/* btn */}
                        <Pressable
                            onPress={handlePersonalDetail}
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
                                    變更使用者資料
                                </Text>
                            )}
                        </Pressable>

                        <View style={{ width: "100%", height: 1, backgroundColor: isLight ? "#000" : "#fff", opacity: 0.4 }} />

                        {/* Account */}
                        <View style={{ gap: 16 }}>
                            <Text style={[styles.content1, { fontWeight: 600 }]}>帳號</Text>
                            <View style={[styles.inputFrame, { opacity: 0.5 }]}>
                                <Mail color={isLight ? "#000" : "#fff"} size={20} />
                                <Text style={styles.content1}>{user.email}</Text>
                            </View>
                        </View>

                        <View style={{ width: "100%", height: 1, backgroundColor: isLight ? "#000" : "#fff", opacity: 0.4 }} />

                        {/* PassWords */}
                        <View style={{ gap: 16 }}>
                            <Text style={[styles.content1, { fontWeight: 600 }]}>變更密碼</Text>
                            <Text style={styles.content2}>目前密碼</Text>
                            <View style={styles.inputFrame}>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="目前密碼"
                                    placeholderTextColor={
                                        isLight ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.4)"
                                    }
                                    secureTextEntry={!confirmCurrentPassword}
                                    value={formData.confirmCurrentPassword}
                                    onChangeText={(t) => {
                                        const newFormData = { ...formData, confirmCurrentPassword: t };
                                        setFormData(newFormData);

                                        if (
                                            errors.confirmCurrentPassword &&
                                            t === formData.password
                                        ) {
                                            setErrors((prev) => {
                                                const { confirmCurrentPassword, ...rest } = prev;
                                                return rest;
                                            });
                                        }
                                    }}
                                />
                                <Pressable
                                    onPress={() => showconfirmCurrentPassword(!confirmCurrentPassword)}
                                >
                                    {confirmCurrentPassword ? (
                                        <Eye color={isLight ? "#000" : "#fff"} size={20} />
                                    ) : (
                                        <EyeClosed color={isLight ? "#000" : "#fff"} size={20} />
                                    )}
                                </Pressable>
                            </View>
                            <ErrorTip msg={errors.confirmCurrentPassword} />

                            <Text style={styles.content2}>新密碼</Text>
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
                            <Text style={styles.content2}>確認新密碼</Text>
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
                        {/* btn */}
                        <Pressable
                            onPress={handlePasswords}
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
                                    變更密碼
                                </Text>
                            )}
                        </Pressable>

                        {/* Contact */}
                        <View style={{ width: "100%", height: 1, backgroundColor: isLight ? "#000" : "#fff", opacity: 0.4 }} />

                        <View style={{ gap: 16 }}>
                            <Text style={[styles.content1, { fontWeight: 600 }]}>
                                聯絡資料
                            </Text>
                            {/* UserName(Unreal) */}
                            <View style={{ gap: 8 }}>
                                <Text style={styles.content2}>手機</Text>
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

                        <Pressable
                            onPress={handleContact}
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
                                    更改聯絡資訊
                                </Text>
                            )}
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
