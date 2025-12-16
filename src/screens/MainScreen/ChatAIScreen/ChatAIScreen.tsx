import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    Modal, ActivityIndicator, Dimensions, StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";

// --- SERVICE IMPORT ---
import conversationTopicsService from '../../../services/conversationTopicsService';
import { EnglishConversationTopicsResponse } from '../../../types/response/EnglishConversationTopicsResponse';
import userProgressService from '../../../services/userProgressService';

const { width } = Dimensions.get('window');

// --- CONSTANTS ---
// Cấu hình Icon & Màu cho 10 chủ đề (Dựa trên ID)
const TOPIC_THEMES: Record<number, { icon: string; colors: readonly [string, string] }> = {
    1: { icon: 'card-account-details-star-outline', colors: ['#4FACFE', '#00F2FE'] },
    2: { icon: 'clock-time-four-outline', colors: ['#FF9A9E', '#FECFEF'] },
    3: { icon: 'school-outline', colors: ['#a1c4fd', '#c2e9fb'] },
    4: { icon: 'airplane-takeoff', colors: ['#667eea', '#764ba2'] },
    5: { icon: 'shopping-outline', colors: ['#ff9a9e', '#fecfef'] },
    6: { icon: 'silverware-fork-knife', colors: ['#F6D365', '#FDA085'] },
    7: { icon: 'heart-pulse', colors: ['#fa709a', '#fee140'] },
    8: { icon: 'briefcase-variant-outline', colors: ['#434343', '#000000'] },
    9: { icon: 'account-group-outline', colors: ['#8EC5FC', '#E0C3FC'] },
    10: { icon: 'robot-happy-outline', colors: ['#0BA360', '#3CBA92'] },
};

const DEFAULT_THEME = { icon: 'chat-processing-outline', colors: ['#6366F1', '#8B5CF6'] as const };

const LEVELS = [
    { code: 'A1', label: 'Beginner', color: '#10B981', desc: 'Mới bắt đầu' },
    { code: 'A2', label: 'Elementary', color: '#34D399', desc: 'Cơ bản' },
    { code: 'B1', label: 'Intermediate', color: '#F59E0B', desc: 'Trung cấp' },
    { code: 'B2', label: 'Upper Inter', color: '#F97316', desc: 'Trên trung cấp' },
    { code: 'C1', label: 'Advanced', color: '#EF4444', desc: 'Cao cấp' },
    { code: 'C2', label: 'Proficient', color: '#B91C1C', desc: 'Thành thạo' },
];

// --- THEME COLORS (Cyan Theme) ---
const THEME = {
    primary: '#0891B2',
    light: '#CFFAFE',
    dark: '#155E75',
    bg: '#FFFFFF',
    white: '#FFFFFF',
    text: '#164E63',
    subText: '#64748B',
    danger: '#EF4444',
    success: '#10B981',
    warningBg: '#FEF2F2',
    warningBorder: '#FECACA',
    warningText: '#B91C1C',
    inputBorder: '#E2E8F0',
    inputBg: '#F8FAFC'
};

const ChatAIScreen = () => {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();

    // --- STATE ---
    const [topics, setTopics] = useState<EnglishConversationTopicsResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [suggestedLevel, setSuggestedLevel] = useState<string | null>(null); // [NEW] State lưu gợi ý

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState<EnglishConversationTopicsResponse | null>(null);

    // --- FETCH DATA ---
    useEffect(() => {
        fetchTopics();
        fetchUserProgress(); // [NEW] Gọi hàm lấy tiến độ
    }, []);

    const fetchTopics = async () => {
        try {
            setLoading(true);
            const res = await conversationTopicsService.getAllTopics();
            if (res && res.data) {
                setTopics(res.data);
            }
        } catch (error) {
            console.log("Lỗi lấy danh sách chủ đề:", error);
        } finally {
            setLoading(false);
        }
    };

    // [NEW] Logic lấy tiến độ và tính toán level gợi ý
    const fetchUserProgress = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            const res = await userProgressService.getUserProgressByUserId(Number(userId));

            if (res && res.data) {
                const lessonId = res.data.lessonId;
                let level = 'A1';

                // Logic so sánh lessonId theo yêu cầu
                if (lessonId >= 1 && lessonId <= 7) {
                    level = 'A1'; // 1-7 & 8-15
                } else if (lessonId >= 8 && lessonId <= 15) {
                    level = 'A2';
                } else if (lessonId >= 16 && lessonId <= 22) {
                    level = 'B1';
                } else if (lessonId >= 23 && lessonId <= 30) {
                    level = 'C1';
                } else if (lessonId >= 31 && lessonId <= 37) {
                    level = 'C2';
                } else if (lessonId >= 38 && lessonId <= 45) {
                    level = 'C2'; // Mặc định max
                }

                setSuggestedLevel(level);
            }
        } catch (error) {
            console.log("Không lấy được tiến độ người dùng:", error);
        }
    };

    // --- HANDLERS ---
    const handleTopicPress = (topic: EnglishConversationTopicsResponse) => {
        setSelectedTopic(topic);
        setModalVisible(true);
    };

    const handleLevelSelect = (levelCode: string) => {
        setModalVisible(false);
        if (!selectedTopic) return;

        // Navigate sang màn hình Chat
        console.log(`Start chat: ${selectedTopic.titleEnglish} - Level ${levelCode}`);
        navigation.navigate('StartConversation', {
            topicId: selectedTopic.topicId,
            levelCode: levelCode
        });
    };

    // --- RENDER ITEMS ---
    const renderTopicItem = ({ item, index }: { item: EnglishConversationTopicsResponse, index: number }) => {
        const theme = TOPIC_THEMES[item.topicId] || DEFAULT_THEME;

        return (
            <Animatable.View
                animation="fadeInUp"
                duration={600}
                delay={index * 100}
                style={styles.cardContainer}
            >
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => handleTopicPress(item)}
                    style={styles.cardTouchable}
                >
                    <LinearGradient
                        colors={theme.colors}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={styles.cardGradient}
                    >
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons name={theme.icon as any} size={28} color="white" />
                        </View>

                        <View style={styles.textContainer}>
                            <Text style={styles.cardTitleEnglish} numberOfLines={1}>{item.titleEnglish}</Text>
                            <Text style={styles.cardTitleTopics} numberOfLines={1}>{item.titleTopics}</Text>
                            <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                        </View>

                        <View style={styles.decorativeCircle} />
                    </LinearGradient>
                </TouchableOpacity>
            </Animatable.View>
        );
    };

    const modalTheme = selectedTopic ? (TOPIC_THEMES[selectedTopic.topicId] || DEFAULT_THEME) : DEFAULT_THEME;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* --- HEADER --- */}
            <LinearGradient
                colors={['#4F46E5', '#7C3AED']}
                style={[styles.header, { paddingTop: insets.top }]}
            >
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>AI Conversation</Text>
                        <Text style={styles.headerSubtitle}>Luyện nói tiếng Anh cùng Elisa</Text>
                    </View>
                    <View style={styles.robotIconBg}>
                        <MaterialCommunityIcons name="robot-excited-outline" size={28} color="#4F46E5" />
                    </View>
                </View>
            </LinearGradient>

            {/* --- BODY --- */}
            <View style={styles.body}>
                <Text style={styles.sectionTitle}>Chọn chủ đề hội thoại</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 50 }} />
                ) : (
                    <FlatList
                        data={topics}
                        renderItem={renderTopicItem}
                        keyExtractor={(item) => item.topicId.toString()}
                        numColumns={2}
                        columnWrapperStyle={styles.columnWrapper}
                        contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

            {/* --- MODAL CHỌN LEVEL --- */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <Animatable.View
                        animation="slideInUp"
                        duration={400}
                        style={styles.modalContent}
                    >
                        <View style={styles.modalHeaderIndicator}>
                            <View style={styles.indicatorBar} />
                        </View>

                        {/* Selected Topic Info */}
                        {selectedTopic && (
                            <View style={styles.selectedTopicContainer}>
                                <LinearGradient
                                    colors={modalTheme.colors}
                                    style={styles.selectedTopicIconWrapper}
                                >
                                    <MaterialCommunityIcons name={modalTheme.icon as any} size={28} color="white" />
                                </LinearGradient>
                                <View style={{ marginLeft: 15, flex: 1 }}>
                                    <Text style={styles.modalTopicLabel}>Chủ đề đang chọn:</Text>
                                    <Text style={styles.modalTopicTitle}>{selectedTopic.titleEnglish}</Text>
                                    <Text style={styles.modalTopicSub}>{selectedTopic.titleTopics}</Text>
                                </View>
                                <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 5 }}>
                                    <Ionicons name="close-circle" size={30} color="#94A3B8" />
                                </TouchableOpacity>
                            </View>
                        )}

                        <Text style={styles.modalInstruction}>Chọn cấp độ phù hợp:</Text>

                        {/* Levels Grid */}
                        <View style={styles.levelsGrid}>
                            {LEVELS.map((level, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.levelBtn, { borderColor: level.color }]}
                                    onPress={() => handleLevelSelect(level.code)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.levelBadge, { backgroundColor: level.color }]}>
                                        <Text style={styles.levelCode}>{level.code}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.levelLabel, { color: level.color }]}>{level.label}</Text>
                                        <Text style={styles.levelDesc}>{level.desc}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* [NEW] UI Gợi ý cấp độ - Hiển thị phía dưới danh sách level */}
                        {suggestedLevel && (
                            <Animatable.View animation="bounceIn" delay={200} style={styles.suggestionContainer}>
                                <View style={styles.suggestionIconBox}>
                                    <MaterialCommunityIcons name="star-face" size={24} color={THEME.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.suggestionTitle}>Gợi ý từ Elisa</Text>
                                    <Text style={styles.suggestionText}>
                                        Dựa trên tiến độ học tập, trình độ <Text style={{ fontWeight: 'bold', color: THEME.primary }}>{suggestedLevel}</Text> phù hợp nhất với bạn lúc này.
                                    </Text>
                                </View>
                            </Animatable.View>
                        )}

                    </Animatable.View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },

    // Header
    header: {
        paddingBottom: 25, paddingHorizontal: 20,
        borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
        elevation: 8, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8
    },
    headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFF' },
    headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
    robotIconBg: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' },

    // Body
    body: { flex: 1, paddingHorizontal: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginTop: 20, marginBottom: 15 },
    columnWrapper: { justifyContent: 'space-between' },

    // Card
    cardContainer: {
        width: (width - 48) / 2,
        height: 185,
        marginBottom: 16,
        borderRadius: 24,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 5,
    },
    cardTouchable: { flex: 1, borderRadius: 24, overflow: 'hidden' },
    cardGradient: { flex: 1, padding: 14, justifyContent: 'space-between', position: 'relative' },
    iconContainer: {
        width: 46, height: 46, borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)'
    },
    textContainer: { marginTop: 12 },
    cardTitleEnglish: { fontSize: 16, fontWeight: 'bold', color: 'white', marginBottom: 2 },
    cardTitleTopics: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.9)', marginBottom: 5 },
    cardDesc: { fontSize: 11, color: 'rgba(255,255,255,0.8)', lineHeight: 15 },
    decorativeCircle: {
        position: 'absolute', right: -30, bottom: -30,
        width: 120, height: 120, borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.12)'
    },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: {
        backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32,
        padding: 24, paddingBottom: 40,
        elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 10
    },
    modalHeaderIndicator: { alignItems: 'center', marginBottom: 24 },
    indicatorBar: { width: 40, height: 5, backgroundColor: '#E2E8F0', borderRadius: 3 },

    selectedTopicContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC',
        padding: 16, borderRadius: 20, marginBottom: 24,
        borderWidth: 1, borderColor: '#E2E8F0'
    },
    selectedTopicIconWrapper: {
        width: 52, height: 52, borderRadius: 18,
        justifyContent: 'center', alignItems: 'center', overflow: 'hidden'
    },
    modalTopicLabel: { fontSize: 12, color: '#64748B', fontWeight: '500' },
    modalTopicTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
    modalTopicSub: { fontSize: 14, color: '#475569' },

    modalInstruction: { fontSize: 16, fontWeight: '700', color: '#334155', marginBottom: 16 },

    levelsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    levelBtn: {
        width: '48%', flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'white', padding: 12, borderRadius: 16, marginBottom: 14,
        borderWidth: 1.5,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2
    },
    levelBadge: {
        width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 10
    },
    levelCode: { color: 'white', fontWeight: 'bold', fontSize: 15 },
    levelLabel: { fontWeight: '700', fontSize: 14, color: '#1E293B' },
    levelDesc: { fontSize: 11, color: '#64748B' },

    // [NEW] Suggestion Styles
    suggestionContainer: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: THEME.light, // Nền Cyan nhạt
        padding: 12, borderRadius: 16,
        marginTop: 10,
        borderWidth: 1, borderColor: THEME.primary,
        borderStyle: 'dashed'
    },
    suggestionIconBox: {
        marginRight: 12,
    },
    suggestionTitle: {
        fontSize: 13, fontWeight: 'bold', color: THEME.dark, marginBottom: 2
    },
    suggestionText: {
        fontSize: 13, color: THEME.text, lineHeight: 18
    }
});

export default ChatAIScreen;