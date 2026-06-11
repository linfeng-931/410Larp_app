import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  Alert,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useRef, useEffect, useState, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Square,
  SquareCheck,
  CircleAlert,
  UserRound,
} from "lucide-react-native";
import LottieView from "lottie-react-native";
import { useAppStyles } from "../../utils/useAppStyles";
import { useUser } from "../../utils/userContext";
import Footer from "../../components/Footer";
import { subscribeUserData, createGroupEvent } from "../../utils/authService"; // 確保引入 createGroupEvent
import { Calendar } from "react-native-calendars";
import SelectFunc from "../../components/SelectFun";
import { stories } from "../../utils/story";

export default function Organize() {
  const { styles, isLight, colorScheme } = useAppStyles();
  const { user, setUser } = useUser();
  const paramsData = useLocalSearchParams() || {};
  const { id } = paramsData;
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
  const [selectedStoryId, setSelectedStoryId] = useState(id || "");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectVerify, setSelectVerify] = useState(true);

  const [formData, setFormData] = useState({
    otherRequire: "",
    agreeTerms: false,
  });

  // 人數
  const [storyPeople, SetStoryPeople] = useState("");
  const selectedStory = useMemo(() => {
    return stories.find((s) => s.id === selectedStoryId) || null;
  }, [selectedStoryId]);

  const neededPeople = useMemo(() => {
    if (!selectedStory || !storyPeople) return 0;
    const maxPeople = Math.max(...selectedStory.people);
    return maxPeople - Number(storyPeople);
  }, [selectedStory, storyPeople]);

  const optionsPeople = useMemo(() => {
    if (!selectedStory) return [{ value: 0, label: "請先選擇劇本" }];

    const maxPeople = Math.max(...selectedStory.people);
    const dynamicOptions = [];
    for (let i = 1; i < maxPeople; i++) {
      dynamicOptions.push({ value: i, label: `${i}人` });
    }
    return dynamicOptions;
  }, [selectedStory]);

  // 劇本
  const storyOptions = useMemo(() => {
    return stories.map((s) => ({ value: s.id, label: s.title }));
  }, []);

  // 日期選擇限制
  const mainColor = "#FFA000";
  const today = new Date();
  const threeMonthsLater = new Date();
  threeMonthsLater.setMonth(today.getMonth() + 3);

  // 格式化成'YYYY-MM-DD'
  const formatDate = (date) => date.toISOString().split("T")[0];

  const minDateStr = formatDate(today);
  const maxDateStr = formatDate(threeMonthsLater);

  // arrow 判斷
  const [isRightArrowDisabled, setIsRightArrowDisabled] = useState(false);
  const [isLeftArrowDisabled, setIsLeftArrowDisabled] = useState(false);
  const handleMonthChange = (month) => {
    const currentYear = month.year;
    const currentMonth = month.month;

    const maxYear = threeMonthsLater.getFullYear();
    const maxMonth = threeMonthsLater.getMonth() + 1;
    const minYear = today.getFullYear();
    const minMonth = today.getMonth() + 1;

    if (
      currentYear > maxYear ||
      (currentYear === maxYear && currentMonth >= maxMonth)
    ) {
      setIsRightArrowDisabled(true);
    } else {
      setIsRightArrowDisabled(false);
    }

    if (
      currentYear < minYear ||
      (currentYear === minYear && currentMonth <= minMonth)
    ) {
      setIsLeftArrowDisabled(true);
    } else {
      setIsLeftArrowDisabled(false);
    }
  };

  // startDate and endDate
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [markedDates, setMarkedDates] = useState({});

  const getDatesInRange = (startStr, endStr) => {
    const dates = {};
    let start = new Date(startStr);
    const end = new Date(endStr);

    while (start <= end) {
      const dateString = formatDate(start);

      // style
      if (dateString === startStr) {
        dates[dateString] = {
          startingDay: true,
          color: mainColor,
          textColor: "white",
        };
      } else if (dateString === endStr) {
        dates[dateString] = {
          endingDay: true,
          color: mainColor,
          textColor: "white",
        };
      } else {
        dates[dateString] = { color: mainColor, textColor: "white" };
      }
      start.setDate(start.getDate() + 1);
    }
    return dates;
  };

  // 日期點擊
  const handleDayPress = (day) => {
    const dateString = day.dateString;

    // 尚未選取開始日期
    if (!startDate || (startDate && endDate)) {
      setStartDate(dateString);
      setEndDate(null);

      setMarkedDates({
        [dateString]: {
          startingDay: true,
          endingDay: true,
          color: mainColor,
          textColor: "white",
        },
      });
    }
    // 選取結束日期
    else if (startDate && !endDate) {
      if (new Date(dateString) < new Date(startDate)) {
        setStartDate(dateString);
        setMarkedDates({
          [dateString]: {
            startingDay: true,
            endingDay: true,
            color: mainColor,
            textColor: "white",
          },
        });
      } else {
        setEndDate(dateString);
        const rangeDates = getDatesInRange(startDate, dateString);
        setMarkedDates(rangeDates);
      }
    }
  };
  /*
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 2);
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === "ios");
    setDate(currentDate);
  };*/

  // 錯誤訊息驗證
  const validate = () => {
    let newErrors = {};

    if (!selectedStoryId) newErrors.story = "請選擇欲揪團的劇本";
    if (!storyPeople && storyPeople !== 0)
      newErrors.people = "請選擇當前已有的人數";
    if (!startDate || !endDate) newErrors.date = "請選擇完整的預計日期區間";
    if (!formData.agreeTerms) newErrors.terms = "請勾選同意使用條款與申明";

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

  // 處理發起揪團
  const handleOrganizeGroup = async () => {
    if (validate()) {
      if (!user) {
        Alert.alert("提示", "請先登入用戶後再發起揪團");
        return;
      }

      setLoading(true);
      try {
        const groupData = {
          userId: user.uid,
          hostPhotoURL: user.photoURL || "",
          storyId: selectedStoryId,
          title: selectedStory?.title || "",
          startDate: startDate,
          endDate: endDate,
          currentPeople: Number(storyPeople),
          neededPeople: neededPeople,
          selectVerify: selectVerify,
          otherRequire: formData.otherRequire,
        };

        await createGroupEvent(groupData);
        setLoading(false);
        router.dismissAll();
        router.replace("/subPage/OrganizeComplete");
      } catch (error) {
        setLoading(false);
        console.error("發起揪團失敗:", error);
        Alert.alert("錯誤", "系統忙碌中，發起揪團失敗，請稍後再試。");
      }
    }
  };

  return (
    <>
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <Stack.Screen options={{ headerShown: false }} />
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
            <Text style={styles.title}>發起揪團</Text>
            {/* Form */}
            <View
              style={{
                width: "100%",
                paddingHorizontal: 32,
                gap: 24,
              }}
            >
              {/* Detail */}
              <View style={{ gap: 8 }}>
                <Text style={styles.content1}>選擇劇本</Text>
                <SelectFunc
                  colorScheme={colorScheme}
                  placeholder={"請選擇要揪團的劇本"}
                  options={storyOptions}
                  value={selectedStoryId}
                  onValueChange={(val) => {
                    setSelectedStoryId(val);
                    SetStoryPeople("");
                  }}
                />
                <ErrorTip msg={errors.story} />
              </View>
              <ErrorTip msg={errors.stories} />

              {/* People */}
              <View style={{ gap: 8 }}>
                <Text style={styles.content1}>當前人數</Text>
                <SelectFunc
                  colorScheme={colorScheme}
                  placeholder={"已有多少人"}
                  options={optionsPeople}
                  value={storyPeople}
                  onValueChange={SetStoryPeople}
                  disabled={!selectedStoryId}
                />
                <ErrorTip msg={errors.people} />
              </View>
              {selectedStory && storyPeople !== "" && (
                <View
                  style={{
                    backgroundColor: "#FFF9F0",
                    padding: 16,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: mainColor,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: mainColor,
                    }}
                  >
                    需求人數：{neededPeople} 人
                  </Text>
                </View>
              )}

              {/* Date Choice */}
              <View style={{ gap: 8 }}>
                <Text style={styles.content1}>預計日期區間</Text>
                <Calendar
                  initialDate={minDateStr}
                  minDate={minDateStr}
                  maxDate={maxDateStr}
                  monthFormat={"yyyy 年 MM 月"}
                  onDayPress={handleDayPress}
                  onMonthChange={handleMonthChange}
                  hideArrows={false}
                  disableArrowLeft={isLeftArrowDisabled}
                  disableArrowRight={isRightArrowDisabled}
                  disableMonthChange={false}
                  hideExtraDays={true}
                  firstDay={1}
                  enableSwipeMonths={
                    !isLeftArrowDisabled && !isRightArrowDisabled
                  }
                  disableAllTouchEventsForDisabledDays={true}
                  markingType={"period"}
                  markedDates={markedDates}
                  theme={{
                    arrowColor: "#FFA000",
                    textMonthFontWeight: "bold",
                    backgroundColor: "transparent",
                    calendarBackground: "transparent",

                    monthTextColor: isLight ? "#000000" : "#FFFFFF",
                    textSectionTitleColor: isLight ? "#000000" : "#FFFFFF",
                    dayTextColor: isLight ? "#000000" : "#FFFFFF",
                    todayTextColor: isLight ? "#000000" : "#FFFFFF",
                    disabledArrowColor: isLight ? "#CCCCCC" : "#555555",
                    textDisabledColor: isLight ? "#CCCCCC" : "#666666",
                  }}
                />
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

              {/* Verify */}
              <View style={{ gap: 8 }}>
                <Text style={styles.content1}>審核狀態</Text>
                <View style={{ flexDirection: "row", gap: 48 }}>
                  <Pressable
                    style={styles.radioRow}
                    onPress={() => setSelectVerify(true)}
                  >
                    <View style={styles.radioCircle}>
                      {selectVerify === true && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                    <Text style={styles.content1}>須經審核</Text>
                  </Pressable>
                  <Pressable
                    style={styles.radioRow}
                    onPress={() => setSelectVerify(false)}
                  >
                    <View style={styles.radioCircle}>
                      {selectVerify === false && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                    <Text style={styles.content1}>無條件加入</Text>
                  </Pressable>
                </View>
                <ErrorTip msg={errors.verify} />
              </View>

              {/* Note */}
              <View style={{ gap: 8 }}>
                <Text style={styles.content1}>備註</Text>
                <View style={styles.multiLineFrame}>
                  <TextInput
                    editable
                    multiline
                    scrollEnabled={false}
                    style={{
                      fontSize: 16,
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
                  <SquareCheck fill="#FFA000" color="#ffffff" size={24} />
                ) : (
                  <Square color="#666" size={24} />
                )}
                <Text style={[styles.content1, { flexWrap: "wrap", flex: 1 }]}>
                  我已閱讀並同意天空中娛樂股份有限公司的{" "}
                  <Text
                    style={{
                      color: "#FFA000",
                      fontSize: 16,
                      fontWeight: "600",
                      textDecorationLine: "underline",
                    }}
                  >
                    使用條款與申明
                  </Text>
                </Text>
              </Pressable>
              <ErrorTip msg={errors.terms} />

              {/* 按鈕組 */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  gap: 48,
                  marginTop: 16,
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
                    backgroundColor: pressed ? "rgba(0,0,0,0.05)" : null,
                    borderColor: isLight
                      ? "rgba(0,0,0,0.4)"
                      : "rgba(255,255,255,0.4)",
                  })}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: isLight ? "#000" : "#fff",
                      fontWeight: "900",
                    }}
                  >
                    取消
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleOrganizeGroup}
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
                      style={{ fontSize: 16, color: "#fff", fontWeight: "900" }}
                    >
                      發布揪團
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
            <View style={{ height: 48 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <Footer page={1} />
    </>
  );
}
