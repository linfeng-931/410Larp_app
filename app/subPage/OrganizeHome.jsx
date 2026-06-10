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
import ScrollTop from "../../components/ScrollTop";

const PAGE_SIZE = 10;

export default function OrganizeHome() {
  const { styles, isLight, colorScheme } = useAppStyles();
  const { user } = useUser();
  const scrollRef = useRef(null);

  /* ── 搜尋篩選狀態 ── */
  const [storyName, setStoryName] = useState("");
  const [storyPeople, setStoryPeople] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [storyTag, setStoryTag] = useState([]);
  const [filterSec, openFilterSec] = useState(false);

  /* ── 資料庫分頁與載入狀態 ── */
  const [allGroups, setAllGroups] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [dbLoading, setDbLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const sectionLabelColor = isLight ? "#555" : "#aaa";
  const sectionTitleSize = 17;

  const todayStr = useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  const optionsPeople = [
    { value: "1", label: "缺 1 人" },
    { value: "2", label: "缺 2 人" },
    { value: "3", label: "缺 3 人" },
    { value: "4+", label: "缺 4 人以上" },
  ];

  const optionsSort = [
    { value: "asc", label: "截止日期：由近到遠" },
    { value: "desc", label: "截止日期：由遠到近" },
  ];

  useEffect(() => {
    const loadInitialData = async () => {
      setDbLoading(true);
      try {
        const { fetchedGroups, lastVisible } = await fetchGroupsList(null);
        const data = fetchedGroups || [];

        setAllGroups(data);

        // 過濾未過期資料
        const unexpiredData = data.filter((g) => g.endDate >= todayStr);
        unexpiredData.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));

        setSearchResults(unexpiredData);
        setLastDoc(lastVisible);
        setHasMore(data.length === 10);
      } catch (error) {
        console.error("初始化野團列表失敗:", error);
      } finally {
        setDbLoading(false);
      }
    };
    loadInitialData();
  }, [todayStr]);

  // 計算即將截止揪團
  const recentGroups = useMemo(() => {
    return [...allGroups]
      .filter((g) => g.neededPeople > 0 && g.endDate >= todayStr)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .slice(0, 5);
  }, [allGroups, todayStr]);

  // 載入更多
  const handleLoadMore = async () => {
    if (loadingMore || !lastDoc) return;
    setLoadingMore(true);
    try {
      const { fetchedGroups, lastVisible } = await fetchGroupsList(lastDoc);
      const data = fetchedGroups || [];

      if (data.length > 0) {
        const updatedAll = [...allGroups, ...data];
        setAllGroups(updatedAll);

        let filtered = updatedAll.filter((g) => g.endDate >= todayStr);

        // 條件過濾
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

        filtered.sort((a, b) => {
          return sortOrder === "desc"
            ? new Date(b.endDate) - new Date(a.endDate)
            : new Date(a.endDate) - new Date(b.endDate);
        });

        setSearchResults(filtered);
        setLastDoc(lastVisible);
      }

      if (data.length < 10) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("加載更多揪團失敗:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // 搜尋過濾
  const handleSearch = () => {
    let filtered = [...allGroups].filter((g) => g.endDate >= todayStr);

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

    filtered.sort((a, b) => {
      if (sortOrder === "desc") {
        return new Date(b.endDate) - new Date(a.endDate);
      } else {
        return new Date(a.endDate) - new Date(b.endDate);
      }
    });

    setSearchResults(filtered);
  };

  // 清空搜尋
  const handleClearSearch = () => {
    setStoryName("");
    setStoryPeople("");
    setSortOrder("asc");
    setStoryTag([]);

    const defaultData = allGroups.filter((g) => g.endDate >= todayStr);
    defaultData.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
    setSearchResults(defaultData);
  };

  const isFilteredState = useMemo(() => {
    const unexpiredTotal = allGroups.filter(
      (g) => g.endDate >= todayStr,
    ).length;
    return (
      searchResults.length !== unexpiredTotal ||
      storyName !== "" ||
      storyPeople !== "" ||
      sortOrder !== "asc" ||
      storyTag.length > 0
    );
  }, [
    allGroups,
    searchResults,
    todayStr,
    storyName,
    storyPeople,
    sortOrder,
    storyTag,
  ]);

  return (
    <>
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
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

            {/* 最近揪團 */}
            <View style={{ marginVertical: 16 }}>
              <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
                <Text style={[styles.title, { fontSize: sectionTitleSize }]}>
                  即將截止揪團
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
                    onChangeText={(text) => {
                      setStoryName(text);
                    }}
                    onSubmitEditing={handleSearch}
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
                    color={filterSec ? "#FFA000" : isLight ? "#000" : "#fff"}
                    opacity={0.8}
                    size={24}
                  />
                </Pressable>
              </View>

              {/* 進階篩選抽屜 */}
              {filterSec && (
                <View style={{ gap: 12, marginTop: 4 }}>
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
                        placeholder="截止日期排序"
                        options={optionsSort}
                        value={sortOrder}
                        onValueChange={setSortOrder}
                      />
                    </View>
                  </View>

                  <View style={{ gap: 8, marginTop: 4 }}>
                    <Btn
                      colorScheme={colorScheme}
                      font="執行篩選"
                      func={handleSearch}
                      btnType={1}
                    />
                  </View>
                </View>
              )}

              {/* 重置與清空篩選按鈕 */}
              {isFilteredState && (
                <Btn
                  colorScheme={colorScheme}
                  font="重置並清空篩選"
                  func={handleClearSearch}
                  btnType={0}
                />
              )}

              {/* 滿版縱向列表 */}
              <View style={{ gap: 16, marginTop: 4, width: "100%" }}>
                {dbLoading ? (
                  <ActivityIndicator size="large" color="#FFA000" />
                ) : searchResults.length === 0 ? (
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
                    {searchResults.map((group) => (
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
                        disabled={loadingMore}
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
                        {loadingMore ? (
                          <ActivityIndicator size="small" color="#FFA000" />
                        ) : (
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "bold",
                              color: "#FFA000",
                            }}
                          >
                            查看更多揪團
                          </Text>
                        )}
                      </Pressable>
                    )}
                  </>
                )}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <ScrollTop scrollRef={scrollRef} styles={styles} />
      <Footer page={1} />
    </>
  );
}
