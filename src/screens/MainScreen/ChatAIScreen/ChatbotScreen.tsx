import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    FlatList, KeyboardAvoidingView, Platform, StatusBar,
    Dimensions, Keyboard, Alert, ActivityIndicator
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Audio } from 'expo-av'; // [NEW] Import Audio

// [NEW] Import Service gọi API (Đảm bảo đường dẫn file này đúng trong dự án của bạn)
import chatbotService from '../../../services/chatbotService';

const { width } = Dimensions.get('window');

// --- THEME COLORS ---
const THEME = {
    primary: '#8B5CF6',
    headerGradient: ['#C4B5FD', '#F9A8D4'] as const,
    bgGradient: ['#FFFFFF', '#F3F4F6'] as const,
    userGradient: ['#FFEDD5', '#FBCFE8'] as const,
    userText: '#5F370E',
    aiGradient: ['#FFFFFF', '#E0F2FE'] as const,
    aiText: '#334155',
    white: '#FFFFFF',
    textDark: '#1E293B',
    textLight: '#64748B',
    recordingError: '#EF4444', // Màu đỏ cho trạng thái ghi âm
};

// --- TYPES ---
interface IMessage {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    isTranslated?: boolean;
}

const ChatbotScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const insets = useSafeAreaInsets();

    // Lấy params từ màn hình trước (mặc định nếu không có)
    const { topic, levelCode } = route.params || { topic: 'Travel', levelCode: 'A1' };

    // --- STATE ---
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [isAiTyping, setIsAiTyping] = useState(false);

    // [NEW] State cho ghi âm
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [permissionResponse, requestPermission] = Audio.usePermissions();

    const flatListRef = useRef<FlatList>(null);

    // --- INITIALIZATION ---
    useEffect(() => {
        // Tin nhắn chào mừng ban đầu
        setIsAiTyping(true);
        setTimeout(() => {
            const initialGreeting: IMessage = {
                id: 'init-1',
                text: `Hi there! I'm Elisa. Let's talk about "${topic}". Press the mic to start!`,
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages([initialGreeting]);
            setIsAiTyping(false);
        }, 1000);
    }, []);

    // --- AUDIO LOGIC (TỪ BACKEND CODE CỦA BẠN) ---

    // 1. Bắt đầu ghi âm
    async function startRecording() {
        try {
            if (permissionResponse?.status !== 'granted') {
                console.log('Requesting permission..');
                await requestPermission();
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            console.log('Starting recording..');
            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(recording);
            console.log('Recording started');
        } catch (err) {
            console.log('Failed to start recording', err);
            Alert.alert("Error", "Cannot access microphone!");
        }
    }

    // 2. Dừng ghi âm và Gửi lên Server
    async function stopRecording() {
        console.log('Stopping recording..');
        if (!recording) return;

        setIsAiTyping(true); // Hiển thị trạng thái loading/typing ngay khi dừng nói
        setRecording(null);

        try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            console.log('Recording stopped and stored at', uri);

            if (uri) {
                await sendAudioToBackend(uri);
            } else {
                setIsAiTyping(false);
            }
        } catch (error) {
            console.error(error);
            setIsAiTyping(false);
        }
    }

    // 3. Gửi Audio (Logic chính)
    const sendAudioToBackend = async (uri: string) => {
        const formData = new FormData();
        const fileType = uri.split('.').pop();

        // Append file đúng chuẩn React Native
        formData.append('audio', {
            uri: uri,
            name: `recording.${fileType}`,
            type: `audio/${fileType}`,
        } as any);

        // Gửi kèm Topic
        formData.append('topic', topic);

        try {
            // [CALL API]
            console.log("Sending to server...");
            const response = await chatbotService.pushMessage(formData);

            // Giả sử response trả về: { data: { user_text: "...", ai_response: "..." } }
            // Lưu ý: Kiểm tra lại cấu trúc response thực tế của bạn (response.data hay response trực tiếp)
            const { user_text, ai_response } = response.data ? response.data : response;

            // [UPDATE UI]
            const newMessages: IMessage[] = [];

            // 1. Thêm tin nhắn của User (Text từ giọng nói)
            if (user_text) {
                newMessages.push({
                    id: Date.now().toString(),
                    text: user_text,
                    sender: 'user',
                    timestamp: new Date()
                });
            }

            // 2. Thêm tin nhắn của AI
            if (ai_response) {
                newMessages.push({
                    id: (Date.now() + 1).toString(),
                    text: ai_response,
                    sender: 'ai',
                    timestamp: new Date()
                });
            }

            setMessages(prev => [...prev, ...newMessages]);

        } catch (error) {
            console.error("Error sending audio:", error);
            Alert.alert("Lỗi kết nối", "Không thể gửi giọng nói lên server.");
        } finally {
            setIsAiTyping(false);
        }
    };

    // --- XỬ LÝ GỬI TIN NHẮN TEXT (Giả lập hoặc cần API text riêng) ---
    const handleSendText = () => {
        if (!inputText.trim()) return;

        // Thêm tin nhắn user ngay lập tức
        const userMsg: IMessage = {
            id: Date.now().toString(),
            text: inputText.trim(),
            sender: 'user',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        Keyboard.dismiss();
        setIsAiTyping(true);

        // Tạm thời: Logic Text chưa có API trong đoạn code bạn gửi
        // Nên ở đây ta giả lập AI trả lời, hoặc bạn cần bổ sung API pushMessageText
        setTimeout(() => {
            const aiResponse: IMessage = {
                id: (Date.now() + 1).toString(),
                text: "I received your text. Currently I'm optimized for Voice Chat, please try the microphone!",
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiResponse]);
            setIsAiTyping(false);
        }, 1500);
    };

    const handleScrollToEnd = () => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 300);
    };

    // --- RENDER MESSAGE ITEM ---
    const renderMessageItem = ({ item }: { item: IMessage }) => {
        const isUser = item.sender === 'user';
        return (
            <Animatable.View
                animation="fadeInUp"
                duration={500}
                style={[styles.messageRow, isUser ? styles.rowUser : styles.rowAi]}
            >
                {!isUser && (
                    <View style={styles.avatarContainer}>
                        <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png' }} style={styles.avatar} contentFit="cover" />
                    </View>
                )}
                <View style={[styles.bubbleShadow, isUser ? styles.bubbleUserShadow : styles.bubbleAiShadow]}>
                    <LinearGradient
                        colors={isUser ? THEME.userGradient : THEME.aiGradient}
                        start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
                        style={[styles.bubbleContent, isUser ? styles.bubbleUser : styles.bubbleAi]}
                    >
                        <Text style={[styles.messageText, { color: isUser ? THEME.userText : THEME.aiText }]}>
                            {item.text}
                        </Text>
                    </LinearGradient>
                </View>
            </Animatable.View>
        );
    };

    return (
        <View style={{ flex: 1 }}>
            <StatusBar barStyle="dark-content" />
            <LinearGradient colors={THEME.bgGradient} style={StyleSheet.absoluteFill} />

            {/* HEADER */}
            <LinearGradient colors={THEME.headerGradient} style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtnBg}>
                    <Ionicons name="chevron-back" size={24} color={THEME.textDark} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Topic: {topic}</Text>
                    <View style={styles.onlineBadge}>
                        <View style={[styles.onlineDot, recording && { backgroundColor: 'red' }]} />
                        <Text style={styles.onlineText}>{recording ? 'Recording...' : 'Online'}</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.iconBtnBg}>
                    <Ionicons name="settings-outline" size={22} color={THEME.textDark} />
                </TouchableOpacity>
            </LinearGradient>

            {/* CHAT LIST */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessageItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                onContentSizeChange={handleScrollToEnd}
                ListFooterComponent={
                    isAiTyping ? (
                        <Animatable.View animation="fadeInLeft" style={styles.typingRow}>
                            <View style={styles.avatarContainer}>
                                <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png' }} style={styles.avatar} />
                            </View>
                            <View style={styles.typingBubble}>
                                <ActivityIndicator size="small" color={THEME.primary} />
                                <Text style={{ marginLeft: 8, fontSize: 12, color: '#999' }}>Processing...</Text>
                            </View>
                        </Animatable.View>
                    ) : <View style={{ height: 15 }} />
                }
            />

            {/* INPUT AREA */}
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={[styles.floatingInputBar, { marginBottom: Math.max(insets.bottom, 15) }]}>

                    {/* [UPDATED] MIC BUTTON - XỬ LÝ LOGIC GHI ÂM */}
                    <Animatable.View animation={recording ? "pulse" : undefined} iterationCount="infinite" duration={1000}>
                        <TouchableOpacity
                            style={styles.micButtonFloating}
                            onPress={recording ? stopRecording : startRecording} // Toggle logic
                        >
                            <LinearGradient
                                // Đổi màu khi đang ghi âm (Đỏ/Hồng đậm) vs Bình thường (Tím nhạt)
                                colors={recording ? ['#F87171', '#EF4444'] : ['#EDE9FE', '#DDD6FE']}
                                start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                                style={styles.micGradient}
                            >
                                <MaterialCommunityIcons
                                    name={recording ? "stop" : "microphone"} // Đổi icon
                                    size={26}
                                    color={recording ? 'white' : THEME.primary}
                                />
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animatable.View>

                    <View style={styles.inputFieldContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder={recording ? "Listening..." : "Nhập tin nhắn..."}
                            placeholderTextColor="#94A3B8"
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            editable={!recording} // Khóa nhập text khi đang ghi âm
                        />
                        <TouchableOpacity
                            style={[styles.sendBtnFloating, !inputText.trim() && styles.sendBtnDisabled]}
                            onPress={handleSendText}
                            disabled={!inputText.trim()}
                        >
                            <LinearGradient
                                colors={inputText.trim() ? ['#A78BFA', '#C084FC'] : ['#E2E8F0', '#F1F5F9']}
                                start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
                                style={styles.sendGradient}
                            >
                                <Ionicons name="send" size={20} color={inputText.trim() ? 'white' : '#94A3B8'} style={{ marginLeft: 2 }} />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

// ... (Giữ nguyên phần Styles của file cũ, không thay đổi gì)
const styles = StyleSheet.create({
    // ... Copy y nguyên phần styles từ code cũ của bạn vào đây ...
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingBottom: 15,
        borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
        elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 4 }
    },
    iconBtnBg: { padding: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.4)' },
    headerCenter: { alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '800', color: THEME.textDark },
    onlineBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.5)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginTop: 4 },
    onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#34D399', marginRight: 6 },
    onlineText: { fontSize: 12, color: THEME.textDark, fontWeight: '600' },

    listContent: { paddingHorizontal: 16, paddingTop: 25 },
    messageRow: { marginVertical: 10, flexDirection: 'row', alignItems: 'flex-end', maxWidth: '100%' },
    rowUser: { justifyContent: 'flex-end', alignSelf: 'flex-end' },
    rowAi: { justifyContent: 'flex-start', alignSelf: 'flex-start' },
    avatarContainer: { marginRight: 8, marginBottom: 4 },
    avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'white', borderWidth: 1, borderColor: '#E2E8F0' },

    bubbleShadow: {
        borderRadius: 22,
        maxWidth: width * 0.78,
        elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4
    },
    bubbleUserShadow: { shadowColor: '#FBCFE8' },
    bubbleAiShadow: { shadowColor: '#BAE6FD' },

    bubbleContent: { paddingHorizontal: 18, paddingVertical: 14, borderRadius: 22 },
    bubbleUser: { borderBottomRightRadius: 4 },
    bubbleAi: { borderBottomLeftRadius: 4 },

    messageText: { fontSize: 16, lineHeight: 24, fontWeight: '500' },

    typingRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 20, marginLeft: 0 },
    typingBubble: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16,
        borderRadius: 20, borderBottomLeftRadius: 4, backgroundColor: 'white', elevation: 1
    },

    floatingInputBar: {
        flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16,
    },
    micButtonFloating: { marginRight: 12, marginBottom: 2 },
    micGradient: {
        width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center',
        elevation: 4, shadowColor: '#A78BFA', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 3 }
    },
    inputFieldContainer: {
        flex: 1, flexDirection: 'row', alignItems: 'flex-end',
        backgroundColor: 'white', borderRadius: 28, padding: 6,
        elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 },
        borderWidth: 1, borderColor: '#F1F5F9'
    },
    textInput: {
        flex: 1, fontSize: 16, color: THEME.textDark, paddingHorizontal: 14, paddingVertical: 12, maxHeight: 120
    },
    sendBtnFloating: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
    sendBtnDisabled: { opacity: 0.8 },
    sendGradient: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }
});

export default ChatbotScreen;