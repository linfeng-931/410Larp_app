import { View, Pressable, Text, Image, Dimensions, Alert } from "react-native";
import { useRouter } from "expo-router";
import { getStyles } from "../utils/styleFormat";
import { Clock4, MapPin, Calendar } from "lucide-react-native";
import { useAppStyles } from "../utils/useAppStyles";
import Rank from "./Rank";
import { stories } from "../utils/story";

export default function Homecard({ story, colorScheme, horizontal }) {
  const { styles, isLight } = useAppStyles();
  const { width } = Dimensions.get("window");

  //console.log(story.title);
  const cover = stories.filter((s) => {
    if (s.title === story.title) return s.cover;
  })[0].cover;

  const totalValue = parseFloat(story.endTimeValue) || 0;
  const hour = Math.floor(totalValue);
  const minute = Math.round((totalValue - hour) * 60);

  const formatEndTime = {
    hour: hour.toString(),
    minute: minute < 10 ? `0${minute}` : minute.toString(),
  };

  return (
    <View
      style={{
        alignItems: "center",
        // iOS 陰影
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 0 },

        // Android 陰影
        elevation: 5,
      }}
    >
      {horizontal === true && (
        <View style={styles.homeCardHorizantal}>
          <Image
            source={cover}
            style={styles.leftCroppedImage}
            resizeMode="cover"
          />
          <View style={styles.cardContentContainerHorizantal}>
            <Text style={styles.title}>{story.title}</Text>
            <View style={styles.cardContent}>
              <Calendar color="#FFA000" size={16} strokeWidth={2.5} />
              <Text style={styles.content2}>{story.date}</Text>
            </View>
            <View style={styles.cardContent}>
              <Clock4 color="#FFA000" size={16} strokeWidth={2.5} />
              <Text style={styles.content2}>
                {story.time} - {formatEndTime.hour}:{formatEndTime.minute}
              </Text>
            </View>
            <View style={styles.cardContent}>
              <MapPin color="#FFA000" size={16} strokeWidth={2.5} />
              <Text style={[styles.content2, { width: "80%" }]}>
                {story.address}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
