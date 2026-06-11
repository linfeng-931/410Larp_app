import {
    View,
    Text,
    ScrollView,
    Platform,
    KeyboardAvoidingView,
} from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Footer from "../../components/Footer";
import { useAppStyles } from "../../utils/useAppStyles";
import { useRef, useState, useEffect } from "react";
import SearchFunc from "../../components/SearchFunc";
import ChatRoomCard from "../../components/ChatRoomCard";
import { subscribeUserData, subscribeUserChatRooms } from "../../utils/authService";
import { stories } from "../../utils/story"; // 💡 記得引入劇本資料庫，這樣搜尋才能比對名字

export default function Chat() {
    const { styles, colorScheme } = useAppStyles();
    const scrollRef = useRef(null);

    const [userProfile, setUserProfile] = useState(null);
    const [myChatRooms, setMyChatRooms] = useState([]);
    
    // 搜尋關鍵字
    const [chatRoomName, SetChatRoomName] = useState('');

    // -- 讀取所有聊天室 -- //
    useEffect(() => {
        const unsubscribeUser = subscribeUserData((data) => {
            setUserProfile(data);
        });
        return () => unsubscribeUser && unsubscribeUser();
    }, []);

    // 聊天室即時監聽
    useEffect(() => {
        if (!userProfile || !userProfile.chatRooms || userProfile.chatRooms.length === 0) {
            setMyChatRooms([]);
            return;
        }

        const unsubscribeRooms = subscribeUserChatRooms(userProfile.chatRooms, (roomsList) => {
            setMyChatRooms(roomsList); // 整串聊天室資料
        });

        return () => unsubscribeRooms();
    }, [userProfile?.chatRooms]);

    const sortedChatRooms = [...myChatRooms].sort((a, b) => {
        const lastMsgA = a.message?.at(-1);
        const timeA = lastMsgA?.time?.toMillis ? lastMsgA.time.toMillis() : 0;

        const lastMsgB = b.message?.at(-1);
        const timeB = lastMsgB?.time?.toMillis ? lastMsgB.time.toMillis() : 0;

        return timeB - timeA;
    });

    const filteredChatRooms = sortedChatRooms.filter((room) => {
        if (!chatRoomName || chatRoomName.trim() === '') return true;
        const foundStory = stories.find(item => item.id === room.storyID);
        const targetTitle = foundStory ? foundStory.title : "未知劇本";
        return targetTitle.toLowerCase().includes(chatRoomName.toLowerCase());
    });

    return (
        <>
            <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
                <Stack.Screen />
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        contentContainerStyle={[styles.container, { gap: 32 }]}
                        showsVerticalScrollIndicator={false}
                        ref={scrollRef}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Header */}
                        <View style={{ width: '100%', gap: 24 }}>
                            <Text style={[styles.title, { width: '100%', paddingHorizontal: 32 }]}>聊天室</Text>
                            <View style={{ width: '100%', paddingHorizontal: 32 }}>
                                <SearchFunc 
                                    colorScheme={colorScheme} 
                                    value={chatRoomName} 
                                    onValueChange={SetChatRoomName} 
                                    defaultValue={'搜尋聊天室名稱...'} 
                                />
                            </View>
                        </View>

                        <View
                            style={{
                                width: "100%",
                                paddingHorizontal: 32,
                                gap: 24,
                            }}
                        >

                            {filteredChatRooms.length > 0 ? (
                                filteredChatRooms.map((room) => (
                                    <ChatRoomCard room={room} key={room.id} userProfile={userProfile} />
                                ))
                            ) : (
                                <Text style={[styles.content4, { textAlign: 'center', justifyContent: 'center' }]}>
                                    {chatRoomName ? "找不到符合的聊天室名稱" : "目前無聊天室"}
                                </Text>
                            )}
                        </View>
                        <View style={{ height: 48 }} />
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>

            <Footer page={3} />
        </>
    );
}