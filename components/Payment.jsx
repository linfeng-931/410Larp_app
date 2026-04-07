import { View, Text, Pressable } from "react-native";
import { ScanLine, QrCode } from "lucide-react-native";
import { useAppStyles } from "../utils/useAppStyles";

export default function Payment() {
  const { styles, isLight } = useAppStyles();

  return (
    <View
      style={{
        width: "100%",
        height: 128,
        padding: 8,
        borderWidth: 1,
        borderRadius: 8,
        borderColor: isLight ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
          width: "100%",
          height: "100%",
          padding: 8,
          paddingHorizontal: 16,
          borderRadius: 8,
          backgroundColor: isLight
            ? "rgba(255,160,0,0.2)"
            : "rgba(255,160,0,0.4)",
        }}
      >
        <Pressable
          style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
        >
          <ScanLine color="#FFA000" size={36} strokeWidth={1.5} />
          <Text style={styles.content6}>掃碼</Text>
        </Pressable>
        <View
          style={{
            width: 1,
            height: "100%",
            opacity: 0.5,
            backgroundColor: isLight ? "#000" : "#fff",
          }}
        />
        <Pressable
          style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
        >
          <QrCode color="#FFA000" size={36} strokeWidth={1.5} />
          <Text style={styles.content6}>付款碼</Text>
        </Pressable>
      </View>
    </View>
  );
}
