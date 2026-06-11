import { View, Pressable, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { getStyles } from "../utils/styleFormat";
import { FontAwesome } from "@expo/vector-icons";
import { useAppStyles } from "../utils/useAppStyles";

import {
  Home,
  LibraryBig,
  Plus,
  MessageCircleMore,
  Settings,
} from "lucide-react-native";
import { colors } from "../utils/colors";

export default function Footer({ page }) {
  const router = useRouter();
  const { styles, isLight } = useAppStyles();

  return (
    <View style={styles.footer}>
      {page == 1 ? (
        <Home size={24} style={styles.iconBtn} />
      ) : (
        <Pressable
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
          })}
          onPress={() => {
            router.replace("/subPage/Home");
          }}
        >
          <View style={{ width: 32, height: 32, justifyContent: 'center', alignItems: 'center' }}>
            <Home size={24} style={styles.iconBtnDisact} />
          </View>
        </Pressable>
      )}

      {page == 2 ? (
        <LibraryBig size={24} style={styles.iconBtn} />
      ) : (
        <Pressable
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
          })}
          onPress={() => {
            router.push("/subPage/Library");
          }}
        >
          <View style={{ width: 32, height: 32, justifyContent: 'center', alignItems: 'center' }}>
            <LibraryBig style={styles.iconBtnDisact} size={24} />
          </View>
        </Pressable>
      )}

      {page == 3 ? (
        <MessageCircleMore size={24} style={styles.iconBtn} />
      ) : (
        <Pressable
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
          })}
          onPress={() => {
            router.push("/subPage/Chat");
          }}
        >
          <View style={{ width: 32, height: 32, justifyContent: 'center', alignItems: 'center' }}>
            <MessageCircleMore size={24} style={styles.iconBtnDisact} />
          </View>
        </Pressable>
      )}
      {page == 4 ? (
        <Settings size={24} style={styles.iconBtn} />
      ) : (
        <Pressable
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
          })}
          onPress={() => {
            router.push("/subPage/Setting");
          }}
        >
          <View style={{ width: 32, height: 32, justifyContent: 'center', alignItems: 'center' }}>
            <Settings size={24} style={styles.iconBtnDisact} />
          </View>
        </Pressable>
      )}
    </View>
  );
}
