import {
  View,
  useColorScheme,
  FlatList,
  ScrollView,
  ImageBackground,
  Text,
} from "react-native";
import { getStyles } from "../../utils/styleFormat";
import { useFonts } from "expo-font";
import { stories } from "../../utils/story";
import Images from "../../assets/images/images";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

import PaginationBar from "../../components/PaginationBar";
import Card from "../../components/Card";
import Btn from "../../components/Btn";
import Footer from "../../components/Footer";
import SearchFunc from "../../components/SearchFunc";
import MultipleSelectFunc from "../../components/MultipleSelectFunc";
import SelectFunc from "../../components/SelectFun";

export default function Library() {
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme);

  /* 狀態控制 */
  const [amount, SetAmount] = useState(5);
  const [storyName, SetStoryName] = useState('');
  const [storyPeople, SetStoryPeople] = useState('');
  const [storyStar, SetStoryStar] = useState('');
  const [storyTag, SetStoryTag] = useState([]);
  const [pageStatus, SetPageStatus] = useState(0);

  /* 文字載入 */
  let [fontsLoaded] = useFonts({
    "Nobills": require("../../assets/fonts/PostNoBills.ttf"),
    "ChFont": require("../../assets/fonts/ChFont.ttf"),
  });
  if (!fontsLoaded) return null;

  /* 下拉選單資料 */
  const optionsPeople = [
    { value: 4, label: '4人' },
    { value: 5, label: '5人' },
    { value: 6, label: '6人' },
    { value: 7, label: '7人' },
    { value: 8, label: '8人' },
    { value: 9, label: '9人' },
    { value: 10, label: '10人以上' },
  ];
  const optionsLevel = [
    { value: 1, label: '★ 1' },
    { value: 2, label: '★ 2' },
    { value: 3, label: '★ 3' },
    { value: 4, label: '★ 4' },
    { value: 5, label: '★ 5' }
  ];

  const [currentStories, SetCurrentStories] = useState([]);

  /* 劇本查詢 */
  const StorySearch = function (stories) {
    const newStories =  stories.filter(item => { 
      const matchName = storyName !== '' ?
        storyName.split('').every(char =>
          item.title.toLowerCase().includes(char.toLowerCase()))
        : true;

      const matchTag = storyTag.length > 0 ?
        storyTag.every(tag => item.tag.includes(tag))
        : true;

      const matchPeople = storyPeople !== '' ?
        item.people === storyPeople
        : true;

      const matchStar = storyStar !== '' ?
        item.star === storyStar
        : true;

      return matchName && matchTag && matchPeople && matchStar;
    });

    const isFilter = storyName !== '' || storyTag.length > 0 || storyPeople !=='' || storyStar !== '';
    if(isFilter){
      SetCurrentStories(newStories);
      SetPageStatus(1);
    }
    else{
      SetCurrentStories([]);
      SetPageStatus(0);
    }
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right']}
    >
      <Stack.Screen
        options={{ headerShown: false }}
      />

      <ImageBackground
        style={styles.container}
        imageStyle={{ opacity: 0.5 }}
        source={Images[colorScheme].Library}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.bigTitle}>劇本檔案櫃</Text>

          {/* 查詢功能 */}
          <View style={{ width: '100%', paddingHorizontal: 32, gap: 16, marginBottom: 32 }}>
            <SearchFunc colorScheme={colorScheme} value={storyName} onValueChange={SetStoryName} />
            <MultipleSelectFunc colorScheme={colorScheme} value={storyTag} onValueChange={SetStoryTag} />
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ width: '47%' }}>
                <SelectFunc colorScheme={colorScheme} placeholder={'人數'} options={optionsPeople} value={storyPeople} onValueChange={SetStoryPeople} />
              </View>
              <View style={{ width: '47%' }}>
                <SelectFunc colorScheme={colorScheme} placeholder={'難度'} options={optionsLevel} value={storyStar} onValueChange={SetStoryStar} />
              </View>
            </View>
            <Btn colorScheme={colorScheme} font={'搜尋'} func={() => StorySearch(stories)} btnType={1} />
            {pageStatus === 1 &&
              <Btn 
                colorScheme={colorScheme} 
                font={'清空搜尋'} 
                func={() => {
                  SetPageStatus(0);
                  SetStoryName('');
                  SetStoryPeople('');
                  SetStoryStar('');
                  SetStoryTag([]);
                  SetCurrentStories([]);
                }} 
                btnType={0} 
              />
            }
          </View>

          {/* 劇本顯示 */}

          {pageStatus === 0 &&
            <>
              <View style={{ gap: 16, alignItems: 'center' }}>
                <Text style={styles.title}>精選劇本</Text>
                <PaginationBar />
              </View>
              <View style={styles.main}>
                <Text style={styles.title}>更多精彩劇本</Text>
                <FlatList
                  data={stories.slice(0, amount)}
                  scrollEnabled={false}
                  renderItem={({ item }) => <Card key={item.id} story={item} colorScheme={colorScheme} horizontal={true} />}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.list}
                  showsHorizontalScrollIndicator={false}
                />
                <View style={{ width: 152 }}>
                  <Btn colorScheme={colorScheme} font={'顯示更多'} func={() => SetAmount(amount + 5)} btnType={0} />
                </View>
              </View>
            </>
          }
          {pageStatus === 1 &&
            <View style={styles.main}>
              <Text style={styles.title}>{currentStories.length}個結果</Text>
              <FlatList
                data={currentStories.slice(0, amount)}
                scrollEnabled={false}
                renderItem={({ item }) => <Card key={item.id} story={item} colorScheme={colorScheme} horizontal={true} />}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                showsHorizontalScrollIndicator={false}
              />
              {currentStories.length > 5 &&
                <View style={{ width: 152 }}>
                  <Btn colorScheme={colorScheme} font={'顯示更多'} func={() => SetAmount(amount + 5)} btnType={0} />
                </View>
              }
            </View>
          }
        </ScrollView>
        <Footer page={2} />
      </ImageBackground>
    </SafeAreaView>
  );
}
