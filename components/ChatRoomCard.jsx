import {
  View,
  Image,
  Text,
} from "react-native";
import { getStyles } from "../utils/styleFormat";

export default function ChatRoomCard({chatRoomId, colorScheme}){
    const styles = getStyles(colorScheme);
    //取該chatRoomId內容（可能另資料庫分支，不在使用者下，全域統一管理）

    //test data
    const chatRoomName = 'Group1';
    const chatRoomImg = null;
    const chatRoomMessage = 'hello';

    return (
        <View style={{width:'100%'}}>
            {chatRoomImg? (
                <Image
                    source={{ uri: chatRoomImg }}
                    style={[styles.avatar, { maxWidth: 72, maxHeight: 72 }]}
                />
            ) : (
                <View
                    style={[styles.emptyAvatar, { maxWidth: 72, maxHeight: 72, backgroundColor:'#C4C4C4' }]}
                >
                </View>
            )}
            <View style={{ justifyContent: "center", gap: 8 }}>
                <Text style={styles.title}>{chatRoomName}</Text>
                <Text style={styles.content4}>{chatRoomMessage? '':chatRoomMessage}</Text>
            </View>
        </View>
    )
}