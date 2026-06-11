import {
    View,
    Image,
    Text,
    Pressable,
    Animated,
    TouchableOpacity,
    Alert
} from "react-native";

import { useAppStyles } from "../utils/useAppStyles";
import { formatMessageTime, leaveChatRoom } from "../utils/authService";
import { stories } from "../utils/story";
import { useRouter } from "expo-router";
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { auth } from "../firebase";

export default function ChatRoomCard({ room, userProfile }) {
    const { styles, isLight } = useAppStyles();
    const router = useRouter();

    // 最後讀取時間
    const userLastReadTimestamp = userProfile?.lastRead?.[room.id];
    const userLastReadTime = userLastReadTimestamp?.toMillis
        ? userLastReadTimestamp.toMillis()
        : 0;

    // 計算未讀數量
    let unreadCount = 0;
    if (room.message && Array.isArray(room.message)) {
        unreadCount = room.message.filter((msg) => {
            const msgTime = msg.time?.toMillis ? msg.time.toMillis() : 0;
            return msgTime > userLastReadTime;
        }).length;
    }

    const currentStoryId = room.storyID;
    const foundStory = stories.find(item => item.id === currentStoryId);
    const lastMsgObj = room.message?.at(-1);

    const chatRoomName = foundStory ? foundStory.title : "未知劇本";
    const chatRoomImg = foundStory ? foundStory.cover : null;
    const chatRoomMessage = lastMsgObj?.content || "目前暫無訊息";
    const time = lastMsgObj?.time ? formatMessageTime(lastMsgObj.time) : "";
    const countOfMessage = unreadCount;

    // 處理刪除的邏輯
    const handleDeleteChat = (roomId) => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        Alert.alert(
            "刪除聊天室",
            "確定要刪除這個聊天室嗎？這將會清空您的列表，但不會影響其他成員。",
            [
                { text: "取消", style: "cancel" },
                {
                    text: "刪除",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await leaveChatRoom(roomId, currentUser.uid);
                            // 💡 刪除成功後，Firebase 的 onSnapshot 會自動監聽到資料改變，
                            // 你的聊天室列表畫面就會瞬間「自動消失」這筆資料，不需要手動重整！
                        } catch (error) {
                            Alert.alert("刪除失敗", "發生錯誤，請稍後再試。");
                        }
                    }
                }
            ]
        );
    };

    // 渲染滑動後露出的刪除按鈕
    const renderRightActions = (progress, dragX, roomId) => {
        const scale = dragX.interpolate({
            inputRange: [-80, 0],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        });

        return (
            <TouchableOpacity
                style={{
                    backgroundColor: '#FF3B30',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 80,
                }}
                onPress={() => handleDeleteChat(roomId)}
            >
                <Animated.Text style={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: 14,
                    transform: [{ scale }]
                }}>
                    刪除
                </Animated.Text>
            </TouchableOpacity>
        );
    };

    return (
        <Swipeable
            renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, room.id)}
            overshootRight={false}
        >
            <Pressable
                style={({ pressed }) => [
                    {
                        width: '100%',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        borderBottomColor: isLight ? '#00000022' : '#ffffff3a',
                        borderBottomWidth: 1.5,
                        paddingVertical: 15,
                        backgroundColor: isLight ? '#FFFFFF' : '#121212',
                        paddingHorizontal: 16
                    },
                    {
                        opacity: pressed ? 0.5 : 1,
                    }
                ]}
                onPress={() => {
                    router.push(`/room/${room.id}?name=${encodeURIComponent(chatRoomName)}`);
                }}
            >
                <View style={{ flexDirection: 'row', gap: 32 }}>
                    {chatRoomImg ? (
                        <Image
                            source={chatRoomImg}
                            style={[styles.avatar, { maxWidth: 72, maxHeight: 72 }]}
                        />
                    ) : (
                        <View
                            style={[styles.emptyAvatar, { maxWidth: 72, maxHeight: 72, backgroundColor: '#C4C4C4' }]}
                        />
                    )}
                    <View style={{ justifyContent: "center", gap: 8 }}>
                        <Text style={[styles.title, { maxWidth: 170 }]} numberOfLines={1}>{chatRoomName}</Text>
                        <Text style={{ fontSize: 14, color: isLight ? '#00000079' : '#ffffff79' }} numberOfLines={1}>
                            {chatRoomMessage ? chatRoomMessage : ''}
                        </Text>
                    </View>
                </View>

                <View style={{ justifyContent: "center", gap: 8, alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 10, color: isLight ? '#00000079' : '#ffffff79' }}>{time}</Text>
                    {countOfMessage !== 0 ?
                        <Text style={{ color: '#fff', backgroundColor: '#FFA000', borderRadius: 100, padding: 5, minWidth: 28, height: 28, textAlign: 'center', lineHeight: 17, fontWeight: '600' }}>
                            {countOfMessage}
                        </Text>
                        :
                        <Text style={{ borderRadius: 100, padding: 5, minWidth: 28, height: 28 }}></Text>
                    }
                </View>
            </Pressable>
        </Swipeable>
    )
}