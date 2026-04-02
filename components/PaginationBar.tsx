import { 
  View, 
  useColorScheme, 
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { useMemo } from "react";
import { useState } from "react";
import { getStyles } from "../utils/styleFormat";
import Card from "./Card";
import { stories } from "../utils/story";

export default function PaginationBar() {
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme);

  const feature = ["00100", "00101", "00102", "00103", "00104"];
  const featureStories = useMemo(()=>{
    return stories.filter(item => feature.includes(item.id));
  }, [stories]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>)=>{
    const totalWidth = event.nativeEvent.layoutMeasurement.width;
    const xPos = event.nativeEvent.contentOffset.x;
    let current = Math.floor(xPos / totalWidth);
    if(current < 0) current = 0;
    if(current > 4) current = 4;
    setCurrentIndex(current);
  };

  const Pagination = (
    <View style={styles.dotContainer}>
      {Array.from({length: feature.length}).map((_, index)=>{
        if(index === currentIndex){
          return(
            <View key={index} style={styles.dotActive}></View>
          )
        }
        else{
          return(
            <View key={index} style={styles.dot}></View>
          )
        }
      })}
    </View>
  );

  return (
    <View style={styles.scrollBarList}>
      <FlatList
        data={featureStories}
        horizontal
        pagingEnabled
        renderItem={({item}) => <Card key={item.id} story={item} colorScheme={colorScheme} horizontal={false}/>}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
      />
      {Pagination}
    </View>
  );
}
