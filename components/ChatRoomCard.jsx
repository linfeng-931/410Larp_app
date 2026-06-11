import {
    View,
    Image,
    Text,
    Pressable,
} from "react-native";

import { useAppStyles } from "../utils/useAppStyles";
import { formatMessageTime } from "../utils/authService";
import { stories } from "../utils/story";
import { useRouter } from "expo-router";

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

    return (
        <Pressable
            style={({ pressed }) => [
                {
                    width: '100%',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    borderBottomColor: isLight ? '#00000022' : '#ffffff3a',
                    borderBottomWidth: 1.5,
                    paddingVertical: 15,
                },
                {
                    opacity: pressed ? 0.5 : 1,
                }
            ]}
            onPress={async () => {
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
                    >
                    </View>
                )}
                <View style={{ justifyContent: "center", gap: 8 }}>
                    <Text style={[styles.title, {maxWidth:170}]}>{chatRoomName}</Text>
                    <Text style={{fontSize: 14, color: isLight ? '#00000079' : '#ffffff79'}}>{chatRoomMessage ? chatRoomMessage : ''}</Text>
                </View>
            </View>
            <View style={{ justifyContent: "center", gap: 8, alignItems: 'flex-end' }}>
                <Text style={{fontSize: 10, color: isLight ? '#00000079' : '#ffffff79'}}>{time}</Text>
                {countOfMessage != 0 ?
                    <Text style={{ color: '#fff', backgroundColor: '#FFA000', borderRadius: 100, padding: 5, minWidth: 28, height: 28, textAlign: 'center', lineHeight: 17, fontWeight: 600 }}>{countOfMessage}</Text>:
                    <Text style={{ borderRadius: 100, padding: 5, minWidth: 28, height: 28}}></Text>
                }
            </View>
        </Pressable>
    )
}