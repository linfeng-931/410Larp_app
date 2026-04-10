import { View, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { getStyles } from "../utils/styleFormat";
import { colors } from "../utils/colors";
import { useUser } from "../utils/userContext";

export default function SettingCard({ contents, colorScheme, link, type }) {
  const router = useRouter();
  const styles = getStyles(colorScheme);
  const color =
    colorScheme === "light" ? `${colors.color2}26` : `${colors.color3}26`;
  const len = contents.length;
  const { isGuest } = useUser();

  return (
    <View
      style={{
        width: "100%",
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
      <View style={styles.settingCard}>
        {contents.map((content, index) => {
          return (
            <Pressable
              key={index}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
              })}
              onPress={() => {
                if (isGuest && type != 2) {
                  Alert.alert("請先註冊或登入");
                  router.push("/subPage/LogIn");
                  return;
                }

                if (type === 0) router.push(link[index]);
                else if (type === 1) link();
              }}
            >
              <View
                style={{
                  width: "100%",
                  alignItems: "center",
                  borderBottomWidth: index != len - 1 && 1,
                  borderBottomColor: index != len - 1 && color,
                  paddingHorizontal: 10,
                  flexDirection: "row",
                  paddingVertical: 20,
                }}
              >
                {content}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
