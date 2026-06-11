import { useColorScheme, Pressable, Text, Alert } from "react-native";
import { getStyles } from "../utils/styleFormat";
import { router } from "expo-router";
import { useAppStyles } from "../utils/useAppStyles";
import { useUser } from "../utils/userContext";

export default function HomeBtn({ path, name }) {
  const { isGuest } = useUser();
  const { colorScheme, styles, isLight } = useAppStyles();
  return (
    <Pressable
      onPress={() => {
        if (isGuest && name == "你的揪團") {
          Alert.alert("提示", "請先註冊或登入", [
            {
              text: "確定",
              onPress: () => router.push("/subPage/LogIn"),
            },
          ]);
          return;
        } else router.push(path);
      }}
      style={({ pressed }) => ({
        justifyContent: "center",
        alignItems: "center",
        padding: 8,
        flex: 1,
        height: 48,
        borderWidth: 1.5,
        borderRadius: 8,
        backgroundColor: pressed ? "#FFA000" : null,
        borderColor: pressed
          ? "#FFA000"
          : isLight
            ? "rgba(0,0,0,0.4)"
            : "rgba(255,255,255,0.4)",
      })}
    >
      <Text style={[styles.content1]}>{name}</Text>
    </Pressable>
  );
}
