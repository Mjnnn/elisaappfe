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
import { Audio } from 'expo-av';

// --- IMPORT SERVICE ---
// Hãy đảm bảo đường dẫn này đúng với project của bạn
import chatbotService from '../../../services/chatbotService';

const { width } = Dimensions.get('window');

// --- LẤY API KEY TỪ ENV ---
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
const GROQ_URL = process.env.EXPO_PUBLIC_GROQ_URL || "https://api.groq.com/openai/v1/audio/transcriptions";

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
    recordingError: '#EF4444',
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
    const { topic, levelCode } = route.params || { topic: 'Travel', levelCode: 'A1' };

    // --- STATE ---
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [isAiTyping, setIsAiTyping] = useState(false);

    // State xử lý Voice
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isTranscribing, setIsTranscribing] = useState(false); // Loading khi đang dịch voice sang text
    const [permissionResponse, requestPermission] = Audio.usePermissions();

    const flatListRef = useRef<FlatList>(null);

    // --- INITIALIZATION ---
    useEffect(() => {
        setIsAiTyping(true);
        setTimeout(() => {
            const initialGreeting: IMessage = {
                id: 'init-1',
                text: `Hi there! I'm Elisa. Let's talk about "${topic}".`,
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages([initialGreeting]);
            setIsAiTyping(false);
        }, 1000);
    }, []);

    // ============================================================
    // 1. LOGIC GHI ÂM (AUDIO RECORDING)
    // ============================================================
    async function startRecording() {
        try {
            if (permissionResponse?.status !== 'granted') {
                await requestPermission();
            }
            await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

            // Cấu hình ghi âm
            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(recording);
        } catch (err) {
            Alert.alert("Lỗi", "Không thể truy cập Microphone!");
        }
    }

    async function stopRecording() {
        if (!recording) return;

        setIsTranscribing(true); // Bắt đầu xoay loading
        setRecording(null);

        try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();

            if (uri) {
                // Có file -> Gửi sang Groq xử lý
                await processAudioOnFrontend(uri);
            } else {
                setIsTranscribing(false);
            }
        } catch (error) {
            console.log(error);
            setIsTranscribing(false);
        }
    }

    // ============================================================
    // 2. LOGIC GỌI GROQ API (FRONTEND-SIDE)
    // ============================================================
    const processAudioOnFrontend = async (uri: string) => {
        if (!GROQ_API_KEY) {
            Alert.alert("Config Error", "Thiếu API Key trong file .env");
            setIsTranscribing(false);
            return;
        }

        try {
            const formData = new FormData();
            const fileType = uri.split('.').pop(); // m4a hoặc wav
            const fileName = `recording.${fileType}`;

            formData.append('file', {
                uri: uri,
                name: fileName,
                type: `audio/${fileType}`,
            } as any);

            formData.append('model', 'whisper-large-v3');
            formData.append('response_format', 'json');

            // Gọi API Groq
            const response = await fetch(GROQ_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'multipart/form-data',
                },
                body: formData
            });

            const data = await response.json();

            if (data.text) {
                // Có text -> Gửi text này đi xử lý như chat thường
                await handleSendText(data.text);
            } else {
                Alert.alert("Thử lại", "Không nghe rõ giọng nói.");
            }

        } catch (error) {
            console.log("Groq Error:", error);
            Alert.alert("Lỗi", "Không thể chuyển giọng nói thành văn bản.");
        } finally {
            setIsTranscribing(false);
        }
    };

    // ============================================================
    // 3. LOGIC GỬI TEXT VỀ BACKEND JAVA
    // ============================================================
    const handleSendText = async (textToSend: string = inputText) => {
        const finalContent = textToSend.trim();
        if (!finalContent) return;

        // 3.1 Hiển thị tin nhắn của User ngay lập tức
        const userMsg: IMessage = {
            id: Date.now().toString(),
            text: finalContent,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        if (inputText) setInputText('');
        Keyboard.dismiss();
        setIsAiTyping(true); // Hiển thị AI đang gõ...

        try {
            // 3.2 Chuẩn bị payload JSON gửi server
            console.log("Sending to backend:", { message: finalContent, topic, levelCode });

            // const formData = new FormData();
            // formData.append('message', finalContent);
            // formData.append('topic', topic);
            // formData.append('level', levelCode);

            const payload = {
                message: finalContent,
                topic: topic,
                levelCode: levelCode || 'B1'
            };


            const response = await chatbotService.pushMessageText(payload);

            // Xử lý response từ server (giả sử trả về { ai_response: "..." })
            // Bạn cần check kỹ response.data hay response tùy vào interceptor của bạn
            const data = response.data ? response.data : response;
            const aiText = data.ai_response || data.message || "I didn't get a response.";

            if (aiText) {
                const aiMsg: IMessage = {
                    id: (Date.now() + 1).toString(),
                    text: aiText,
                    sender: 'ai',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, aiMsg]);
            }
        } catch (error) {
            console.log("Backend Error:", error);
            Alert.alert("Lỗi", "Server không phản hồi.");
        } finally {
            setIsAiTyping(false);
        }
    };

    // ============================================================
    // 4. RENDER UI
    // ============================================================
    const handleScrollToEnd = () => {
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 300);
    };

    const renderMessageItem = ({ item }: { item: IMessage }) => {
        const isUser = item.sender === 'user';
        return (
            <Animatable.View animation="fadeInUp" duration={500} style={[styles.messageRow, isUser ? styles.rowUser : styles.rowAi]}>
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
                        <Text style={[styles.messageText, { color: isUser ? THEME.userText : THEME.aiText }]}>{item.text}</Text>
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
                    <View>
                        {/* Loading khi xử lý Voice */}
                        {isTranscribing && (
                            <Animatable.View animation="fadeIn" style={styles.typingRow}>
                                <ActivityIndicator size="small" color={THEME.primary} />
                                <Text style={{ marginLeft: 8, fontSize: 12, color: THEME.textLight, fontStyle: 'italic' }}>Translating voice...</Text>
                            </Animatable.View>
                        )}
                        {/* Loading khi AI trả lời */}
                        {isAiTyping && (
                            <Animatable.View animation="fadeInLeft" style={styles.typingRow}>
                                <View style={styles.avatarContainer}>
                                    <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png' }} style={styles.avatar} />
                                </View>
                                <View style={styles.typingBubble}>
                                    <ActivityIndicator size="small" color={THEME.primary} />
                                </View>
                            </Animatable.View>
                        )}
                        <View style={{ height: 15 }} />
                    </View>
                }
            />

            {/* INPUT AREA */}
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={[styles.floatingInputBar, { marginBottom: Math.max(insets.bottom, 15) }]}>

                    {/* MIC BUTTON */}
                    <Animatable.View animation={recording ? "pulse" : undefined} iterationCount="infinite" duration={1000}>
                        <TouchableOpacity
                            style={styles.micButtonFloating}
                            onPress={recording ? stopRecording : startRecording}
                            disabled={isTranscribing}
                        >
                            <LinearGradient
                                colors={recording ? ['#F87171', '#EF4444'] : (isTranscribing ? ['#E5E7EB', '#D1D5DB'] : ['#EDE9FE', '#DDD6FE'])}
                                start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                                style={styles.micGradient}
                            >
                                {isTranscribing ? (
                                    <ActivityIndicator size="small" color={THEME.textDark} />
                                ) : (
                                    <MaterialCommunityIcons
                                        name={recording ? "stop" : "microphone"}
                                        size={26}
                                        color={recording ? 'white' : THEME.primary}
                                    />
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animatable.View>

                    {/* TEXT INPUT */}
                    <View style={styles.inputFieldContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder={recording ? "Listening..." : (isTranscribing ? "Converting..." : "Type a message...")}
                            placeholderTextColor="#94A3B8"
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            editable={!recording && !isTranscribing}
                        />
                        <TouchableOpacity
                            style={[styles.sendBtnFloating, (!inputText.trim() || isTranscribing) && styles.sendBtnDisabled]}
                            onPress={() => handleSendText()}
                            disabled={!inputText.trim() || isTranscribing}
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

// --- STYLES ---
const styles = StyleSheet.create({
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
        borderRadius: 22, maxWidth: width * 0.78, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4
    },
    bubbleUserShadow: { shadowColor: '#FBCFE8' },
    bubbleAiShadow: { shadowColor: '#BAE6FD' },
    bubbleContent: { paddingHorizontal: 18, paddingVertical: 14, borderRadius: 22 },
    bubbleUser: { borderBottomRightRadius: 4 },
    bubbleAi: { borderBottomLeftRadius: 4 },
    messageText: { fontSize: 16, lineHeight: 24, fontWeight: '500' },
    typingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginLeft: 0 },
    typingBubble: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderRadius: 20, borderBottomLeftRadius: 4, backgroundColor: 'white', elevation: 1 },
    floatingInputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16 },
    micButtonFloating: { marginRight: 12, marginBottom: 2 },
    micGradient: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#A78BFA', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 3 } },
    inputFieldContainer: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', backgroundColor: 'white', borderRadius: 28, padding: 6, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, borderWidth: 1, borderColor: '#F1F5F9' },
    textInput: { flex: 1, fontSize: 16, color: THEME.textDark, paddingHorizontal: 14, paddingVertical: 12, maxHeight: 120 },
    sendBtnFloating: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
    sendBtnDisabled: { opacity: 0.8 },
    sendGradient: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }
});

export default ChatbotScreen;