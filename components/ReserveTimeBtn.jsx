import { useColorScheme, Pressable, Text } from "react-native";
import { getStyles } from "../utils/styleFormat";
import { router } from "expo-router";
import { useAppStyles } from "../utils/useAppStyles";

export default function ReserveTimeBtn({
  name,
  onPress,
  disabled,
  selected,
  pressed,
}) {
  const { colorScheme, styles, isLight } = useAppStyles();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        justifyContent: "center",
        alignItems: "center",
        padding: 8,
        height: 48,
        borderWidth: 1.5,
        borderRadius: 8,
        backgroundColor: selected || pressed ? "#FFA000" : "transparent",
        borderColor:
          selected || pressed
            ? "#FFA000"
            : isLight
              ? "rgba(0,0,0,0.4)"
              : "rgba(255,255,255,0.4)",
        width: 120,
        opacity: disabled ? 0.5 : 1,
      })}
      disabled={disabled}
    >
      <Text
        style={[
          styles.content1,
          { color: selected || pressed ? "#fff" : isLight ? "#000" : "#fff" },
        ]}
      >
        {name}
      </Text>
    </Pressable>
  );
}
