import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useRef, useEffect, useState, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  ErrorTip,
  Calendar,
  Square,
  SquareCheck,
  CircleAlert,
} from "lucide-react-native";
import LottieView from "lottie-react-native";
import { useAppStyles } from "../../utils/useAppStyles";
import { useUser } from "../../utils/userContext";
import Footer from "../../components/Footer";
import ReserveTimeBtn from "../../components/ReserveTimeBtn";
import { subscribeUserData } from "../../utils/authService";

export default function Reservation() {
  const { styles, isLight } = useAppStyles();
  const { user, setUser } = useUser();
  const { title, people, price, hour } = useLocalSearchParams();

  const scrollRef = useRef(null);

  useEffect(() => {
    const unsubscribe = subscribeUserData((updatedData) => {
      setUser(updatedData);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // 動畫
  const animationRef = useRef(null);
  const loadingAnimation = require("../../assets/animation/Loading.json");

  // 狀態
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeSelect, setTimeSelect] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectHost, setSelectHost] = useState(true);

  // 輸入
  const [formData, setFormData] = useState({
    selectHost: selectHost,
    hostName: "",
    otherRequire: "",
    agreeTerms: false,
    address: "臺北市中山區長安東路一段24-2號3樓",
  });

  // 取得最長遊玩時長
  const durationNum = useMemo(() => {
    const match = hour?.match(/(?<=-)\d+/) || hour?.match(/\d+/);
    return match ? parseFloat(match[0]) : 4;
  }, [hour]);

  const formatDate = (d) => {
    return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getDate().toString().padStart(2, "0")}`;
  };

  // 日期選擇限制
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 2);
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === "ios");
    setDate(currentDate);
  };

  // 衝堂計算
  useEffect(() => {
    if (!user || !title) return;

    setIsLoading(true);
    const dateStr = formatDate(date);

    const q = query(
      collection(db, "bookings"),
      where("date", "==", dateStr),
      where("title", "==", title),
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const occupiedTimes = querySnapshot.docs.map((doc) => doc.data().time);
        const slots = [];
        let current = 9.0;
        const closing = 22.0;

        while (current + durationNum <= closing) {
          const h = Math.floor(current);
          const m = (current % 1) * 60;
          const timeLabel = `${h}:${m === 0 ? "00" : m}`;
          const startV = current;
          const endV = current + durationNum;

          const isBooked = occupiedTimes.includes(timeLabel);

          const isConflict = user.appointments?.some((app) => {
            if (app.date !== dateStr) return false;
            return startV < app.endTimeValue && app.startTimeValue < endV;
          });

          slots.push({
            time: timeLabel,
            startTimeValue: startV,
            endTimeValue: endV,
            disabled: isBooked || isConflict,
          });
          current += durationNum + 0.5;
        }

        setAvailableSlots(slots);
        setIsLoading(false);
        setTimeSelect("");
      },
      (error) => {
        console.error("監聽預約失敗:", error);
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, [date, title, user, durationNum]);

  [date, title, user];

  // 錯誤訊息
  const validate = () => {
    let newErrors = {};

    if (selectHost && formData.hostName == "")
      newErrors.hostName = "請輸入主持人";
    if (!formData.agreeTerms) newErrors.terms = "請勾選同意條款";
    if (!timeSelect) newErrors.timeSelect = "請選擇預約時段";
    if (!date) newErrors.date = "請選擇預約日期";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
    return Object.keys(newErrors).length === 0;
  };

  const ErrorTip = ({ msg }) =>
    msg ? (
      <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
        <CircleAlert color="#ff3131" size={12} />
        <Text style={styles.warnText}>{msg}</Text>
      </View>
    ) : null;

  // 處理預約
  const handleNextStep = () => {
    if (validate()) {
      router.push({
        pathname: "/subPage/CheckReservation",
        params: {
          data: JSON.stringify({
            ...formData,
            date: formatDate(date),
            time: timeSelect,
            title: title,
            people: people,
            originPrice: Number(price),
            totalPrice: formData.selectHost
              ? Number(price) * people + 200
              : Number(price) * people,
            duration: durationNum,
          }),
        },
      });
    }
  };

  return (
    <>
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
            <Text style={styles.title}>預約劇本</Text>
            {/* Form */}
            <View
              style={{
                width: "100%",
                paddingHorizontal: 32,
                gap: 24,
              }}
            >
              {/* Title */}
              <View style={{ gap: 8 }}>
                <Text style={styles.content1}>劇本名稱</Text>
                <View style={[styles.inputFrame]}>
                  <Text style={styles.content3}>{title}</Text>
                </View>
              </View>
              {/* People */}
              <View style={{ gap: 8 }}>
                <Text style={styles.content1}>人數</Text>
                <View style={[styles.inputFrame]}>
                  <Text style={styles.content3}>{people}</Text>
                </View>
              </View>
              {/* Address */}
              <View style={{ gap: 8 }}>
                <Text style={styles.content1}>地點</Text>
                <View style={[styles.inputFrame]}>
                  <Text style={styles.content3}>
                    臺北市中山區長安東路一段24-2號3樓
                  </Text>
                </View>
              </View>
              {/* Date Choice */}
              <View style={{ gap: 8 }}>
                <Text style={styles.content1}>預約日期</Text>
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
                    {formatDate(date) || "YYYY/MM/DD"}
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
                      minimumDate={new Date()}
                      maximumDate={maxDate}
                      onChange={onDateChange}
                      textColor={isLight ? "#000" : "#fff"}
                    />
                  </View>
                )}
                <ErrorTip msg={errors.date} />
              </View>
              {/* 時段選擇 */}
              <View style={{ gap: 8 }}>
                <Text style={styles.content1}>
                  可預約時段 (預計時長: {hour})
                </Text>
                {isLoading ? (
                  <ActivityIndicator
                    color="#FFA000"
                    style={{ marginVertical: 20 }}
                    size="large"
                  />
                ) : (
                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}
                  >
                    {availableSlots.map((slot) => (
                      <ReserveTimeBtn
                        key={slot.time}
                        name={slot.time}
                        disabled={slot.disabled}
                        onPress={() => setTimeSelect(slot.time)}
                        selected={timeSelect === slot.time}
                      />
                    ))}
                  </View>
                )}
                <ErrorTip msg={errors.timeSelect} />
              </View>
              {/* Host */}
              <View style={{ gap: 8 }}>
                <Text style={styles.content1}>指定主持人</Text>
                <View style={{ flexDirection: "row", gap: 48 }}>
                  <Pressable
                    style={styles.radioRow}
                    onPress={() => setSelectHost(true)}
                  >
                    <View style={styles.radioCircle}>
                      {selectHost === true && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                    <Text style={styles.content1}>指定</Text>
                  </Pressable>
                  <Pressable
                    style={styles.radioRow}
                    onPress={() => setSelectHost(false)}
                  >
                    <View style={styles.radioCircle}>
                      {selectHost === false && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                    <Text style={styles.content1}>不指定</Text>
                  </Pressable>
                </View>
                <View
                  style={[
                    styles.inputFrame,
                    {
                      marginTop: 16,
                      display: selectHost ? "flex" : "none",
                    },
                  ]}
                >
                  <TextInput
                    style={[styles.textInput]}
                    placeholder="主持人名稱"
                    placeholderTextColor={
                      isLight
                        ? "rgba(0, 0, 0, 0.4)"
                        : "rgba(255, 255, 255, 0.4)"
                    }
                    value={formData.hostName}
                    onChangeText={(t) => {
                      setFormData({ ...formData, hostName: t });
                    }}
                  />
                </View>
                <ErrorTip msg={errors.hostName} />
                <Text
                  style={[
                    styles.content2,
                    { display: selectHost ? "flex" : "none" },
                  ]}
                >
                  *指定費用為總金額加 NT$200
                </Text>
              </View>
              <View style={{ gap: 8 }}>
                <Text style={styles.content1}>其他需求</Text>

                <View style={styles.multiLineFrame}>
                  <TextInput
                    editable
                    multiline
                    scrollEnabled={false}
                    style={{
                      fontSize: 16,
                      paddingVertical: 8,
                      color: isLight ? "#000" : "#fff",
                      paddingHorizontal: 8,
                      paddingVertical: 16,
                      lineHeight: 24,
                      minHeight: 160,
                      width: "100%",
                    }}
                    placeholder="請輸入內容..."
                    placeholderTextColor={
                      isLight ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)"
                    }
                    value={formData.otherRequire}
                    onChangeText={(t) =>
                      setFormData({ ...formData, otherRequire: t })
                    }
                  />
                </View>
              </View>
              {/* Policy */}
              <Pressable
                onPress={() => {
                  Keyboard.dismiss();
                  setFormData({
                    ...formData,
                    agreeTerms: !formData.agreeTerms,
                  });
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

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  gap: 48,
                }}
              >
                <Pressable
                  onPress={() => router.back()}
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
                    取消
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleNextStep}
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
                      下一步
                    </Text>
                  )}
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
