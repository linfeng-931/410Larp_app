import {
  View,
  Text,
  Image,
  useColorScheme,
  ScrollView,
  Alert,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { useRouter } from "expo-router";
import { useRef } from "react";
import Footer from "../../components/Footer";
import {
  UsersRound,
  Shirt,
  SquareStar,
  BookType,
  ClockFading,
} from "lucide-react-native";
import { getStyles } from "../../utils/styleFormat";
import { SafeAreaView } from "react-native-safe-area-context";
import { stories } from "../../utils/story";
import { colors } from "../../utils/colors";

import Header from "../../components/Header";
import Rank from "../../components/Rank";
import Btn from "../../components/Btn";
import Character from "../../components/Character";
import StoriesList from "../../components/StoriesList";
import ScrollTop from "../../components/ScrollTop";
import { useAppStyles } from "../../utils/useAppStyles";
import { useUser } from "../../utils/userContext";

export default function AnItem() {
  const { isGuest } = useUser();
  const { styles, colorScheme } = useAppStyles();
  const scrollRef = useRef(null);

  const { id } = useLocalSearchParams();
  const story = stories.find((s) => s.id === id);

  const router = useRouter();

  const StoryDetail = (
    <View style={{ width: "100%", gap: 16 }}>
      <Text style={[styles.bigTitleNormal, { marginBottom: 8 }]}>
        {story.title}
      </Text>
      <View style={styles.cardTagContainer}>
        {story.tag.map((tag, index) => (
          <Text key={index} style={styles.cardTag}>
            {tag}
          </Text>
        ))}
      </View>
      <Text style={styles.content3}>{story.subtitle}</Text>
      <View style={styles.cardContent}>
        <SquareStar size={18} style={styles.cardIcon} />
        <Rank rank={story.star} styles={styles} />
      </View>
      <View
        style={{
          flexDirection: "row",
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <View style={{ gap: 16 }}>
          <View style={styles.cardContent}>
            <UsersRound size={18} style={styles.cardIcon} />
            {story.people.length === 1 ? (
              <Text style={styles.content1}>{story.people}人</Text>
            ) : (
              <Text style={styles.content1}>
                {story.people[0]}-{story.people[1]}人
              </Text>
            )}
          </View>
          <View style={styles.cardContent}>
            <Shirt size={18} style={styles.cardIcon} />
            <Text style={styles.content1}>{story.cloth}</Text>
          </View>
        </View>
        <View style={{ gap: 16 }}>
          <View style={styles.cardContent}>
            <BookType size={18} style={styles.cardIcon} />
            <Text style={styles.content1}>{story.words}</Text>
          </View>
          <View style={styles.cardContent}>
            <ClockFading size={18} style={styles.cardIcon} />
            <Text style={styles.content1}>{story.time}</Text>
          </View>
        </View>
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.title}>NT$ {story.price} /人</Text>
        <View style={{ width: "70%" }}>
          <Btn
            colorScheme={colorScheme}
            font={"立即預約"}
            func={() => {
              if (!story) {
                console.error("Story data is missing!");
                return;
              }

              if (isGuest) {
                Alert.alert("提示", "請先註冊或登入", [
                  {
                    text: "確定",
                    onPress: () => router.push("/subPage/LogIn"),
                  },
                ]);
                return;
              }

              try {
                router.push({
                  pathname: "/subPage/Reservation",
                  params: {
                    title: story.title || "未知劇本",
                    hour: story.time || "4",
                    people: Array.isArray(story.people)
                      ? story.people.join("-")
                      : story.people,
                    price: story.price?.toString() || "0",
                  },
                });
              } catch (e) {
                console.error("跳轉發生錯誤:", e);
              }
            }}
            btnType={1}
          />
        </View>
      </View>
    </View>
  );

  const StoryContent = (
    <View style={{ width: "100%", gap: 16 }}>
      <Text style={styles.title}>劇本概要</Text>
      <Text style={[styles.content2, { lineHeight: 24 }]}>{story.content}</Text>
    </View>
  );

  const StoryCharactor = (
    <View style={{ width: "100%", gap: 16 }}>
      <Text style={styles.title}>角色簡介</Text>
      <View>
        {story.characters.map((char, index) => (
          <Character
            key={index}
            cover={char.image}
            name={char.name}
            tag={char.charTag}
            styles={styles}
            color={
              colorScheme === "light"
                ? `${colors.color2}26`
                : `${colors.color3}26`
            }
          />
        ))}
      </View>
    </View>
  );

  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ headerShown: false }} />

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          ref={scrollRef}
        >
          <View style={styles.main}>
            <Header styles={styles} font={"劇本檔案櫃"} />
            <View
              style={{
                paddingHorizontal: 32,
                width: "100%",
                gap: 60,
                alignItems: "center",
              }}
            >
              <Image
                source={story.cover}
                style={{
                  borderRadius: 8,
                  width: 251,
                  height: 316,
                  marginTop: 32,
                }}
              />
              {StoryDetail}
              {StoryContent}
              {StoryCharactor}
            </View>
          </View>
          <StoriesList
            currentStories={stories}
            pageStatus={0}
            styles={styles}
            colorScheme={colorScheme}
          />
          <View style={{ height: 16 }}></View>
        </ScrollView>
      </SafeAreaView>
      <ScrollTop scrollRef={scrollRef} styles={styles} />
      <Footer page={2}></Footer>
    </>
  );
}
