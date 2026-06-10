import {
  View,
  Text,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Stack, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Footer from "../../components/Footer";
import { useUser } from "../../utils/userContext";
import { useAppStyles } from "../../utils/useAppStyles";
import { useRef, useState, useEffect, useMemo } from "react";
import SelectFunc from "../../components/SelectFun";
import Btn from "../../components/Btn";
import MultipleSelectFunc from "../../components/MultipleSelectFunc";
import { Plus, Search, ChevronLeft, ListFilter } from "lucide-react-native";
import { fetchGroupsList } from "../../utils/authService";
import { RecentGroupCard, GroupListCard } from "../../components/OrganizeCard";

const PAGE_SIZE = 10;

export default function OrganizeHome() {
  const { styles, isLight, colorScheme } = useAppStyles();
  const { user } = useUser();
  const scrollRef = useRef(null);

  /* ── 搜尋篩選狀態 ── */
  const [storyName, setStoryName] = useState("");
  const [storyPeople, setStoryPeople] = useState("");
  const [storyStar, setStoryStar] = useState("");
  const [storyTag, setStoryTag] = useState([]);
  const [filterSec, openFilterSec] = useState(false);

  /* ── 資料庫資料狀態 ── */
  const [allGroups, setAllGroups] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [dbLoading, setDbLoading] = useState(true);

  const sectionLabelColor = isLight ? "#555" : "#aaa";
  const sectionTitleSize = 17;

  const optionsPeople = [
    { value: "1", label: "缺 1 人" },
    { value: "2", label: "缺 2 人" },
    { value: "3", label: "缺 3 人" },
    { value: "4", label: "缺 4 人以上" },
  ];
  const optionsLevel = [
    { value: 1, label: "★ 1" },
    { value: 2, label: "★ 2" },
    { value: 3, label: "★ 3" },
    { value: 4, label: "★ 4" },
    { value: 5, label: "★ 5" },
  ];

  useEffect(() => {
    const loadData = async () => {
      setDbLoading(true);
      try {
        const { fetchedGroups } = await fetchGroupsList(null);
        setAllGroups(fetchedGroups || []);
        setSearchResults(fetchedGroups || []);
      } catch (error) {
        console.error("初始化野團列表失敗:", error);
      } finally {
        setDbLoading(false);
      }
    };
    loadData();
  }, []);

  const recentGroups = useMemo(() => {
    return [...allGroups]
      .filter((g) => g.neededPeople > 0)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .slice(0, 5);
  }, [allGroups]);

  const handleSearch = () => {
    let filtered = [...allGroups];

    if (storyName.trim()) {
      filtered = filtered.filter((g) =>
        g.title.toLowerCase().includes(storyName.toLowerCase()),
      );
    }
    if (storyPeople) {
      filtered = filtered.filter((g) => {
        if (storyPeople === "4+") return g.neededPeople >= 4;
        return g.neededPeople === Number(storyPeople);
      });
    }

    setSearchResults(filtered);
    setVisibleCount(PAGE_SIZE);
  };

  const handleClearSearch = () => {
    setStoryName("");
    setStoryPeople("");
    setStoryStar("");
    setStoryTag([]);
    setSearchResults(allGroups);
    setVisibleCount(PAGE_SIZE);
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  };

  const visibleResults = searchResults.slice(0, visibleCount);
  const hasMore = visibleCount < searchResults.length;

  return (
    <>
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          {/* 修正點 1：移除 contentContainerStyle 中的 styles.container，改用純物件控高，徹底修復無法滾動 */}
          <ScrollView
            contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
            showsVerticalScrollIndicator={false}
            ref={scrollRef}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={{ paddingHorizontal: 20, paddingVertical: 10 }}>
              <View
                style={{
                  width: "100%",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexDirection: "row",
                }}
              >
                <Pressable onPress={() => router.back()}>
                  <ChevronLeft size={24} style={styles.cardIcon} />
                </Pressable>
                <Text style={[styles.title, { textAlign: "center" }]}>
                  野團一覽
                </Text>
                <Pressable onPress={() => router.push("/subPage/Organize")}>
                  <Plus
                    color={isLight ? "#000" : "#fff"}
                    opacity={0.8}
                    size={24}
                  />
                </Pressable>
              </View>
            </View>

            {/* 最近揪團 (橫向滑動) */}
            <View style={{ marginVertical: 16 }}>
              <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
                <Text style={[styles.title, { fontSize: sectionTitleSize }]}>
                  🔥 即將截止揪團
                </Text>
              </View>

              {dbLoading ? (
                <ActivityIndicator size="small" color="#FFA000" />
              ) : recentGroups.length === 0 ? (
                <Text
                  style={{
                    paddingHorizontal: 20,
                    fontSize: 13,
                    color: sectionLabelColor,
                  }}
                >
                  目前沒有即將截止的揪團
                </Text>
              ) : (
                /* 修正點 2：移除 gap 屬性，改用傳統 flexDirection 容器控寬，確保卡片大小正常 */
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingHorizontal: 20,
                    flexDirection: "row",
                  }}
                >
                  {recentGroups.map((group) => (
                    <RecentGroupCard
                      key={`recent-${group.id}`}
                      group={group}
                      isLight={isLight}
                      colorScheme={colorScheme}
                    />
                  ))}
                </ScrollView>
              )}
            </View>

            {/* 劇本查詢與列表 */}
            <View style={{ gap: 16, paddingHorizontal: 20, marginTop: 8 }}>
              <Text style={[styles.title, { fontSize: sectionTitleSize }]}>
                尋找揪團
              </Text>

              {/* 搜尋列 */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  width: "100%",
                  gap: 12,
                }}
              >
                <View
                  style={[
                    styles.searchFrame1,
                    {
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 10,
                    },
                  ]}
                >
                  <Search style={styles.cardIcon} size={20} />
                  <TextInput
                    value={storyName}
                    onChangeText={setStoryName}
                    placeholder="搜尋揪團名稱或劇本..."
                    placeholderTextColor={`${styles.content3.color}66`}
                    style={[
                      styles.content1,
                      {
                        paddingVertical: 8,
                        height: 45,
                        flex: 1,
                        marginLeft: 8,
                      },
                    ]}
                  />
                </View>
                <Pressable
                  style={{ justifyContent: "center" }}
                  onPress={() => openFilterSec(!filterSec)}
                >
                  <ListFilter
                    color={isLight ? "#000" : "#fff"}
                    opacity={0.8}
                    size={24}
                  />
                </Pressable>
              </View>

              {/* 進階篩選抽屜 */}
              {filterSec && (
                <View style={{ gap: 12 }}>
                  <MultipleSelectFunc
                    colorScheme={colorScheme}
                    value={storyTag}
                    onValueChange={setStoryTag}
                  />
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ width: "47%" }}>
                      <SelectFunc
                        colorScheme={colorScheme}
                        placeholder="目前缺人數"
                        options={optionsPeople}
                        value={storyPeople}
                        onValueChange={setStoryPeople}
                      />
                    </View>
                    <View style={{ width: "47%" }}>
                      <SelectFunc
                        colorScheme={colorScheme}
                        placeholder="難度"
                        options={optionsLevel}
                        value={storyStar}
                        onValueChange={setStoryStar}
                      />
                    </View>
                  </View>
                </View>
              )}

              {/* 功能按鈕 */}
              <Btn
                colorScheme={colorScheme}
                font="搜尋"
                func={handleSearch}
                btnType={1}
              />
              {storyName || storyPeople || storyStar || storyTag.length > 0 ? (
                <Btn
                  colorScheme={colorScheme}
                  font="清空搜尋"
                  func={handleClearSearch}
                  btnType={0}
                />
              ) : null}

              {/* 滿版縱向列表 */}
              <View style={{ gap: 16, marginTop: 12, width: "100%" }}>
                {dbLoading ? (
                  <ActivityIndicator size="large" color="#FFA000" />
                ) : visibleResults.length === 0 ? (
                  <Text
                    style={{
                      fontSize: 13,
                      color: sectionLabelColor,
                      textAlign: "center",
                      paddingVertical: 16,
                    }}
                  >
                    找不到任何開放中的揪團
                  </Text>
                ) : (
                  <>
                    {visibleResults.map((group) => (
                      <GroupListCard
                        key={`list-${group.id}`}
                        group={group}
                        isLight={isLight}
                        colorScheme={colorScheme}
                      />
                    ))}

                    {hasMore && (
                      <Pressable
                        onPress={handleLoadMore}
                        style={({ pressed }) => ({
                          opacity: pressed ? 0.6 : 1,
                          alignItems: "center",
                          paddingVertical: 14,
                          borderRadius: 10,
                          borderWidth: 1.5,
                          borderColor: "#FFA000",
                          marginTop: 6,
                        })}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "bold",
                            color: "#FFA000",
                          }}
                        >
                          查看更多（剩餘 {searchResults.length - visibleCount}{" "}
                          筆）
                        </Text>
                      </Pressable>
                    )}
                  </>
                )}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <Footer page={1} />
    </>
  );
}
