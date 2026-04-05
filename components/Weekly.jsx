import {
  View,
  useColorScheme,
  Text,
  Pressable,
  Animated,
  Dimensions,
} from "react-native";
import { getStyles } from "../utils/styleFormat";
import { useUser } from "../utils/userContext";
import { useFonts } from "expo-font";
import { useState, useRef } from "react";
import { Undo2 } from "lucide-react-native";
import { colors } from "../utils/colors";

const { width } = Dimensions.get("window");

export default function Weekly() {
  const { user } = useUser();
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme);
  const isLight = colorScheme === "light";
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const translateX = useRef(new Animated.Value(0)).current; // 下划線

  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // 取得本週
  const getWeeklyData = () => {
    const now = new Date();
    const week = [];

    const sunday = new Date(now);
    sunday.setDate(now.getDate() - now.getDay());

    for (let i = 0; i < 7; i++) {
      const tempDate = new Date(sunday);
      tempDate.setDate(sunday.getDate() + i);

      week.push({
        fullDate: tempDate.toISOString().slice(0, 10),
        dateNum: tempDate.getDate(),
        dayName: dayNames[tempDate.getDay()],
      });
    }
    return week;
  };

  const weekData = getWeeklyData();

  // 今天日期
  const now = new Date();
  const date = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const formatMonth = String(month).padStart(2, "0");
  const formatDate = String(date).padStart(2, "0");

  const todayDate = `${year}-${formatMonth}-${formatDate}`;

  // 日期選擇
  const handleSelect = (fullDate, index) => {
    setSelectedDate(fullDate);
    const itemWidth = (width - 40) / 7;
    Animated.spring(translateX, {
      toValue: index * itemWidth,
      useNativeDriver: true,
    }).start();
  };

  const goToToday = () => {
    const todayIndex = weekData.findIndex((d) => d.fullDate === todayDate);
    if (todayIndex !== -1) handleSelect(todayDate, todayIndex);
  };

  /* 文字載入 */
  let [fontsLoaded] = useFonts({
    Nobills: require("../assets/fonts/PostNoBills.ttf"),
    ChFont: require("../assets/fonts/ChFont.ttf"),
  });
  if (!fontsLoaded) return null;

  return (
    <View style={{ gap: 4 }}>
      <Pressable onPress={goToToday}>
        {({ pressed }) => (
          <View
            style={{
              flexDirection: "row-reverse",
              alignItems: "center",
              alignSelf: "flex-end",
              gap: 4,
              borderBottomWidth: 1,
              borderBottomColor: pressed
                ? "#FFA000"
                : isLight
                  ? "#000"
                  : "#fff",
            }}
          >
            <Undo2
              color={pressed ? "#FFA000" : isLight ? "#000" : "#fff"}
              width={16}
            />
            <Text style={pressed ? styles.content7 : styles.content2}>
              回到今日
            </Text>
          </View>
        )}
      </Pressable>
      <View
        style={[
          {
            height: 100,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            position: "relative",
          },
        ]}
      >
        <Animated.View
          style={[styles.indicator, { transform: [{ translateX }] }]}
        />
        {weekData.map((item, index) => {
          const isSelected = item.fullDate === selectedDate;
          const isToday = item.fullDate === todayDate;
          const hasApp = user?.appointments?.some(
            (a) => a.date === item.fullDate,
          );
          return (
            <Pressable
              key={index}
              onPress={() => handleSelect(item.fullDate, index)}
              style={styles.dayItem}
            >
              <View style={[styles.dateBox, isSelected && styles.selectedBox]}>
                <Text style={[styles.content6, isToday && styles.todayText]}>
                  {item.dateNum}
                </Text>
                <Text
                  style={[
                    { fontWeight: 600 },
                    isLight ? styles.content3 : styles.content4,
                    isSelected && { color: "#FFA000", opacity: 1 },
                  ]}
                >
                  {item.dayName}
                </Text>
                {hasApp && <View style={styles.dot} />}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
