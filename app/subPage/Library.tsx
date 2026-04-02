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

export default function Library() {
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme);
  const [amount, SetAmount] = useState(5);

  let [fontsLoaded] = useFonts({
    "Nobills": require("../../assets/fonts/PostNoBills.ttf"),
    "ChFont": require("../../assets/fonts/ChFont.ttf"),
  });
  if (!fontsLoaded) return null;

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
            <View style={{width: 152}}>
              <Btn colorScheme={colorScheme} func={() => SetAmount(amount + 5)}/>
            </View>
          </View>
        </ScrollView>
        <Footer page={2} />
      </ImageBackground>
    </SafeAreaView>
  );
}
