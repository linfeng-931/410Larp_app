import {
    View,
    Text,
    TextInput,
    Pressable,
    ScrollView,
    Platform,
    KeyboardAvoidingView,
    Keyboard,
    Image,
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
    Square,
    SquareCheck,
    CircleAlert,
    UserRound,
} from "lucide-react-native";
import LottieView from "lottie-react-native";
import { useAppStyles } from "../../utils/useAppStyles";
import { useUser } from "../../utils/userContext";
import Footer from "../../components/Footer";
import { subscribeUserData } from "../../utils/authService";
import { Calendar, CalendarList } from 'react-native-calendars';
import SelectFunc from "../../components/SelectFun";
import Card from "../../components/Card"

export default function Organize() {
    const { styles, isLight, colorScheme } = useAppStyles();
    const { user, setUser } = useUser();
    const { id, cover, title, people, price, hour } = useLocalSearchParams();

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
    const [selectVerify, setSelectVerify] = useState(true);

    // 輸入
    const [formData, setFormData] = useState({
        selectVerify: selectVerify,
        hostName: "",
        otherRequire: "",
        agreeTerms: false,
        address: "臺北市中山區長安東路一段24-2號3樓",
    });

    // 取得最長遊玩時長
    const [storyPeople, SetStoryPeople] = useState('');
    const durationNum = useMemo(() => {
        const match = hour?.match(/(?<=-)\d+/) || hour?.match(/\d+/);
        return match ? parseFloat(match[0]) : 4;
    }, [hour]);

    //player list
    const optionsPeople = useMemo(() => {
        if (!people || typeof people !== 'string') {
            return [{ value: 4, label: '4人' }];
        }

        const matches = people.match(/\d+/g);
        if (!matches || matches.length === 0) {
            return [{ value: 4, label: '4人' }];
        }

        const numbers = matches.map(Number);
        const minPeople = 1;
        const maxPeople = Math.max(...numbers);

        const dynamicOptions = [];
        for (let i = minPeople; i <= maxPeople; i++) {
            dynamicOptions.push({
                value: i,
                label: `${i}人`,
            });
        }

        return dynamicOptions;
    }, [people]);

    /*const formatDate = (d) => {
      return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getDate().toString().padStart(2, "0")}`;
    };*/

    // 日期選擇限制
    const mainColor = '#FFA000';
    const today = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(today.getMonth() + 3);

    //格式化成'YYYY-MM-DD'
    const formatDate = (date) => date.toISOString().split('T')[0];

    const minDateStr = formatDate(today);
    const maxDateStr = formatDate(threeMonthsLater);

    //arrow判斷
    const [isRightArrowDisabled, setIsRightArrowDisabled] = useState(false);
    const [isLeftArrowDisabled, setIsLeftArrowDisabled] = useState(false);
    const handleMonthChange = (month) => {
        const currentYear = month.year;
        const currentMonth = month.month;

        const maxYear = threeMonthsLater.getFullYear();
        const maxMonth = threeMonthsLater.getMonth() + 1;
        const minYear = today.getFullYear();
        const minMonth = today.getMonth() + 1;

        if (currentYear > maxYear || (currentYear === maxYear && currentMonth >= maxMonth)) {
            setIsRightArrowDisabled(true);
        } else {
            setIsRightArrowDisabled(false);
        }

        if (currentYear < minYear || (currentYear === minYear && currentMonth <= minMonth)) {
            setIsLeftArrowDisabled(true);
        } else {
            setIsLeftArrowDisabled(false);
        }
    };

    //startDate and endDate
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [markedDates, setMarkedDates] = useState({});

    const getDatesInRange = (startStr, endStr) => {
        const dates = {};
        let start = new Date(startStr);
        const end = new Date(endStr);

        while (start <= end) {
            const dateString = formatDate(start);

            //style
            if (dateString === startStr) {
                dates[dateString] = { startingDay: true, color: mainColor, textColor: 'white' };
            } else if (dateString === endStr) {
                dates[dateString] = { endingDay: true, color: mainColor, textColor: 'white' };
            } else {
                dates[dateString] = { color: mainColor, textColor: 'white' };
            }
            start.setDate(start.getDate() + 1);
        }
        return dates;
    };

    //日期點擊
    const handleDayPress = (day) => {
        const dateString = day.dateString;

        //尚未選取開始日期
        if (!startDate || (startDate && endDate)) {
            setStartDate(dateString);
            setEndDate(null);

            setMarkedDates({
                [dateString]: { startingDay: true, endingDay: true, color: mainColor, textColor: 'white' }
            });
        }
        //選取結束日期
        else if (startDate && !endDate) {
            if (new Date(dateString) < new Date(startDate)) {
                setStartDate(dateString);
                setMarkedDates({
                    [dateString]: { startingDay: true, endingDay: true, color: mainColor, textColor: 'white' }
                });
            } else {
                setEndDate(dateString);
                const rangeDates = getDatesInRange(startDate, dateString);
                setMarkedDates(rangeDates);
            }
        }
    };

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
                        totalPrice: formData.selectVerify
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
                        <Text style={styles.title}>揪團</Text>
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
                                <Text style={[styles.bigTitleNormal, { marginBottom: 8 }]}>{title}</Text>
                                <View style={{maxWidth: '70%', alignSelf:'flex-start'}}>
                                    {people.length === 1 ? (
                                        <Text style={{ backgroundColor: mainColor, padding: 6, fontSize: 16, borderRadius: 4, color: '#fff', textAlign: 'center' }}>需求人數：{people}人</Text>
                                    ) : (
                                        <Text style={{ backgroundColor: mainColor, padding: 6, fontSize: 16, borderRadius: 4, color: '#fff', textAlign: 'center' }}>
                                            需求人數：{people[0]}-{people[1]}人
                                        </Text>
                                    )}
                                </View>
                            </View>

                            {/* People */}
                            <View style={{ gap: 8 }}>
                                <Text style={styles.content1}>當前人數</Text>
                                <SelectFunc colorScheme={colorScheme} placeholder={'人數'} options={optionsPeople} value={storyPeople} onValueChange={SetStoryPeople} />
                            </View>

                            {/* Date Choice */}
                            <View style={{ gap: 8 }}>
                                <Text style={styles.content1}>預計日期區間</Text>
                                <Calendar
                                    initialDate={minDateStr}
                                    minDate={minDateStr}
                                    maxDate={maxDateStr}
                                    monthFormat={'yyyy 年 MM 月'}
                                    onDayPress={handleDayPress}

                                    onMonthChange={handleMonthChange}
                                    hideArrows={false}
                                    disableArrowLeft={isLeftArrowDisabled}
                                    disableArrowRight={isRightArrowDisabled}
                                    disableMonthChange={false}

                                    hideExtraDays={true}
                                    firstDay={1}
                                    enableSwipeMonths={!isLeftArrowDisabled && !isRightArrowDisabled}
                                    disableAllTouchEventsForDisabledDays={true}

                                    markingType={'period'}
                                    markedDates={markedDates}

                                    theme={{
                                        arrowColor: '#FFA000',
                                        textMonthFontWeight: 'bold',
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
                            </View>
                            <View style={{ gap: 8 }}>
                                <Text style={styles.content1}>備註</Text>

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
                                                <Text
                                                    style={{
                                                        color: pressed ? "#e69303" : "#FFA000",
                                                        fontSize: 16,
                                                        fontWeight: "600",
                                                        textDecorationLine: "underline",
                                                    }}
                                                >
                                                    社群友善條約
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
