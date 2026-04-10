import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useRef, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ErrorTip, Calendar, Square } from "lucide-react-native";
import LottieView from "lottie-react-native";
import { useAppStyles } from "../../utils/useAppStyles";
import { useUser } from "../../utils/userContext";
import { checkCreateReservation } from "../../utils/authService";
import Footer from "../../components/Footer";
import SelectFunc from "../../components/SelectFun";

export default function Reservation() {
  const { styles, isLight, colorScheme } = useAppStyles();
  const { title, people, price } = useLocalSearchParams();
  const scrollRef = useRef(null);
  const animationRef = useRef(null);
  const loadingAnimation = require("../../assets/animation/Loading.json");

  // 表單輸入
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeSelect, setTimeSelect] = useState("");

  /* 下拉選單資料 */
  const optionsTime = [
    { value: "早上", label: "早上" },
    { value: "下午", label: "下午" },
    { value: "晚上", label: "晚上" },
  ];

  // 日期
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 2);
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === "ios");
    setDate(currentDate);

    const formattedDate = `${currentDate.getFullYear()}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getDate().toString().padStart(2, "0")}`;
  };

  const formatDate = (date) => {
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`;
  };

  // 預約時段確認
  const [disabledTimes, setDisabledTimes] = useState([]);
  useEffect(() => {
    const fetchOccupiedSlots = async () => {
      const dateStr = formatDate(date);
      const q = query(
        collection(db, "bookings"),
        where("date", "==", dateStr),
        where("title", "==", title),
      );

      const querySnapshot = await getDocs(q);
      const occupied = querySnapshot.docs.map((doc) => doc.data().time);
      setDisabledTimes(occupied);
    };

    fetchOccupiedSlots();
  }, [date]);
  const filteredOptions = optionsTime.map((opt) => ({
    ...opt,
    disabled: disabledTimes.includes(opt.value),
  }));

  const handleNextStep = async () => {
    if (!timeSelect) {
      Alert.alert("提示", "請選擇預約時段");
      return;
    }

    const isSelfConflict = user.appointments?.some(
      (app) => app.date === formatDate(date) && app.time === timeSelect,
    );
    if (isSelfConflict) {
      Alert.alert("衝堂", "您當天該時段已有其他預約");
      return;
    }

    try {
      await checkCreateReservation({
        userId: user.uid,
        userName: user.displayName,
        date: formatDate(date),
        time: timeSelect,
        title: title,
        price: price,
      });

      Alert.alert("成功", "預約已完成！", [
        { text: "好", onPress: () => router.replace("/(tabs)/History") },
      ]);
    } catch (error) {
      if (error.message === "occupied") {
        Alert.alert("預約失敗", "很抱歉，該時段剛被其他用戶預約了。");
      } else {
        Alert.alert("錯誤", "系統忙碌中，請稍後再試");
      }
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
              <View style={{ gap: 8 }}>
                <Text style={styles.content1}>劇本名稱</Text>
                <View style={[styles.inputFrame]}>
                  <Text style={styles.content3}>{title}</Text>
                </View>
              </View>
              <View style={{ gap: 8 }}>
                <Text style={styles.content1}>人數</Text>
                <View style={[styles.inputFrame]}>
                  <Text style={styles.content3}>{people}</Text>
                </View>
              </View>
              <View style={{ gap: 8 }}>
                <Text style={styles.content1}>地點</Text>
                <View style={[styles.inputFrame]}>
                  <Text style={styles.content3}>
                    臺北市中山區長安東路一段24-2號3樓
                  </Text>
                </View>
              </View>
              <View style={{ gap: 8 }}>
                <Text style={styles.content1}>日期</Text>
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
              </View>
              <View style={{ gap: 8 }}>
                <Text style={styles.content1}>時段</Text>
                <SelectFunc
                  colorScheme={colorScheme}
                  placeholder={""}
                  options={optionsTime}
                  value={timeSelect}
                  onValueChange={setTimeSelect}
                  onPress={() => {
                    Keyboard.dismiss();
                  }}
                />
              </View>
              <View style={{ gap: 8 }}>
                <Text style={styles.content1}>指定主持人</Text>
                <View style={{ flexDirection: "row", gap: 48 }}>
                  <Pressable style={styles.radioRow}>
                    <View style={styles.radioCircle}>
                      <View style={styles.radioInner} />
                    </View>
                    <Text style={styles.content1}>指定</Text>
                  </Pressable>
                  <Pressable style={styles.radioRow}>
                    <View style={styles.radioCircle}>
                      <View style={styles.radioInner} />
                    </View>
                    <Text style={styles.content1}>不指定</Text>
                  </Pressable>
                </View>
                <View style={[styles.inputFrame, { marginTop: 16 }]}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="主持人名稱"
                    placeholderTextColor={
                      isLight
                        ? "rgba(0, 0, 0, 0.4)"
                        : "rgba(255, 255, 255, 0.4)"
                    }
                    value={""}
                  />
                </View>
              </View>
              <View style={{ gap: 8 }}>
                <Text style={styles.content1}>其他需求</Text>
                <View style={[styles.inputFrame, { height: 160 }]}>
                  <TextInput
                    editable
                    multiline
                    style={[styles.textInput, { paddingVertical: 16 }]}
                    placeholder="請輸入內容..."
                    placeholderTextColor={
                      isLight
                        ? "rgba(0, 0, 0, 0.4)"
                        : "rgba(255, 255, 255, 0.4)"
                    }
                    value={""}
                  />
                </View>
              </View>
              <Pressable
                style={{ flexDirection: "row", gap: 16, alignItems: "center" }}
              >
                <Square color="#666" size={24} />
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

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  gap: 48,
                }}
              >
                <Pressable
                  style={({ pressed }) => ({
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 8,
                    flex: 1,
                    height: 48,
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
                  style={({ pressed }) => ({
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 8,
                    flex: 1,
                    height: 48,
                    borderRadius: 8,
                    backgroundColor: pressed ? "#e69303" : "#FFA000",
                  })}
                >
                  <Text
                    style={{ fontSize: 16, color: "#fff", fontWeight: 900 }}
                  >
                    下一步
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
