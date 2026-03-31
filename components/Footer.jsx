import {
  StyleSheet,
  View,
  Image,
  Pressable,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import { styles } from "../utils/styleFormat";
import Images from "../assets/images/images";
import { FontAwesome } from "@expo/vector-icons";
import { Camera, Archive } from "lucide-react-native";

export default function Footer({ page }) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const imageRoute = "../assets/images/" + { colorScheme } + "/";

  return (
    <View style={styles.footer}>
      {/* {page == 1 ? (
        <View style={styles.iconBtn}>
          <Image
            source={require("../assets/images/Vector.png")}
            style={styles.iconBtn}
          />
        </View>
      ) : (
        <Pressable
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
          })}
          onPress={() => {
            router.replace("/");
          }}
        >
          <View style={styles.iconBtnDisact}>
            <Image
              source={Images[colorScheme].Vector}
              style={styles.iconBtnDisact}
            />
          </View>
        </Pressable>
      )}

      {page == 2 ? (
        <View style={styles.iconBtn}>
          <Image
            source={require("../assets/images/Storage.png")}
            style={styles.iconBtn}
          />
        </View>
      ) : (
        <Pressable
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
          })}
          onPress={() => {
            router.push("/subPage/bookMark");
          }}
        >
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Image
              source={Images[colorScheme].Storage}
              style={styles.iconBtnDisact}
            />
          </View>
        </Pressable>
      )}
      <View style={styles.roundedBtn}>
        <Image source={Images[colorScheme].Add} style={styles.iconBtn} />
      </View>

      {page == 3 ? (
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <Image
            source={require("../assets/images/Chat.png")}
            style={styles.iconBtn}
          />
        </View>
      ) : (
        <Pressable
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
          })}
          onPress={() => {
            router.push("/subPage/myBook");
          }}
        >
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Image
              source={Images[colorScheme].Chat}
              style={styles.iconBtnDisact}
            />
          </View>
        </Pressable>
      )}
      {page == 4 ? (
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <Image
            source={require("../assets/images/User.png")}
            style={styles.iconBtn}
          />
        </View>
      ) : (
        <Pressable
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
          })}
          onPress={() => {
            router.push("/subPage/myBook");
          }}
        >
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Image
              source={Images[colorScheme].User}
              style={styles.iconBtnDisact}
            />
          </View>
        </Pressable>
      )} */}
      <FontAwesome name="home" size={24} color="#42A6DE" />
      <Camera color="red" size={48} />
      <Archive color="red" size={48} />
    </View>
  );
}
