import {
    View,
    Text,
    FlatList,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ActivityIndicator,
    Image
} from "react-native";
import { useLocalSearchParams, Stack, useFocusEffect } from "expo-router";
import { useRef, useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../../firebase";
import LottieView from 'lottie-react-native';
import Header from "../../components/Header";
import { useAppStyles } from "../../utils/useAppStyles";
import { SendHorizontal } from 'lucide-react-native';
import { subscribeSingleChatRoom, sendChatMessage, formatMessageTime, fetchChatRoomMembersProfile, updateRoomLastRead } from "../../utils/authService";

export default function AnRoom() {
    const { styles, isLight } = useAppStyles();
    const scrollRef = useRef(null);

    const animationRef = useRef(null);
    const loadingAnimation = require("../../assets/animation/Loading.json");
    const [loading, setLoading] = useState(true);

    const { id, name } = useLocalSearchParams();

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');

    const [members, setMembers] = useState({});

    // 發送狀態與錯誤處理
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);

    const currentUser = auth.currentUser;

    // 監聽聊天室訊息變動
    useEffect(() => {
        if (!id) return;

        const unsubscribe = subscribeSingleChatRoom(id, (fetchedMessages) => {
            setMessages(fetchedMessages);
        });

        return () => unsubscribe && unsubscribe();
    }, [id]);

    // 發送訊息
    const handleSend = async () => {
        if (inputText.trim() === '' || !id || !currentUser || sending) return;

        const messageText = inputText;
        try {
            setSending(true);
            setError(null);
            setInputText('');

            await sendChatMessage(id, currentUser.uid, messageText);
        } catch (err) {
            console.error("發送訊息失敗:", err);
            setError("訊息發送失敗，請稍後再試");
            setInputText(messageText);
        } finally {
            setSending(false);
        }
    };

    // user資料
    useEffect(() => {
        const getMembersData = async () => {
            if (!id) return;

            try {
                setLoading(true);
                const profilesMap = await fetchChatRoomMembersProfile(id);
                setMembers(profilesMap);
            } catch (error) {
                console.error("載入成員資料失敗:", error);
            } finally {
                setLoading(false);
            }
        };
        getMembersData();
    }, [id]);

    useFocusEffect(
        useCallback(() => {
            return () => {
                if (id && currentUser?.uid) {
                    console.log("使用者離開聊天室，更新最後讀取時間:", id);
                    updateRoomLastRead(currentUser.uid, id).catch((err) => {
                        console.error("離開時更新讀取時間失敗:", err);
                    });
                }
            };
        }, [id, currentUser?.uid])
    );

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollToEnd({ animated: true });
        }
    };


    if (loading) {
        return (
            <SafeAreaView style={[styles.safeArea, {
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: isLight ? '#fff' : '#121212'
            }]}>
                <Stack.Screen options={{ headerShown: false }} />
                <ActivityIndicator size="large" color="#FFA000" />
                <Text style={{
                    marginTop: 12,
                    color: isLight ? '#999' : '#888',
                    fontSize: 14
                }}>
                    載入成員中...
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { flex: 1 }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={{ width: '100%', marginBottom: 20, backgroundColor: isLight ? '#fff' : '#000' }}>
                <Header styles={styles} font={name || "聊天室"} />
            </View>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <View style={{ flex: 1, width: '100%' }}>

                    {/* 訊息對話列表 */}
                    <FlatList
                        ref={scrollRef}
                        data={messages}
                        onContentSizeChange={scrollToBottom}
                        onLayout={scrollToBottom}
                        keyExtractor={(item, index) => index.toString()}
                        contentContainerStyle={{ paddingBottom: 16, flexGrow: 1 }}
                        showsVerticalScrollIndicator={false}
                        style={{ backgroundColor: isLight ? '#F8F8F8' : '#2C2C2C', width: '100%', flex: 1 }}

                        // ani
                        ListFooterComponent={() => (
                            <View style={{ paddingHorizontal: 24 }}>
                                {sending && (
                                    <View key="sending-container" style={{ flexDirection: 'row', marginVertical: 4, alignSelf: 'flex-end' }}>
                                        <LottieView
                                            ref={animationRef}
                                            source={loadingAnimation}
                                            autoPlay
                                            loop
                                            style={{ width: 60, height: 40 }}
                                        />
                                    </View>
                                )}
                                {error && (
                                    <Text style={{ color: 'red', textAlign: 'center', marginVertical: 8 }}>
                                        {error}
                                    </Text>
                                )}
                            </View>
                        )}

                        // 氣泡渲染
                        renderItem={({ item, index }) => {
                            const isUser = item.user === currentUser?.uid;
                            const bubbleColor = isUser ? '#FFA000' : (isLight ? '#ffffffff' : '#ffffff2b');
                            const sendTime = formatMessageTime(item.time);
                            const userImgStr = members[item.user]?.photoURL;

                            return (
                                <View
                                    key={index}
                                    style={{
                                        marginVertical: 8,
                                        marginHorizontal: 16,
                                        alignSelf: isUser ? "flex-end" : "flex-start",
                                        position: 'relative',
                                        maxWidth: '75%',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 10
                                    }}
                                >
                                    {!isUser && (
                                        userImgStr ? (
                                            <Image
                                                source={{ uri: userImgStr }}
                                                style={[styles.avatar, { maxWidth: 42, maxHeight: 42 }]}
                                            />
                                        ) : (
                                            <View
                                                style={[styles.emptyAvatar, { maxWidth: 42, maxHeight: 42, backgroundColor: '#C4C4C4' }]}
                                            />
                                        )
                                    )}
                                    <View>
                                        <View style={{
                                            backgroundColor: bubbleColor,
                                            paddingHorizontal: 16,
                                            paddingVertical: 12,
                                            borderWidth: isLight ? 1 : 0,
                                            borderColor: '#dfdfdfff',
                                            zIndex: 2,
                                            borderTopLeftRadius: 18,
                                            borderTopRightRadius: 18,
                                            borderBottomRightRadius: isUser ? 4 : 18,
                                            borderBottomLeftRadius: isUser ? 18 : 4,
                                        }}>
                                            <Text style={{
                                                color: isUser ? '#fff' : (isLight ? '#000' : '#fff'),
                                                fontSize: 16,
                                                lineHeight: 22
                                            }}>
                                                {item.content}
                                            </Text>
                                        </View>
                                        <Text style={{ textAlign: isUser ? 'right' : 'left', fontSize: 10, color: isLight ? '#00000079' : '#ffffff79' }}>{sendTime}</Text>
                                    </View>

                                    {isUser && (
                                        userImgStr ? (
                                            <Image
                                                source={{ uri: userImgStr }}
                                                style={[styles.avatar, { maxWidth: 42, maxHeight: 42 }]}
                                            />
                                        ) : (
                                            <View
                                                style={[styles.emptyAvatar, { maxWidth: 42, maxHeight: 42, backgroundColor: '#C4C4C4' }]}
                                            />
                                        )
                                    )}
                                </View>
                            );
                        }}
                    />

                    {/* 底部輸入欄 */}
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 10,
                        paddingHorizontal: 24,
                        paddingVertical: 10,
                        borderTopWidth: 1,
                        borderColor: isLight ? '#eee' : '#222',
                        backgroundColor: isLight ? '#fff' : '#121212'
                    }}>
                        <TextInput
                            value={inputText}
                            onChangeText={setInputText}
                            onFocus={() => {
                                setTimeout(scrollToBottom, 200);
                            }}
                            placeholder="請輸入訊息..."
                            placeholderTextColor={isLight ? '#999' : '#666'}
                            style={{
                                borderWidth: 1,
                                borderColor: isLight ? '#e1e1e1ff' : '#444',
                                padding: 14,
                                borderRadius: 100,
                                flex: 1,
                                color: isLight ? '#000' : '#fff',
                                backgroundColor: isLight ? '#fff' : '#1e1e1e'
                            }}
                        />
                        <Pressable
                            style={({ pressed }) => ({
                                opacity: pressed ? 0.5 : 1,
                            })}
                            onPress={handleSend}
                            disabled={sending || !inputText.trim()}
                        >
                            <View style={{
                                backgroundColor: (sending || !inputText.trim()) ? '#ffa2004b' : '#FFA000',
                                borderRadius: 100,
                                height: 45,
                                width: 45,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {sending ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <SendHorizontal color='#fff' size={20} />
                                )}
                            </View>
                        </Pressable>
                    </View>

                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}