import { Text, View } from "react-native";
import { useAppStyles } from "../utils/useAppStyles";

export default function CheckInfo({ title, value }) {
  const { styles } = useAppStyles();
  return (
    <View style={{ gap: 16 }}>
      <Text style={[styles.content1, { opacity: 0.5 }]}>{title}</Text>
      <Text style={styles.title}>{value}</Text>
    </View>
  );
}
