import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    FlatList, KeyboardAvoidingView, Platform, StatusBar,
    Dimensions, Keyboard, Alert, ActivityIndicator, Modal, Pressable
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

// --- IMPORT SERVICE ---
import chatbotService from '../../../services/chatbotService';
import { EnglishCheckMessageResponse, EnglishChatbotResponse } from '../../../types/response/ChatbotResponse';

const { width, height } = Dimensions.get('window');

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
    scoreHigh: '#10B981',
    scoreMedium: '#F59E0B',
    scoreLow: '#EF4444',
    accent: '#F472B6'
};

interface IMessage {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    type?: 'text' | 'grammar';
    grammarData?: EnglishCheckMessageResponse;
    vietnameseTranslation?: string;
    showTranslation?: boolean;
}

const ChatbotScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const insets = useSafeAreaInsets();
    const { topic, levelCode } = route.params || { topic: 'Travel', levelCode: 'B1' };

    const [messages, setMessages] = useState<IMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [isAiTyping, setIsAiTyping] = useState(false);
    const [loadingText, setLoadingText] = useState('');
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [permissionResponse, requestPermission] = Audio.usePermissions();
    const [speakingId, setSpeakingId] = useState<string | null>(null);
    const [isGuideVisible, setIsGuideVisible] = useState(false); // --- THÊM MỚI: State cho Modal ---

    const flatListRef = useRef<FlatList>(null);

    const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
    const GROQ_URL = process.env.EXPO_PUBLIC_GROQ_URL || "https://api.groq.com/openai/v1/audio/transcriptions";

    useEffect(() => {
        setIsAiTyping(true);
        setTimeout(() => {
            const initialGreeting: IMessage = {
                id: 'init-1',
                text: `Hi there! I'm Elisa. Let's talk about "${topic}".`,
                vietnameseTranslation: `Xin chào! Mình là Elisa. Hãy cùng nói về "${topic}" nhé.`,
                sender: 'ai',
                timestamp: new Date(),
                type: 'text'
            };
            setMessages([initialGreeting]);
            setIsAiTyping(false);
        }, 1000);

        return () => { Speech.stop(); };
    }, []);

    const handleSpeak = (text: string, msgId: string) => {
        Speech.stop();
        if (speakingId === msgId) {
            setSpeakingId(null);
            return;
        }
        setSpeakingId(msgId);
        Speech.speak(text, {
            language: 'en-US',
            pitch: 1.0,
            rate: 0.85,
            onDone: () => setSpeakingId(null),
            onError: () => setSpeakingId(null),
        });
    };

    async function startRecording() {
        try {
            if (permissionResponse?.status !== 'granted') await requestPermission();
            await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
            const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            setRecording(recording);
        } catch (err) { Alert.alert("Lỗi", "Không thể truy cập Microphone!"); }
    }

    async function stopRecording() {
        if (!recording) return;
        setIsTranscribing(true);
        setRecording(null);
        try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            if (uri) await processAudioOnFrontend(uri);
            else setIsTranscribing(false);
        } catch (error) { setIsTranscribing(false); }
    }

    const processAudioOnFrontend = async (uri: string) => {
        if (!GROQ_API_KEY) { setIsTranscribing(false); return; }
        try {
            const formData = new FormData();
            const fileType = uri.split('.').pop();
            formData.append('file', { uri: uri, name: `recording.${fileType}`, type: `audio/${fileType}` } as any);
            formData.append('model', 'whisper-large-v3');
            const response = await fetch(GROQ_URL, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'multipart/form-data' },
                body: formData
            });
            const data = await response.json();
            if (data.text) await handleSendText(data.text);
        } catch (error) { console.log(error); } finally { setIsTranscribing(false); }
    };

    const handleSendText = async (textToSend: string = inputText) => {
        const finalContent = textToSend.trim();
        if (!finalContent) return;

        const userMsg: IMessage = { id: Date.now().toString(), text: finalContent, sender: 'user', timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        Keyboard.dismiss();

        const payload = { message: finalContent, topic: topic, levelCode: levelCode || 'B1' };

        try {
            setIsAiTyping(true);
            setLoadingText('Checking grammar...');
            const grammarResponse = await chatbotService.checkGrammarMessage(payload);
            const grammarData = (grammarResponse.data ? grammarResponse.data : grammarResponse) as EnglishCheckMessageResponse;

            const grammarMsg: IMessage = {
                id: 'grammar-' + Date.now(),
                text: grammarData.editedSentence,
                sender: 'ai',
                timestamp: new Date(),
                type: 'grammar',
                grammarData: grammarData
            };
            setMessages(prev => [...prev, grammarMsg]);

            setLoadingText('Elisa is thinking...');
            const chatResponse = await chatbotService.pushMessageText(payload);
            const chatData = (chatResponse.data ? chatResponse.data : chatResponse) as EnglishChatbotResponse;

            if (chatData.answerChatbot) {
                const aiMsg: IMessage = {
                    id: 'chat-' + Date.now(),
                    text: chatData.answerChatbot,
                    sender: 'ai',
                    timestamp: new Date(),
                    type: 'text',
                    vietnameseTranslation: chatData.answerVietnamese,
                    showTranslation: false
                };
                setMessages(prev => [...prev, aiMsg]);
            }
        } catch (error) { Alert.alert("Lỗi", "Hệ thống đang bận."); }
        finally { setIsAiTyping(false); setLoadingText(''); }
    };

    const toggleTranslate = (msgId: string) => {
        setMessages(prev => prev.map(msg => ({
            ...msg,
            showTranslation: msg.id === msgId ? !msg.showTranslation : msg.showTranslation
        })));
    };

    const handleScrollToEnd = () => {
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 300);
    };

    // --- RENDER MODAL HƯỚNG DẪN ---
    const renderGuideModal = () => (
        <Modal
            transparent
            visible={isGuideVisible}
            animationType="fade"
            onRequestClose={() => setIsGuideVisible(false)}
        >
            <Pressable style={styles.modalOverlay} onPress={() => setIsGuideVisible(false)}>
                <Animatable.View
                    animation="zoomIn"
                    duration={400}
                    style={styles.modalContent}
                >
                    <LinearGradient colors={['#FFFFFF', '#F5F3FF']} style={styles.modalGradient}>
                        <View style={styles.modalHeader}>
                            <View style={styles.guideIconCircle}>
                                <Ionicons name="bulb" size={30} color={THEME.white} />
                            </View>
                            <Text style={styles.modalTitle}>Hướng dẫn trò chuyện</Text>
                        </View>

                        <View style={styles.guideList}>
                            <Animatable.View animation="fadeInLeft" delay={300} style={styles.guideItem}>
                                <View style={[styles.stepNumber, { backgroundColor: '#8B5CF6' }]}><Text style={styles.stepText}>1</Text></View>
                                <Text style={styles.guideText}>
                                    <Text style={{ fontWeight: 'bold', color: THEME.primary }}>Chỉ dùng Tiếng Anh: </Text>
                                    Hãy sử dụng tiếng Anh để giao tiếp và nâng cao năng lực của mình nhé!
                                </Text>
                            </Animatable.View>

                            <Animatable.View animation="fadeInLeft" delay={500} style={styles.guideItem}>
                                <View style={[styles.stepNumber, { backgroundColor: '#EC4899' }]}><Text style={styles.stepText}>2</Text></View>
                                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={styles.guideText}>
                                        Ấn vào nút <MaterialCommunityIcons name="translate" size={18} color="#EC4899" /> để có thể xem nghĩa tiếng Việt của câu.
                                    </Text>
                                </View>
                            </Animatable.View>

                            <Animatable.View animation="fadeInLeft" delay={700} style={styles.guideItem}>
                                <View style={[styles.stepNumber, { backgroundColor: '#3B82F6' }]}><Text style={styles.stepText}>3</Text></View>
                                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={styles.guideText}>
                                        Nhấn vào loa <Ionicons name="volume-high" size={18} color="#3B82F6" /> để nghe Elisa phát âm mẫu cực chuẩn.
                                    </Text>
                                </View>
                            </Animatable.View>
                        </View>

                        <TouchableOpacity
                            style={styles.closeModalBtn}
                            onPress={() => setIsGuideVisible(false)}
                        >
                            <LinearGradient colors={THEME.headerGradient} style={styles.btnGradient}>
                                <Text style={styles.closeBtnText}>Đã hiểu! Bắt đầu thôi</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </LinearGradient>
                </Animatable.View>
            </Pressable>
        </Modal>
    );

    const renderMessageItem = ({ item }: { item: IMessage }) => {
        const isUser = item.sender === 'user';
        const isSpeaking = speakingId === item.id;

        if (item.type === 'grammar' && item.grammarData) {
            const { score, editedSentence, hintText, originalSentence } = item.grammarData;
            const color = score >= 9 ? THEME.scoreHigh : (score >= 6 ? THEME.scoreMedium : THEME.scoreLow);

            return (
                <Animatable.View animation="fadeInLeft" duration={600} style={[styles.messageRow, styles.rowAi]}>
                    <View style={styles.avatarContainer}>
                        <View style={[styles.avatar, { backgroundColor: '#FEF3C7', borderColor: '#FCD34D', alignItems: 'center', justifyContent: 'center' }]}>
                            <Ionicons name="school" size={18} color="#D97706" />
                        </View>
                    </View>
                    <View style={styles.correctionCard}>
                        <View style={styles.scoreHeader}>
                            <Text style={styles.correctionTitle}>Grammar Check</Text>
                            <View style={[styles.scoreBadge, { backgroundColor: color }]}>
                                <Text style={styles.scoreText}>{score.toFixed(1)}/10</Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        {originalSentence.trim().toLowerCase() !== editedSentence.trim().toLowerCase() ? (
                            <View>
                                <Text style={styles.textOld}>{originalSentence}</Text>
                                <View style={{ alignItems: 'center', marginVertical: 4 }}>
                                    <Ionicons name="arrow-down" size={16} color="#94A3B8" />
                                </View>
                                <Text style={styles.textNew}>{editedSentence}</Text>
                            </View>
                        ) : (
                            <Text style={[styles.textNew, { color: THEME.scoreHigh, textAlign: 'center' }]}>Perfect Sentence!</Text>
                        )}
                        <View style={styles.aiToolRow}>
                            <TouchableOpacity onPress={() => handleSpeak(editedSentence, item.id)}>
                                <Ionicons name={isSpeaking ? "volume-high" : "volume-high-outline"} size={18} color={isSpeaking ? THEME.primary : THEME.textLight} />
                            </TouchableOpacity>
                        </View>
                        {hintText && (
                            <View style={styles.hintBox}>
                                <Ionicons name="bulb" size={16} color="#D97706" style={{ marginTop: 2 }} />
                                <Text style={styles.hintText}>{hintText}</Text>
                            </View>
                        )}
                    </View>
                </Animatable.View>
            );
        }

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
                        style={[styles.bubbleContent, isUser ? styles.bubbleUser : styles.bubbleAi]}
                    >
                        <Text style={[styles.messageText, { color: isUser ? THEME.userText : THEME.aiText }]}>{item.text}</Text>
                        {!isUser && (
                            <View>
                                {item.showTranslation && (
                                    <View style={styles.translationBox}>
                                        <Text style={styles.translationText}>{item.vietnameseTranslation}</Text>
                                    </View>
                                )}
                                <View style={styles.aiToolRow}>
                                    <TouchableOpacity style={styles.aiToolBtn} onPress={() => toggleTranslate(item.id)}>
                                        <MaterialCommunityIcons name="translate" size={16} color={item.showTranslation ? THEME.primary : THEME.textLight} />
                                    </TouchableOpacity>
                                    <View style={styles.dividerVertical} />
                                    <TouchableOpacity style={styles.aiToolBtn} onPress={() => handleSpeak(item.text, item.id)}>
                                        <Ionicons name={isSpeaking ? "volume-high" : "volume-high-outline"} size={18} color={isSpeaking ? THEME.primary : THEME.textLight} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </LinearGradient>
                </View>
            </Animatable.View>
        );
    };

    return (
        <View style={{ flex: 1 }}>
            <StatusBar barStyle="dark-content" />
            <LinearGradient colors={THEME.bgGradient} style={StyleSheet.absoluteFill} />
            <LinearGradient colors={THEME.headerGradient} style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtnBg}><Ionicons name="chevron-back" size={24} color={THEME.textDark} /></TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Topic: {topic}</Text>
                    <View style={styles.onlineBadge}><View style={[styles.onlineDot, recording && { backgroundColor: 'red' }]} /><Text style={styles.onlineText}>{recording ? 'Recording...' : 'Online'}</Text></View>
                </View>
                {/* --- CẬP NHẬT: OnPress để mở Modal --- */}
                <TouchableOpacity
                    style={styles.iconBtnBg}
                    onPress={() => setIsGuideVisible(true)}
                >
                    <Ionicons name="settings-outline" size={22} color={THEME.textDark} />
                </TouchableOpacity>
            </LinearGradient>

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessageItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                onContentSizeChange={handleScrollToEnd}
                ListFooterComponent={
                    <View>
                        {(isTranscribing || isAiTyping) && (
                            <Animatable.View animation="fadeIn" style={styles.typingRow}>
                                <ActivityIndicator size="small" color={THEME.primary} />
                                <Text style={styles.loadingText}>{isTranscribing ? 'Translating voice...' : loadingText}</Text>
                            </Animatable.View>
                        )}
                        <View style={{ height: 15 }} />
                    </View>
                }
            />

            {renderGuideModal()}

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={[styles.floatingInputBar, { marginBottom: Math.max(insets.bottom, 15) }]}>
                    <TouchableOpacity style={styles.micButtonFloating} onPress={recording ? stopRecording : startRecording}>
                        <LinearGradient colors={recording ? ['#F87171', '#EF4444'] : ['#EDE9FE', '#DDD6FE']} style={styles.micGradient}>
                            {isTranscribing ? <ActivityIndicator size="small" color={THEME.textDark} /> : <MaterialCommunityIcons name={recording ? "stop" : "microphone"} size={26} color={recording ? 'white' : THEME.primary} />}
                        </LinearGradient>
                    </TouchableOpacity>
                    <View style={styles.inputFieldContainer}>
                        <TextInput style={styles.textInput} placeholder="Type a message..." value={inputText} onChangeText={setInputText} multiline />
                        <TouchableOpacity style={[styles.sendBtnFloating, !inputText.trim() && styles.sendBtnDisabled]} onPress={() => handleSendText()} disabled={!inputText.trim()}>
                            <LinearGradient colors={inputText.trim() ? ['#A78BFA', '#C084FC'] : ['#E2E8F0', '#F1F5F9']} style={styles.sendGradient}><Ionicons name="send" size={20} color={inputText.trim() ? 'white' : '#94A3B8'} /></LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    // ... Giữ nguyên các style cũ ...
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 15, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, elevation: 4 },
    iconBtnBg: { padding: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.4)' },
    headerCenter: { alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '800', color: THEME.textDark },
    onlineBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.5)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginTop: 4 },
    onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#34D399', marginRight: 6 },
    onlineText: { fontSize: 12, color: THEME.textDark, fontWeight: '600' },
    listContent: { paddingHorizontal: 16, paddingTop: 25 },
    messageRow: { marginVertical: 10, flexDirection: 'row', alignItems: 'flex-end' },
    rowUser: { justifyContent: 'flex-end', alignSelf: 'flex-end' },
    rowAi: { justifyContent: 'flex-start', alignSelf: 'flex-start' },
    avatarContainer: { marginRight: 8, marginBottom: 4 },
    avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'white', borderWidth: 1, borderColor: '#E2E8F0' },
    bubbleShadow: { borderRadius: 22, maxWidth: width * 0.78, elevation: 2 },
    bubbleContent: { paddingHorizontal: 18, paddingVertical: 14, borderRadius: 22 },
    bubbleUser: { borderBottomRightRadius: 4 },
    bubbleAi: { borderBottomLeftRadius: 4 },
    messageText: { fontSize: 16, lineHeight: 24, fontWeight: '500' },
    typingRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 16, marginBottom: 10 },
    loadingText: { marginLeft: 8, fontSize: 12, color: THEME.textLight, fontStyle: 'italic' },
    floatingInputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16 },
    micButtonFloating: { marginRight: 12, marginBottom: 2 },
    micGradient: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
    inputFieldContainer: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', backgroundColor: 'white', borderRadius: 28, padding: 6, borderWidth: 1, borderColor: '#F1F5F9' },
    textInput: { flex: 1, fontSize: 16, color: THEME.textDark, paddingHorizontal: 14, paddingVertical: 12, maxHeight: 120 },
    sendBtnFloating: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
    sendBtnDisabled: { opacity: 0.8 },
    sendGradient: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
    translationBox: { marginTop: 8, padding: 8, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 8, borderLeftWidth: 2, borderLeftColor: THEME.primary },
    translationText: { fontSize: 14, color: THEME.textDark, fontStyle: 'italic' },
    aiToolRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, justifyContent: 'flex-end' },
    aiToolBtn: { padding: 4 },
    dividerVertical: { width: 1, height: 14, backgroundColor: '#CBD5E1', marginHorizontal: 8 },
    correctionCard: { width: width * 0.75, borderRadius: 16, backgroundColor: 'white', borderWidth: 1, borderColor: '#E2E8F0', padding: 12 },
    scoreHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    correctionTitle: { fontSize: 13, fontWeight: '700', color: '#64748B' },
    scoreBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    scoreText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 8 },
    textOld: { fontSize: 15, color: '#EF4444', textDecorationLine: 'line-through', opacity: 0.7 },
    textNew: { fontSize: 16, color: '#10B981', fontWeight: '600' },
    hintBox: { marginTop: 10, flexDirection: 'row', backgroundColor: '#FFFBEB', padding: 8, borderRadius: 6 },
    hintText: { flex: 1, fontSize: 13, color: '#D97706', marginLeft: 6, fontStyle: 'italic' },
    bubbleUserShadow: { shadowColor: '#FBCFE8' },
    bubbleAiShadow: { shadowColor: '#BAE6FD' },

    // --- MỚI: Modal Styles ---
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: width * 0.85, borderRadius: 30, overflow: 'hidden', elevation: 20 },
    modalGradient: { padding: 25, alignItems: 'center' },
    modalHeader: { alignItems: 'center', marginBottom: 20 },
    guideIconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#8B5CF6', justifyContent: 'center', alignItems: 'center', marginBottom: 12, shadowColor: "#8B5CF6", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    modalTitle: { fontSize: 22, fontWeight: '800', color: THEME.textDark },
    guideList: { width: '100%', marginBottom: 25 },
    guideItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 18 },
    stepNumber: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 2 },
    stepText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
    guideText: { flex: 1, fontSize: 15, color: THEME.aiText, lineHeight: 22 },
    closeModalBtn: { width: '100%', borderRadius: 15, overflow: 'hidden' },
    btnGradient: { paddingVertical: 14, alignItems: 'center' },
    closeBtnText: { color: 'white', fontWeight: '700', fontSize: 16 }
});

export default ChatbotScreen;