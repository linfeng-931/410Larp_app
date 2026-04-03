import {
    View,
    Text,
    Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft} from "lucide-react-native";

export default function Header({ styles, font }) {
    const router = useRouter();

    return (

        <View style={styles.header}>
            <Pressable
                style={({ pressed }) => ({
                    opacity: pressed ? 0.5 : styles.cardIcon.opacity,
                    alignItems: 'flex-start',
                    width: '30%',
                })}
                onPress={() => {
                    router.back()
                }}
            >
                <ChevronLeft size={24} style={styles.cardIcon} />
            </Pressable>
            <Text style={[styles.title, {alignItems: 'center', textAlign: 'center', width: '30%'}]}>{font}</Text>
            <View style={{alignItems: 'flex-end', width: '30%',}}></View>
        </View>

    );
}