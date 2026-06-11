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
import { useRef, useState } from "react";
import SearchFunc from "../../components/SearchFunc";
import ChatRoomCard from "../../components/ChatRoomCard";

export default function Chat() {
    const { styles, isLight, colorScheme } = useAppStyles();
    const scrollRef = useRef(null);

    const animationRef = useRef(null);
    const loadingAnimation = require("../../assets/animation/Loading.json");
    const [loading, setLoading] = useState(false);
    const [pageStatus, SetPageStatus] = useState(0);
    const [currentChat, SetCurrentChat] = useState([]);
    const [chatRoomName, SetChatRoomName] = useState('');

    //search
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
                        <View style={{width:'100%', gap:24}}>
                            <Text style={[styles.title,{width:'100%', paddingHorizontal: 32}]}>聊天室</Text>
                            <View style={{ width: '100%', paddingHorizontal: 32}}>
                                <SearchFunc colorScheme={colorScheme} value={chatRoomName} onValueChange={SetChatRoomName} defaultValue={'聊天室名稱'}/>
                            </View>
                        </View>
                        <View
                            style={{
                                width: "100%",
                                paddingHorizontal: 32,
                                gap: 24,
                            }}
                        >
                        <ChatRoomCard colorScheme={colorScheme}/>
                        
                        </View>
                        <View style={{ height: 48 }} />
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>

            <Footer page={3} />
        </>
    );
}
