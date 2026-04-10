import { useColorScheme, Pressable, Text } from "react-native";
import { getStyles } from "../utils/styleFormat";
import { router } from "expo-router";
import { useAppStyles } from "../utils/useAppStyles";

export default function HomeBtn({ path, name }) {
  const { colorScheme, styles, isLight } = useAppStyles();
  return (
    <Pressable
      onPress={() => router.push(path)}
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
