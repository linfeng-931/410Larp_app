import {
  View,
  Pressable,
  Text,
  Image,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { getStyles } from "../utils/styleFormat";
import { UsersRound, Shirt, SquareStar } from "lucide-react-native";
import Rank from "./Rank";

export default function Card({ story, colorScheme, horizontal }) {
  const router = useRouter();
  const styles = getStyles(colorScheme);
  const { width } = Dimensions.get('window');

  return (
    <Pressable
      style={({ pressed }) => ({
        opacity: pressed ? 0.5 : 1,
      })}
      onPress={() => {
        router.push({
          pathname : `/story/${story.id}`,
          params: { 
            id : story.id, 
          }
        })
      }}
    >
      <View style={{
        width: width,
        alignItems: 'center',
        // iOS 陰影
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 0 },

        // Android 陰影
        elevation: 5,
      }}>
        {horizontal === false &&
          <View style={styles.card}>
            <Image
              source={story.cover}
              style={styles.bottomCroppedImage}
              resizeMode="cover"
            />
            <View style={styles.cardContentContainer}>
              {story.type === 1 &&
                <Text style={styles.cardTagType}>本月新本</Text>
              }
              {story.type === 2 &&
                <Text style={styles.cardTagType}>城限</Text>
              }
              <Text style={styles.title}>{story.title}</Text>
              <View style={styles.cardTagContainer}>
                {Array.from({ length: story.tag.length }).map((_, index) => {
                  return (
                    <Text key={index} style={styles.cardTag}>{story.tag[index]}</Text>
                  )
                })}
              </View>
              <View style={styles.cardContent}>
                <UsersRound size={18} style={styles.cardIcon} />
                {story.people.length === 1 ?
                  <Text style={styles.content2}>{story.people}人</Text> :
                  <Text style={styles.content2}>{story.people[0]}-{story.people[1]}人</Text>
                }
              </View>
              <View style={styles.cardContent}>
                <Shirt size={18} style={styles.cardIcon} />
                <Text style={styles.content2}>{story.cloth}</Text>
              </View>
              <View style={styles.cardContent}>
                <SquareStar size={18} style={styles.cardIcon} />
                <Rank rank={story.star} styles={styles} />
              </View>
              {story.type === 0 &&
                <Text style={styles.content3}>{story.subtitle}</Text>
              }
            </View>
          </View>
        }
        {horizontal === true &&
          <View style={styles.cardHorizantal}>
            <Image
              source={story.cover}
              style={styles.leftCroppedImage}
              resizeMode="cover"
            />
            {story.type === 1 &&
              <Text style={styles.cardTagTypeHorizantal}>本月新本</Text>
            }
            {story.type === 2 &&
              <Text style={styles.cardTagTypeHorizantal}>城限</Text>
            }
            <View style={styles.cardContentContainerHorizantal}>
              <Text style={styles.title}>{story.title}</Text>
              <View style={styles.cardTagContainer}>
                {Array.from({ length: story.tag.length }).map((_, index) => {
                  return (
                    <Text key={index} style={styles.cardTagHorizantal}>{story.tag[index]}</Text>
                  )
                })}
              </View>
              <View style={styles.cardContent}>
                <UsersRound size={18} style={styles.cardIcon} />
                {story.people.length === 1 ?
                  <Text style={styles.content2}>{story.people}人</Text> :
                  <Text style={styles.content2}>{story.people[0]}-{story.people[1]}人</Text>
                }
              </View>
              <View style={styles.cardContent}>
                <Shirt size={18} style={styles.cardIcon} />
                <Text style={styles.content2}>{story.cloth}</Text>
              </View>
              <View style={styles.cardContent}>
                <SquareStar size={18} style={styles.cardIcon} />
                <Rank rank={story.star} styles={styles} />
              </View>
            </View>
          </View>
        }
      </View>
    </Pressable>
  )
}