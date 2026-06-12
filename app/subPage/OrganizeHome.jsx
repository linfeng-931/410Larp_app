import {
  View,
  Text,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ActivityIndicator,
  Alert,
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
  const [sortOrder, setSortOrder] = useState("");
  const [storyTag, setStoryTag] = useState([]);
  const [filterSec, openFilterSec] = useState(false);

  /* ── 資料庫分頁與載入狀態 ── */
  const [allGroups, setAllGroups] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [dbLoading, setDbLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false); // 伺服器是否還有資料
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE); // 畫面上顯示的數量

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

        const bookedSet = new Set();
        if (user && user?.appointments) {
          user?.appointments.forEach((appt) => {
            if (appt.date && appt.title) {
              const cleanTitle = appt.title.trim().replace(/\s+/g, "");
              bookedSet.add(`${appt.date.trim()}_${cleanTitle}`);
            }
          });
        }

        const unexpiredData = data.filter((g) => {
          const isAvailable = g.endDate >= todayStr && g.neededPeople > 0;
          if (!isAvailable) return false;

          if (user && g.title) {
            const cleanGroupTitle = g.title.trim().replace(/\s+/g, "");
            const groupKey = `${g.startDate ? g.startDate.trim() : ""}_${cleanGroupTitle}`;
            if (bookedSet.has(groupKey)) {
              return false;
            }
          }

          return true;
        });

        unexpiredData.sort(
          (a, b) => new Date(a.startDate) - new Date(b.startDate),
        );

        setSearchResults(unexpiredData);
        setLastDoc(lastVisible);
        setHasMore(data.length === PAGE_SIZE);
      } catch (error) {
        console.error("初始化野團列表失敗:", error);
      } finally {
        setDbLoading(false);
      }
    };

    loadInitialData();
  }, [todayStr, user]);

  const recentGroups = useMemo(() => {
    return [...allGroups]
      .filter((g) => g.neededPeople > 0 && g.endDate >= todayStr)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .slice(0, 5);
  }, [allGroups, todayStr]);

  const handleLoadMore = async () => {
    if (loadingMore) return;
    if (visibleCount < searchResults.length) {
      setVisibleCount((prev) => prev + PAGE_SIZE);
      return;
    }
    if (!lastDoc || !hasMore) return;

    setLoadingMore(true);
    try {
      const { fetchedGroups, lastVisible } = await fetchGroupsList(lastDoc);
      const data = fetchedGroups || [];

      if (data.length > 0) {
        const updatedAll = [...allGroups, ...data];
        setAllGroups(updatedAll);

        let filtered = updatedAll.filter(
          (g) => g.endDate >= todayStr && g.neededPeople > 0,
        );

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
          } else if (sortOrder === "asc") {
            return new Date(a.endDate) - new Date(b.endDate);
          } else {
            return new Date(a.startDate) - new Date(b.startDate);
          }
        });

        setSearchResults(filtered);
        setLastDoc(lastVisible);
      }

      setVisibleCount((prev) => prev + PAGE_SIZE);

      if (data.length < PAGE_SIZE) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("加載更多揪團失敗:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // 搜尋
  const handleSearch = () => {
    let filtered = [...allGroups].filter(
      (g) => g.endDate >= todayStr && g.neededPeople > 0,
    );

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
      } else if (sortOrder === "asc") {
        return new Date(a.endDate) - new Date(b.endDate);
      } else {
        return new Date(a.startDate) - new Date(b.startDate);
      }
    });

    setSearchResults(filtered);
    setVisibleCount(PAGE_SIZE);
  };

  const handleClearSearch = () => {
    setStoryName("");
    setStoryPeople("");
    setSortOrder(""); // 重置回空值
    setStoryTag([]);

    const defaultData = allGroups.filter(
      (g) => g.endDate >= todayStr && g.neededPeople > 0,
    );
    // 重置時回到開始日期排序
    defaultData.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    setSearchResults(defaultData);
    setVisibleCount(PAGE_SIZE);
  };

  const isFilteredState = useMemo(() => {
    const unexpiredTotal = allGroups.filter(
      (g) => g.endDate >= todayStr && g.neededPeople > 0,
    ).length;
    return (
      searchResults.length !== unexpiredTotal ||
      storyName !== "" ||
      storyPeople !== "" ||
      sortOrder !== "" ||
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

  const showLoadMoreBtn = visibleCount < searchResults.length || hasMore;

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
                <Pressable onPress={() => router.push("/subPage/Home")}>
                  <ChevronLeft size={24} style={styles.cardIcon} />
                </Pressable>
                <Text style={[styles.title, { textAlign: "center" }]}>
                  野團一覽
                </Text>
                <Pressable
                  onPress={() => {
                    if (user == null) {
                      Alert.alert("提示", "請先註冊或登入", [
                        {
                          text: "確定",
                          onPress: () => router.push("/subPage/LogIn"),
                        },
                      ]);
                      return;
                    } else router.push("/subPage/Organize");
                  }}
                >
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
              {filterSec ? (
                <View style={{ gap: 12, marginTop: 4 }}>
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
              ) : null}

              {/* 重置與清空篩選按鈕 */}
              {isFilteredState ? (
                <Btn
                  colorScheme={colorScheme}
                  font="重置並清空篩選"
                  func={handleClearSearch}
                  btnType={0}
                />
              ) : null}

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
                    {searchResults.slice(0, visibleCount).map((group) => (
                      <GroupListCard
                        key={`list-${group.id}`}
                        group={group}
                        isLight={isLight}
                        colorScheme={colorScheme}
                      />
                    ))}

                    {showLoadMoreBtn ? (
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
                            載入更多
                          </Text>
                        )}
                      </Pressable>
                    ) : null}
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
