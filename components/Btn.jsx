import {
    View,
    Pressable,
    Text,
} from "react-native";
import { colors } from "../utils/colors";

export default function Btn({ colorScheme, func }) {
    const isLight = colorScheme === 'light';
    const primaryColor = isLight ? colors.color3 : colors.color2;
    const oppositeColor = isLight ? colors.color2 : colors.color3;

    return (
        <Pressable
            style={({ pressed }) => ({
                height: 42,
                width: "100%",
                backgroundColor: pressed ? colors.color1 : primaryColor,
                borderColor: pressed ? colors.color1 : colors.color3,
                borderWidth: 1,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                // iOS 陰影
                shadowColor: "#000",
                shadowOpacity: 0.15,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 0 },
                
                // Android 陰影
                elevation: 5,
            })}
            onPress={func}
        >
            {({ pressed }) => (
                <Text style={{
                    color: pressed ? primaryColor : oppositeColor,
                }}>
                    顯示更多
                </Text>
            )}
        </Pressable>
    )
}