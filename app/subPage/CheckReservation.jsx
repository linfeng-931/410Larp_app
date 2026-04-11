import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useRef, useEffect, useState, useMemo, use } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { CircleAlert } from "lucide-react-native";
import LottieView from "lottie-react-native";
import { useAppStyles } from "../../utils/useAppStyles";
import { useUser } from "../../utils/userContext";
import { checkCreateReservation } from "../../utils/authService";
import Footer from "../../components/Footer";
import CheckInfo from "../../components/CheckInfo";
import TableRow from "../../components/TableRow";

export default function CheckReservation() {
  const { styles, isLight } = useAppStyles();
  const { user } = useUser();
  const { data } = useLocalSearchParams();

  const bookingInfo = useMemo(() => {
    try {
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error("解析資料失敗", e);
      return {};
    }
  }, [data]);

  const scrollRef = useRef(null);

  // 動畫
  const animationRef = useRef(null);
  const loadingAnimation = require("../../assets/animation/Loading.json");

  const handlePress = async (btnName) => {};

  // 狀態
  const [errors, setErrors] = useState({});
  const [isCouponLoading, setIsCouponLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [coupon, setCoupon] = useState("");

  // 處理預約
  const handleNextStep = async () => {
    setIsSubmitLoading(true);

    try {
      await checkCreateReservation({
        userId: user.uid,
        userName: user.displayName,
        date: bookingInfo.date,
        time: bookingInfo.time,
        title: bookingInfo.title,
        people: bookingInfo.people,
        address: bookingInfo.address,
        originPrice: bookingInfo.originPrice,
        totalPrice: bookingInfo.totalPrice,
        duration: bookingInfo.duration,
        hostName: bookingInfo.hostName,
        otherRequire: bookingInfo.otherRequire,
      });

      Alert.alert("成功", "預約已完成！", [
        {
          text: "確認",
          onPress: () => {
            router.replace("/subPage/Home");
          },
        },
      ]);
    } catch (error) {
      if (error.message === "occupied") {
        Alert.alert("預約失敗", "很抱歉，該時段剛被其他用戶預約了。");
      } else {
        Alert.alert("錯誤", "系統忙碌中，請稍後再試");
      }
    } finally {
      setIsSubmitLoading(false);
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
            <View style={{ gap: 32, width: "100%", paddingHorizontal: 32 }}>
              <CheckInfo
                title={"預約人"}
                value={user?.firstName + user?.lastName}
              />
              <CheckInfo title={"連絡電話"} value={user?.phone} />
              <CheckInfo title={"連絡信箱"} value={user?.email} />
              <CheckInfo title={"地點"} value={bookingInfo.address} />
              <CheckInfo title={"預約日期"} value={bookingInfo.date} />
              <CheckInfo
                title={"備註"}
                value={
                  bookingInfo.otherRequire == ""
                    ? "無"
                    : bookingInfo.otherRequire
                }
              />
            </View>
            {/* Table */}
            <View
              style={{ width: "100%", paddingHorizontal: 32, marginTop: 16 }}
            >
              <TableRow
                label="內容"
                price="價格"
                count="人數"
                total="小計"
                isHeader
              />
              <TableRow
                label={bookingInfo.title}
                price={`NT$${bookingInfo.originPrice}`}
                count={bookingInfo.people}
                total={`NT$${bookingInfo.originPrice * bookingInfo.people}`}
              />
              <TableRow
                label={`指定主持人：${bookingInfo.selectHost ? bookingInfo.hostName : "無"}`}
                price=""
                count=""
                total={`NT$${bookingInfo.selectHost ? 200 : 0}`}
              />
              <TableRow label="折抵" price="" count="" total="NT$0" />
              <TableRow
                label="總計"
                price=""
                count=""
                total={`NT$${bookingInfo.totalPrice}`}
                isTotal
              />
            </View>
            {/* Coupon */}
            <View style={{ gap: 8, width: "100%", paddingHorizontal: 32 }}>
              <Text style={[styles.content1, { opacity: 0.5 }]}>
                輸入折扣碼
              </Text>
              <View style={{ flexDirection: "row", gap: 16 }}>
                <View style={[styles.couponFrame]}>
                  <TextInput
                    style={[styles.textInput]}
                    placeholder="輸入折扣碼"
                    placeholderTextColor={
                      isLight
                        ? "rgba(0, 0, 0, 0.4)"
                        : "rgba(255, 255, 255, 0.4)"
                    }
                    value={coupon}
                    onChangeText={(t) => {
                      setCoupon(t);
                    }}
                  />
                </View>
                <Pressable
                  disabled={isCouponLoading}
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
                  {isCouponLoading ? (
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
                      套用
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
            {/* Btns */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                gap: 48,
                paddingHorizontal: 32,
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
                  上一頁
                </Text>
              </Pressable>
              <Pressable
                onPress={handleNextStep}
                disabled={isSubmitLoading}
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
                {isSubmitLoading ? (
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
                    送出訂單
                  </Text>
                )}
              </Pressable>
            </View>
            <View style={{ height: 48 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Footer page={2} />
    </>
  );
}
