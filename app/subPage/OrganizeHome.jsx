import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from "react-native";

import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Footer from "../../components/Footer";
import { useUser } from "../../utils/userContext";
import { useAppStyles } from "../../utils/useAppStyles";
import { useRef, useEffect, useState, useMemo, use } from "react";
import SelectFunc from "../../components/SelectFun";
import Btn from "../../components/Btn";
import MultipleSelectFunc from "../../components/MultipleSelectFunc";
import { Plus, Search, ChevronLeft, ListFilter } from "lucide-react-native";
import { router } from "expo-router";

export default function OrganizeHome() {
  const { styles, isLight, colorScheme } = useAppStyles();

  const { user, loading } = useUser();
  const scrollRef = useRef(null);
  const [storyName, SetStoryName] = useState("");
  const [storyPeople, SetStoryPeople] = useState("");
  const [storyStar, SetStoryStar] = useState("");
  const [storyTag, SetStoryTag] = useState([]);
  const [pageStatus, SetPageStatus] = useState(0);
  const [currentStories, SetCurrentStories] = useState([]);
  const [filterSec, OpenFilterSec] = useState(false);

  /* 下拉選單資料 */
  const optionsPeople = [
    { value: 4, label: "4人" },
    { value: 5, label: "5人" },
    { value: 6, label: "6人" },
    { value: 7, label: "7人" },
    { value: 8, label: "8人" },
    { value: 9, label: "9人" },
    { value: 10, label: "10人以上" },
  ];
  const optionsLevel = [
    { value: 1, label: "★ 1" },
    { value: 2, label: "★ 2" },
    { value: 3, label: "★ 3" },
    { value: 4, label: "★ 4" },
    { value: 5, label: "★ 5" },
  ];

  /* 劇本查詢 */
  const StorySearch = function (stories) {
    const newStories = stories.filter((item) => {
      const matchName =
        storyName !== ""
          ? storyName
              .split("")
              .every((char) =>
                item.title.toLowerCase().includes(char.toLowerCase()),
              )
          : true;

      const matchTag =
        storyTag.length > 0
          ? storyTag.every((tag) => item.tag.includes(tag))
          : true;

      const matchPeople =
        storyPeople !== ""
          ? (() => {
              if (!Array.isArray(item.people) || item.people.length === 0) {
                return String(item.people) === String(storyPeople);
              }

              const selectedNum = Number(storyPeople);
              if (item.people.length > 1) {
                const min = Math.min(...item.people);
                const max = Math.max(...item.people);

                return selectedNum >= min && selectedNum <= max;
              }

              return item.people.map(String).includes(String(storyPeople));
            })()
          : true;

      const matchStar = storyStar !== "" ? item.star === storyStar : true;

      return matchName && matchTag && matchPeople && matchStar;
    });

    const isFilter =
      storyName !== "" ||
      storyTag.length > 0 ||
      storyPeople !== "" ||
      storyStar !== "";
    if (isFilter) {
      SetCurrentStories(newStories);
      SetPageStatus(1);
    } else {
      SetCurrentStories([]);
      SetPageStatus(0);
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
            contentContainerStyle={[styles.container, { gap: 32, padding: 20 }]}
            showsVerticalScrollIndicator={false}
            ref={scrollRef}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ gap: 24, marginBottom: 32 }}>
              {/* Header */}
              <View
                style={{
                  width: "100%",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexDirection: "row",
                }}
              >
                <Pressable
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.5 : styles.cardIcon.opacity,
                    alignItems: "flex-start",
                  })}
                  onPress={() => {
                    router.back();
                  }}
                >
                  <ChevronLeft size={24} style={styles.cardIcon} />
                </Pressable>
                <Text
                  style={[
                    styles.title,
                    { alignItems: "center", textAlign: "center" },
                  ]}
                >
                  野團一覽
                </Text>
                <Pressable
                  onPress={() => router.push("/subPage/Organize")}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.5 : styles.cardIcon.opacity,
                    alignItems: "flex-start",
                  })}
                >
                  <Plus
                    color={isLight ? "#000" : "#fff"}
                    opacity={0.8}
                    size={24}
                  />
                </Pressable>
              </View>

              {/* Search and Filter */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "jusitfy-around",
                  alignItems: "center",
                  width: "100%",
                  gap: 24,
                }}
              >
                <View style={styles.searchFrame1}>
                  <Search style={styles.cardIcon} />
                  <TextInput
                    value={storyName}
                    onChangeText={(text) => {
                      SetStoryName(text);
                    }}
                    placeholder="劇本名稱"
                    placeholderTextColor={`${styles.content3.color}66`}
                    style={[
                      styles.content1,
                      { paddingVertical: 8, height: "100%" },
                    ]}
                  />
                </View>
                <Pressable
                  style={({ pressed }) => (
                    {
                      opacity: pressed ? 0.5 : styles.cardIcon.opacity,
                      alignItems: "flex-start",
                    },
                    { position: "relative", top: 8 }
                  )}
                  onPress={() => OpenFilterSec(!filterSec)}
                >
                  <ListFilter
                    color={isLight ? "#000" : "#fff"}
                    opacity={0.8}
                    size={24}
                  />
                </Pressable>
              </View>
              <View
                style={{
                  gap: 16,
                  display: filterSec ? "flex" : "none",
                }}
              >
                <MultipleSelectFunc
                  colorScheme={colorScheme}
                  value={storyTag}
                  onValueChange={SetStoryTag}
                />
                <View
                  style={{
                    width: "100%",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ width: "47%" }}>
                    <SelectFunc
                      colorScheme={colorScheme}
                      placeholder={"人數"}
                      options={optionsPeople}
                      value={storyPeople}
                      onValueChange={SetStoryPeople}
                    />
                  </View>
                  <View style={{ width: "47%" }}>
                    <SelectFunc
                      colorScheme={colorScheme}
                      placeholder={"難度"}
                      options={optionsLevel}
                      value={storyStar}
                      onValueChange={SetStoryStar}
                    />
                  </View>
                </View>
                <Btn
                  colorScheme={colorScheme}
                  font={"搜尋"}
                  func={() => StorySearch(stories)}
                  btnType={1}
                />
                {pageStatus === 1 && (
                  <Btn
                    colorScheme={colorScheme}
                    font={"清空搜尋"}
                    func={() => {
                      SetPageStatus(0);
                      SetStoryName("");
                      SetStoryPeople("");
                      SetStoryStar("");
                      SetStoryTag([]);
                      SetCurrentStories([]);
                    }}
                    btnType={0}
                  />
                )}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <View style={{ height: 120 }} />
      </SafeAreaView>
      <Footer page={1} />
    </>
  );
}
