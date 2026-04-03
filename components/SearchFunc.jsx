import {
    View,
    TextInput,
} from "react-native";
import { Search } from "lucide-react-native";
import { getStyles } from "../utils/styleFormat";
import { useState } from "react";

export default function SearchFunc({ colorScheme, data}) {
    const styles = getStyles(colorScheme);
    const [content, setContent] = useState('');

    return (
        <View style={styles.searchFrame}>
            <Search style={styles.cardIcon}/>
            <TextInput
                value={content}
                onChangeText={setContent}
                placeholder="劇本名稱"
                placeholderTextColor={`${styles.content3.color}66`}
                style={styles.content1}
            />
        </View>
    )
}
