import {
  View,
  useColorScheme,
  FlatList,
  ScrollView,
  ImageBackground,
  Text,
  Pressable,
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
  const [amount, SetAmount] = useState(5);

  let [fontsLoaded] = useFonts({
    "Nobills": require("../../assets/fonts/PostNoBills.ttf"),
    "ChFont": require("../../assets/fonts/ChFont.ttf"),
  });
  if (!fontsLoaded) return null;

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

          <View style={{ width: '100%', paddingHorizontal: 32, gap: 16, marginBottom: 32 }}>
            <SearchFunc colorScheme={colorScheme} data={stories} />
            <MultipleSelectFunc colorScheme={colorScheme} />
            <View style={{width:'100%', flexDirection:'row', justifyContent:'space-between'}}>
              <View style={{width:'47%'}}>
                <SelectFunc colorScheme={colorScheme} placeholder={'人數'} options={optionsPeople}/>
              </View>
              <View style={{width:'47%'}}>
                <SelectFunc colorScheme={colorScheme} placeholder={'難度'} options={optionsLevel}/>
              </View>
            </View>
          </View>

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
              <Btn colorScheme={colorScheme} func={() => SetAmount(amount + 5)} />
            </View>
          </View>
        </ScrollView>
        <Footer page={2} />
      </ImageBackground>
    </SafeAreaView>
  );
}
