import {
  View,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Text,
  useColorScheme,
  Dimensions,
} from "react-native";

import { Stack } from "expo-router";
import { useUser } from "../utils/userContext";
import { getStyles } from "../utils/styleFormat";
import { useAppStyles } from "../utils/useAppStyles";
import { useState, useRef, useEffect } from "react";
import { subscribeUserData } from "../utils/authService";
import Homecard from "./Homecard";

export default function AppointmentList({ todayDate, selectedDate }) {
  const colorScheme = useColorScheme();
  const { styles, isLight } = useAppStyles();
  const { user, setUser } = useUser();
  const { width } = Dimensions.get("window");

  // 狀態
  const [currentIndex, setCurrentIndex] = useState(0);

  // 抓取對應日期的預約清單
  const targetDate = selectedDate || todayDate;
  const filteredAppointments =
    user?.appointments?.filter((item) => {
      return item.date === targetDate;
    }) || [];

  // console.log(filteredAppointments);

  // 滑動
  const Pagination = (
    <View style={styles.dotContainer}>
      {Array.from({ length: filteredAppointments.length }).map((_, index) => {
        if (index === currentIndex) {
          return <View key={index} style={styles.dotActive}></View>;
        } else {
          return <View key={index} style={styles.dot}></View>;
        }
      })}
    </View>
  );

  const onScroll = (event) => {
    const totalWidth = event.nativeEvent.layoutMeasurement.width;
    const xPos = event.nativeEvent.contentOffset.x;

    let current = Math.round(xPos / totalWidth);

    if (current < 0) current = 0;
    if (current >= filteredAppointments.length)
      current = filteredAppointments.length - 1;

    setCurrentIndex(current);
  };

  return (
    <View style={{ alignItems: "center", marginTop: 24, gap: 24 }}>
      {filteredAppointments.length > 0 ? (
        <FlatList
          data={filteredAppointments}
          horizontal
          pagingEnabled
          renderItem={({ item }) => (
            <Homecard
              key={item.bookingId}
              story={item}
              colorScheme={colorScheme}
              horizontal={true}
            />
          )}
          keyExtractor={(item) => item.bookingId}
          showsHorizontalScrollIndicator={false}
        />
      ) : (
        <View
          style={{
            alignItems: "center",
            // iOS 陰影
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 0 },

            // Android 陰影
            elevation: 5,
          }}
        >
          <View
            style={[
              styles.homeCardHorizantal,
              { justifyContent: "center", alignItems: "center" },
            ]}
          >
            <Text style={[styles.title, { opacity: 0.8 }]}>無預定行程</Text>
          </View>
        </View>
      )}

      {Pagination}
    </View>
  );
}
