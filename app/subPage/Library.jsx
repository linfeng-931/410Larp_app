import { View, useColorScheme, FlatList} from "react-native";
import { useState } from "react";
import { getStyles } from "../../utils/styleFormat";
import Footer from "../../components/Footer";
import { useFonts } from "expo-font";
import Card from "../../components/Card";
import { stories } from "../../utils/story";


export default function Library() {
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme);

  let [fontsLoaded] = useFonts({
    "no-bills": require("../../assets/fonts/post-no-bills-colombo.extrabold.ttf"),
  });
  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <FlatList
            data={stories}
            horizontal={false}
            renderItem={({item}) => <Card key={item.id} story={item} colorScheme={colorScheme}/>}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsHorizontalScrollIndicator={false}
          />
      </View>

      <Footer page={2} />
    </View>
  );
}
