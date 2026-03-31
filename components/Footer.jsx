import {
  View,
  Pressable,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import { getStyles } from "../utils/styleFormat";
import { FontAwesome } from "@expo/vector-icons";
import { Camera, Archive, Plus, MessageCircleMore, Settings} from "lucide-react-native";
import { colors } from "../utils/colors";

export default function Footer({ page }) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme);

  return (
    <View style={styles.footer}>
      {page == 1 ? (
        <FontAwesome name="home" size={24} style={styles.iconBtn} />
      ) : (
        <Pressable
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
          })}
          onPress={() => {
            router.replace("/");
          }}
        >
          <FontAwesome name="home" size={24} style={styles.iconBtnDisact} />
        </Pressable>
      )}

      {page == 2 ? (
        <Archive style={styles.iconBtn} size={24}/>
      ) : (
        <Pressable
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
          })}
          onPress={() => {
            router.push("/subPage/bookMark");
          }}
        >
          <Archive style={styles.iconBtnDisact} size={24}/>
        </Pressable>
      )}
      
      <View style={styles.roundedBtn}>
        <Plus size={24} style={styles.iconOfRoundedBtn}/>
      </View>

      {page == 3 ? (
        <MessageCircleMore size={24} style={styles.iconBtn}/>
      ) : (
        <Pressable
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
          })}
          onPress={() => {
            router.push("/subPage/myBook");
          }}
        >
          <MessageCircleMore size={24} style={styles.iconBtnDisact}/>
        </Pressable>
      )}
      {page == 4 ? (
        <Settings size={24} style={styles.iconBtn}/>
      ) : (
        <Pressable
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
          })}
          onPress={() => {
            router.push("/subPage/myBook");
          }}
        >
          <Settings size={24} style={styles.iconBtnDisact}/>
        </Pressable>
      )}
    </View>
  );
}
