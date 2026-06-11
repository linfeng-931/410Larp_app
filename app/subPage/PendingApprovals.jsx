import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
  Alert,
  StyleSheet,
} from "react-native";
import { Stack, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "../../utils/userContext";
import { useAppStyles } from "../../utils/useAppStyles";
import { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, ListFilter } from "lucide-react-native";
import {
  fetchMyOrganizedGroups,
  fetchPendingApplicantsDetails,
  processJoinRequest,
} from "../../utils/authService";
import SelectFunc from "../../components/SelectFun";
import Btn from "../../components/Btn";

export default function PendingApprovals() {
  const { styles, isLight, colorScheme } = useAppStyles();
  const { user } = useUser();

  const [allApplicants, setAllApplicants] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const [filterSec, setFilterSec] = useState(false);
  const [storyName, setStoryName] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  const loadPendingList = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const myGroups = await fetchMyOrganizedGroups(user.uid);
      const details = await fetchPendingApplicantsDetails(myGroups);
      setAllApplicants(details);
      setSearchResults(details);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPendingList();
  }, [loadPendingList]);

  const storyOptions = useMemo(() => {
    const titles = [...new Set(allApplicants.map((a) => a.groupTitle))];
    return titles.map((t) => ({ value: t, label: t }));
  }, [allApplicants]);

  const optionsSort = [
    { value: "desc", label: "申請日期：由近到遠" },
    { value: "asc", label: "申請日期：由遠到近" },
  ];

  const handleSearch = () => {
    let filtered = [...allApplicants];

    if (storyName) {
      filtered = filtered.filter((a) => a.groupTitle === storyName);
    }

    if (sortOrder) {
      filtered.sort((a, b) => {
        return sortOrder === "asc"
          ? new Date(a.applyDate) - new Date(b.applyDate)
          : new Date(b.applyDate) - new Date(a.applyDate);
      });
    }

    setSearchResults(filtered);
  };

  const handleClearSearch = () => {
    setStoryName("");
    setSortOrder("");
    setSearchResults([...allApplicants]);
  };

  const isFilteredState = useMemo(() => {
    return storyName !== "" || sortOrder !== "";
  }, [storyName, sortOrder]);

  const handleProcess = async (groupId, applicantId, isApproved) => {
    setProcessingId(applicantId);
    try {
      await processJoinRequest(groupId, applicantId, isApproved);
      Alert.alert(
        "成功",
        isApproved ? "已同意該使用者加入！" : "已拒絕並刪除該申請！",
      );
      setAllApplicants((prev) =>
        prev.filter((a) => a.applicantId !== applicantId),
      );
      setSearchResults((prev) =>
        prev.filter((a) => a.applicantId !== applicantId),
      );
    } catch (error) {
      Alert.alert("處理失敗", error.message || "發生錯誤");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: isLight ? "#eee" : "#333",
        }}
      >
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
          <Text style={[styles.title, { textAlign: "center", fontSize: 18 }]}>
            審核申請
          </Text>

          <Pressable onPress={() => setFilterSec(!filterSec)}>
            <ListFilter
              color={filterSec ? "#FFA000" : isLight ? "#000" : "#fff"}
              opacity={0.8}
              size={24}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 全面改成三元運算子 ? : null 防止崩潰 */}
        {filterSec ? (
          <View
            style={{
              paddingHorizontal: 20,
              paddingVertical: 16,
              gap: 12,
            }}
          >
            <View style={{ flexDirection: "column", gap: 24 }}>
              <View>
                <SelectFunc
                  colorScheme={colorScheme}
                  placeholder="選擇申請劇本"
                  options={storyOptions}
                  value={storyName}
                  onValueChange={setStoryName}
                />
              </View>
              <View>
                <SelectFunc
                  colorScheme={colorScheme}
                  placeholder="申請日期排序"
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
              {isFilteredState ? (
                <Btn
                  colorScheme={colorScheme}
                  font="重置篩選"
                  func={handleClearSearch}
                  btnType={0}
                />
              ) : null}
            </View>
          </View>
        ) : null}

        <View style={{ padding: 20 }}>
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#FFA000"
              style={{ marginTop: 40 }}
            />
          ) : searchResults.length === 0 ? (
            <View style={{ alignItems: "center", marginTop: 40 }}>
              <Text style={{ color: "#888", fontSize: 16 }}>
                {allApplicants.length === 0
                  ? "目前沒有任何待審核的申請"
                  : "找不到符合篩選條件的申請"}
              </Text>
            </View>
          ) : (
            searchResults.map((item, index) => {
              const avatar = item.applicantData.photoURL || null;
              const name = item.applicantData.displayName || "匿名使用者";
              const isProcessing = processingId === item.applicantId;

              return (
                <View
                  key={`${item.groupId}-${item.applicantId}-${index}`}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 24,
                  }}
                >
                  <View
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      backgroundColor: "#ccc",
                      overflow: "hidden",
                      marginRight: 12,
                    }}
                  >
                    {avatar ? (
                      <Image
                        source={{ uri: avatar }}
                        style={{ width: "100%", height: "100%" }}
                      />
                    ) : (
                      <View style={localStyles.avatarPlaceholder} />
                    )}
                  </View>

                  <View style={{ flex: 1, justifyContent: "center" }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "bold",
                        color: isLight ? "#000" : "#fff",
                        marginBottom: 4,
                      }}
                    >
                      {name}
                    </Text>
                    <Text
                      style={{ fontSize: 12, color: "#888", marginBottom: 2 }}
                      numberOfLines={1}
                    >
                      申請加入：{item.groupTitle}
                    </Text>
                    <Text style={{ fontSize: 12, color: "#aaa" }}>
                      申請日期：{item.applyDate}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {isProcessing ? (
                      <ActivityIndicator
                        size="small"
                        color="#FFA000"
                        style={{ marginHorizontal: 20 }}
                      />
                    ) : (
                      <>
                        <Pressable
                          onPress={() =>
                            handleProcess(item.groupId, item.applicantId, true)
                          }
                          style={{
                            backgroundColor: "#FFA000",
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 8,
                          }}
                        >
                          <Text
                            style={{
                              color: "#fff",
                              fontWeight: "bold",
                              fontSize: 14,
                            }}
                          >
                            確認
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() =>
                            handleProcess(item.groupId, item.applicantId, false)
                          }
                          style={{
                            backgroundColor: isLight ? "#e0e0e0" : "#333",
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 8,
                          }}
                        >
                          <Text
                            style={{
                              color: isLight ? "#000" : "#fff",
                              fontWeight: "bold",
                              fontSize: 14,
                            }}
                          >
                            刪除
                          </Text>
                        </Pressable>
                      </>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// 修正名稱以防與全域衝突
const localStyles = StyleSheet.create({
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrapper: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: "#fff",
    overflow: "hidden",
    zIndex: 2,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#ccc",
  },
});
