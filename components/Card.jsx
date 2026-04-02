import {
  View,
  Pressable,
  Text,
  Image,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { getStyles } from "../utils/styleFormat";
import { UsersRound, Shirt, SquareStar} from "lucide-react-native";
import Rank from "./Rank";

export default function Card({ story, colorScheme }) {
  const router = useRouter();
  const styles = getStyles(colorScheme);
  const { width } = Dimensions.get('window');

  return (
    <Pressable
      style={({ pressed }) => ({
        opacity: pressed ? 0.5 : 1,
      })}
      onPress={() => {
        router.replace("/");
      }}
    >
      <View style={{
        width: width, 
        alignItems: 'center',
        // iOS 陰影
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 4,
        shadowOffset:{width: 0, height: 0},
        
        // Android 陰影
        elevation: 5, 
      }}>
        <View style={styles.card}>
            <Image 
                source = {story.cover}
                style = {styles.bottomCroppedImage}
                resizeMode="cover"
            />
            <View style={styles.cardContentContainer}>
                <Text style={styles.title}>{story.title}</Text>
                <View style={styles.cardTagContainer}>
                    {Array.from({length: story.tag.length}).map((_, index)=>{
                        return(
                            <Text key={index} style={styles.cardTag}>{story.tag[index]}</Text>
                        )
                    })}
                </View>
                <View style={styles.cardContent}>
                    <UsersRound size={18} style={styles.cardIcon}/>
                    <Text style={styles.content2}>{story.people}人</Text>
                </View>
                <View style={styles.cardContent}>
                    <Shirt size={18} style={styles.cardIcon}/>
                    <Text style={styles.content2}>{story.cloth}</Text>
                </View>
                <View style={styles.cardContent}>
                    <SquareStar size={18} style={styles.cardIcon}/>
                    <Rank rank={story.star} styles={styles}/>
                </View>
                <Text style={styles.content3}>{story.subtitle}</Text>
            </View>
        </View>
      </View>
    </Pressable>
  )}