import {
    View,
    Text,
    Pressable,
    ScrollView,
    Platform,
    KeyboardAvoidingView,
} from "react-native";
import { Stack, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";
import Footer from "../../components/Footer";
import { useAppStyles } from "../../utils/useAppStyles";
import { useRef, useState, useEffect } from "react";
import SearchFunc from "../../components/SearchFunc";
import ChatRoomCard from "../../components/ChatRoomCard";
import { useUser } from "../../utils/userContext";
import { subscribeUserData, subscribeUserChatRooms } from "../../utils/authService";


export default function Chat() {
    const { styles, isLight, colorScheme } = useAppStyles();
    const scrollRef = useRef(null);
    const [userProfile, setUserProfile] = useState(null);

    const animationRef = useRef(null);
    const loadingAnimation = require("../../assets/animation/Loading.json");
    const [loading, setLoading] = useState(false);
    const [pageStatus, SetPageStatus] = useState(0);
    const [currentChat, SetCurrentChat] = useState([]);
    const [myChatRooms, setMyChatRooms] = useState([]);
    const [chatRoomName, SetChatRoomName] = useState('');

    // search
    const ChatSearch = function (stories) {
        const newStories = stories.filter(item => {
            const matchName = chatRoomName !== '' ?
                chatRoomName.split('').every(char =>
                    item.title.toLowerCase().includes(char.toLowerCase()))
                : true;
            return matchName;
        });

        const isFilter = chatRoomName !== '';
        if (isFilter) {
            SetCurrentChat(newStories);
            SetPageStatus(1);
        }
        else {
            SetCurrentChat([]);
            SetPageStatus(0);
        }
    };

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

    // 聊天室以時間排序
    const sortedChatRooms = [...myChatRooms].sort((a, b) => {
        const lastMsgA = a.message?.at(-1);
        const timeA = lastMsgA?.time?.toMillis ? lastMsgA.time.toMillis() : 0;

        const lastMsgB = b.message?.at(-1);
        const timeB = lastMsgB?.time?.toMillis ? lastMsgB.time.toMillis() : 0;

        return timeB - timeA;
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
                                <SearchFunc colorScheme={colorScheme} value={chatRoomName} onValueChange={SetChatRoomName} defaultValue={'聊天室名稱'} />
                            </View>
                        </View>
                        <View
                            style={{
                                width: "100%",
                                paddingHorizontal: 32,
                                gap: 24,
                            }}
                        >
                            {sortedChatRooms.length > 0 ? (
                                sortedChatRooms.map((room) => (
                                    <ChatRoomCard room={room} key={room.id} userProfile={userProfile} />
                                ))
                            ) : (
                                <Text style={[styles.content4, { textAlign: 'center', justifyContent: 'center' }]}>目前無聊天室</Text>
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
