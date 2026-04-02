import { 
  View, 
  useColorScheme, 
  FlatList,
} from "react-native";
import { useState } from "react";
import { getStyles } from "../../utils/styleFormat";
import Footer from "../../components/Footer";
import { useFonts } from "expo-font";
import { stories } from "../../utils/story";
import PaginationBar from "../../components/PaginationBar";

export default function Library() {
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme);

  let [fontsLoaded] = useFonts({
    "no-bills": require("../../assets/fonts/post-no-bills-colombo.extrabold.ttf"),
  });
  if(!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <PaginationBar/>
      <View style={styles.main}>
        
      </View>
      <Footer page={2} />
    </View>
  );
}
