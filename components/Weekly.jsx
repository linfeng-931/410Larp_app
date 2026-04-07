import {
  View,
  useColorScheme,
  Text,
  Pressable,
  Animated,
  Dimensions,
} from "react-native";
import PagerView from "react-native-pager-view";
import { startOfWeek, addDays, subDays, isSameDay } from "date-fns";
import { useUser } from "../utils/userContext";
import { useFonts } from "expo-font";
import { useState, useRef, useEffect } from "react";
import { Undo2 } from "lucide-react-native";
import { useAppStyles } from "../utils/useAppStyles";

const { width } = Dimensions.get("window");

export default function Weekly() {
  const { user } = useUser();
  const { styles, isLight } = useAppStyles();

  // 初始化時間
  const now = new Date();
  const todayDate = now.toISOString().slice(0, 10);

  const [baseDate, setBaseDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const translateX = useRef(new Animated.Value(0)).current;

  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // 取得週
  const generateWeek = (date) => {
    const start = startOfWeek(date);
    return Array.from({ length: 7 }).map((_, i) => {
      const d = addDays(start, i);
      return {
        fullDate: d.toISOString().slice(0, 10),
        dateNum: d.getDate(),
        dayName: dayNames[d.getDay()],
      };
    });
  };

  const pages = [
    generateWeek(subDays(baseDate, 7)),
    generateWeek(baseDate),
    generateWeek(addDays(baseDate, 7)),
  ];

  const onPageSelected = (e) => {
    const index = e.nativeEvent.position;
    if (index === 0) {
      setBaseDate(subDays(baseDate, 7));
      translateX.setValue(0);
    } else if (index === 2) {
      setBaseDate(addDays(baseDate, 7));
      translateX.setValue(0);
    }
  };

  const handleSelect = (fullDate, index) => {
    setSelectedDate(fullDate);
    const itemWidth = (width - 40) / 7;
    Animated.spring(translateX, {
      toValue: index * itemWidth,
      useNativeDriver: true,
    }).start();
  };

  const goToToday = () => {
    setBaseDate(new Date());
    setSelectedDate(todayDate);
    const todayIndex = new Date().getDay();
    handleSelect(todayDate, todayIndex);
  };

  /* 文字載入 */
  let [fontsLoaded] = useFonts({
    Nobills: require("../assets/fonts/PostNoBills.ttf"),
    ChFont: require("../assets/fonts/ChFont.ttf"),
  });
  if (!fontsLoaded) return null;

  return (
    <View style={{ gap: 6 }}>
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

      <View style={{ height: 110 }}>
        <PagerView
          style={{ flex: 1 }}
          initialPage={1}
          onPageSelected={onPageSelected}
          key={baseDate.toISOString()}
        >
          {pages.map((week, pIndex) => (
            <View
              key={pIndex}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
                position: "relative",
                paddingHorizontal: 0,
              }}
            >
              {pIndex === 1 && (
                <Animated.View
                  style={[styles.indicator, { transform: [{ translateX }] }]}
                />
              )}

              {week.map((item, index) => {
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
                    <View
                      style={[styles.dateBox, isSelected && styles.selectedBox]}
                    >
                      <Text
                        style={[styles.content6, isToday && styles.todayText]}
                      >
                        {item.dateNum}
                      </Text>
                      <Text
                        style={[
                          { fontWeight: "600" },
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
          ))}
        </PagerView>
      </View>
    </View>
  );
}
