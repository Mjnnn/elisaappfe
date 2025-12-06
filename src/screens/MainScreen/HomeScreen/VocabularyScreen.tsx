import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Image, Dimensions,
    Alert, ActivityIndicator, FlatList, ListRenderItemInfo, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, RouteProp, useRoute, NavigationProp } from '@react-navigation/native';
import * as Progress from 'react-native-progress';
import { AuthStackParamList } from '../../../navigation/AuthStack';
import foxImage from '../../../../assets/images/logo/Elisa.png';
import vocabularyService from '../../../services/vocabularyService';
import { EnglishVocabularyTheoryResponse, VocabularyPageResponse } from '../../../types/response/VocabularyResponse';

type VocabularyScreenRouteProp = RouteProp<AuthStackParamList, 'VocabularyScreen'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.9;
const CARD_MARGIN = SCREEN_WIDTH * 0.05;

// --- Sub-Component: Flashcard ---
const Flashcard: React.FC<{ item: EnglishVocabularyTheoryResponse }> = ({ item }) => {
    const parts = item.example ? item.example.split(" -> ") : [];
    const englishPhrase = parts[0];
    const vietnamesePhrase = parts[1];
    return (
        <View style={flashcardStyles.cardContainer}>
            <View style={flashcardStyles.cardContent}>
                <View style={flashcardStyles.imageWrapper}>
                    {item.image ? (
                        <Image source={{ uri: item.image }} style={flashcardStyles.image} resizeMode="cover" />
                    ) : (
                        <View style={flashcardStyles.imagePlaceholder}>
                            <Text style={flashcardStyles.placeholderText}>[Không có hình ảnh]</Text>
                        </View>
                    )}
                </View>
                <Text style={flashcardStyles.wordText}>{item.word}</Text>
                <Text style={flashcardStyles.typeText}>[{item.type}]</Text>
                <Text style={flashcardStyles.meaningText}>{item.meaning}</Text>
                {item.example && <Text style={flashcardStyles.exampleText}>Example: "{englishPhrase}"</Text>}
                {item.example && <Text style={flashcardStyles.exampleText}> {'->'} "{vietnamesePhrase}"</Text>}
            </View>
        </View>
    );
};

const flashcardStyles = StyleSheet.create({
    cardContainer: {
        width: CARD_WIDTH,
        height: SCREEN_WIDTH * 1.4,
        marginHorizontal: CARD_MARGIN / 2,
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#EFEFEF',
    },
    cardContent: { padding: 20, alignItems: 'center' },
    imageWrapper: { width: '100%', height: '60%', marginBottom: 20, borderRadius: 12, overflow: 'hidden' },
    image: { width: '100%', height: '100%' },
    imagePlaceholder: { width: '100%', height: '100%', backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
    placeholderText: { color: '#A0A0A0' },
    wordText: { fontSize: 36, fontWeight: 'bold', color: '#1E3A8A', marginBottom: 5 },
    typeText: { fontSize: 16, color: '#6B7280', marginBottom: 12, fontStyle: 'italic' },
    meaningText: { fontSize: 20, color: '#4B4B4B', marginBottom: 10 },
    exampleText: { fontSize: 16, color: '#6B7280', fontStyle: 'italic', textAlign: 'center', marginTop: 10 },
    flatListContent: { alignItems: 'center', paddingHorizontal: CARD_MARGIN / 2 },
});

// --- Component Chính ---
const VocabularyScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp<AuthStackParamList>>();
    const route = useRoute<VocabularyScreenRouteProp>();
    const { lessonId, lessonTitle, section } = route.params;

    // Data State
    const [vocabularyData, setVocabularyData] = useState<EnglishVocabularyTheoryResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0.0);

    // UI State
    const [showChatbot, setShowChatbot] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);

    // Modal State
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [showExitModal, setShowExitModal] = useState(false);

    // Refs
    const flatListRef = useRef<FlatList<EnglishVocabularyTheoryResponse>>(null);
    const isUserConfirmedExit = useRef(false); // ✨ Ref quan trọng để tránh vòng lặp

    // --- 1. FIX LỖI CRASH: Tắt cử chỉ vuốt (Swipe Back) ---
    useLayoutEffect(() => {
        navigation.setOptions({
            gestureEnabled: false, // Vô hiệu hóa vuốt trên iOS để tránh lỗi "removed natively"
        });
    }, [navigation]);

    // --- 2. Logic Chặn nút Back ---
    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            // Nếu người dùng đã xác nhận thoát từ Modal -> Cho phép đi
            if (isUserConfirmedExit.current) {
                return;
            }

            // Nếu đang ở Intro (chưa học) hoặc Đã xong -> Cho phép đi
            if (showChatbot || showCompletionModal) {
                return;
            }

            // Nếu đang học dở -> Chặn lại và hiện Modal
            e.preventDefault();
            setShowExitModal(true);
        });

        return unsubscribe;
    }, [navigation, showChatbot, showCompletionModal]);

    // --- Fetch Data ---
    const fetchVocabulary = async (page: number, size: number) => {
        if (!lessonId) return;
        setLoading(true);
        try {
            const response = await vocabularyService.getVocabularyTheoriesByLesson(lessonId, page, size);
            const data: VocabularyPageResponse = response.data;
            setVocabularyData(data.content);
        } catch (error) {
            console.error("Lỗi:", error);
            Alert.alert("Lỗi", "Không thể tải dữ liệu.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (lessonId) fetchVocabulary(0, 10);
    }, [lessonId]);

    useEffect(() => {
        if (vocabularyData.length > 0) {
            const newProgress = (activeIndex + 1) / vocabularyData.length;
            setProgress(newProgress);
        } else {
            setProgress(0);
        }
    }, [activeIndex, vocabularyData]);

    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: any }) => {
        if (viewableItems.length > 0) {
            const index = viewableItems[0].index;
            setActiveIndex(index);
        }
    }).current;

    const viewabilityConfig = { itemVisiblePercentThreshold: 50 };

    // --- Navigation Handlers ---
    const handleNavigation = (direction: 'next' | 'prev') => {
        let newIndex = direction === 'next' ? activeIndex + 1 : activeIndex - 1;
        if (newIndex >= 0 && newIndex < vocabularyData.length) {
            flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
            setActiveIndex(newIndex);
        } else if (direction === 'next' && newIndex === vocabularyData.length) {
            setShowCompletionModal(true);
        }
    };

    const startReview = () => {
        setShowChatbot(false);
        setActiveIndex(0);
        if (vocabularyData.length > 0) setProgress(1 / vocabularyData.length);
    };

    // Nút Back trên Header
    const handleGoBack = () => {
        if (showChatbot || showCompletionModal) {
            navigation.navigate('AppTabs' as any);
            return;
        }

        // 2. Nếu đang học dở dang -> KHÔNG THOÁT, mà hiện Modal cảnh báo
        setShowExitModal(true);
    };

    // --- Modal Exit Handlers ---
    const handleConfirmExit = () => {
        setShowExitModal(false);
        isUserConfirmedExit.current = true; // Đánh dấu xác nhận
        navigation.navigate('AppTabs' as any); // Thoát về trang chủ
    };

    const handleStay = () => {
        setShowExitModal(false); // Ở lại học tiếp
    };

    // --- Modal Completion Handlers ---
    const handleReviewAgain = () => {
        setShowCompletionModal(false);
        setActiveIndex(0);
        flatListRef.current?.scrollToIndex({ index: 0, animated: true });
    };

    const handlePracticeNow = () => {
        setShowCompletionModal(false);
        console.log("VocabularyScreenSection: ", { section });
        navigation.navigate('VocabularyPractice' as any, { lessonId, lessonTitle, section, vocabularyList: vocabularyData });
    };

    // --- Render Content ---
    const renderContent = () => {
        if (loading) return <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 50 }} />;
        if (vocabularyData.length === 0) return <Text style={styles.noDataText}>Không tìm thấy từ vựng nào.</Text>;

        if (showChatbot) {
            return (
                <View style={styles.introContainer}>
                    <View style={styles.centerContent}>
                        <View style={styles.chatBubble}>
                            <Text style={styles.chatText}>Trước tiên, hãy cùng nhau học từ vựng của chủ đề "{lessonTitle}" trước nhé!</Text>
                            <View style={styles.chatArrow} />
                        </View>
                        <Image source={foxImage} style={styles.elisaImageLarge} resizeMode="contain" />
                    </View>
                    <TouchableOpacity style={styles.startButtonBottom} onPress={startReview}>
                        <Text style={styles.startButtonText}>Bắt đầu học từ vựng</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={styles.flashcardContainer}>
                <FlatList
                    ref={flatListRef}
                    data={vocabularyData}
                    renderItem={({ item }: ListRenderItemInfo<EnglishVocabularyTheoryResponse>) => <Flashcard item={item} />}
                    keyExtractor={(item) => String(item.vocabId)}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                    contentContainerStyle={flashcardStyles.flatListContent}
                    initialScrollIndex={0}
                />
                <View style={styles.cardFooter}>
                    <TouchableOpacity onPress={() => handleNavigation('prev')} disabled={activeIndex === 0} style={styles.navButton}>
                        <Ionicons name="arrow-back-circle" size={40} color={activeIndex === 0 ? '#C0C0C0' : '#3B82F6'} />
                    </TouchableOpacity>
                    <Text style={styles.pageIndicator}>{activeIndex + 1}/{vocabularyData.length}</Text>
                    <TouchableOpacity onPress={() => handleNavigation('next')} style={styles.navButton}>
                        <Ionicons name="arrow-forward-circle" size={40} color={'#3B82F6'} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            {!showChatbot && (
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={28} color="#9CA3AF" />
                    </TouchableOpacity>
                    <View style={styles.progressBarWrapper}>
                        <Progress.Bar
                            progress={progress}
                            height={12}
                            width={null}
                            color="#3B82F6"
                            unfilledColor="#E0E0E0"
                            borderRadius={6}
                            borderWidth={0}
                            style={{ width: '100%' }}
                        />
                    </View>
                    <View style={{ width: 15 }} />
                </View>
            )}

            {/* Back button for Intro screen */}
            {showChatbot && (
                <TouchableOpacity onPress={handleGoBack} style={[styles.backButton, { position: 'absolute', top: 50, left: 10, zIndex: 10 }]}>
                    <Ionicons name="arrow-back" size={28} color="#333" />
                </TouchableOpacity>
            )}

            <View style={styles.content}>{renderContent()}</View>

            {/* ✨ MODAL 1: HOÀN THÀNH BÀI HỌC */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showCompletionModal}
                onRequestClose={() => setShowCompletionModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Image source={foxImage} style={styles.modalImage} resizeMode="contain" />
                        <Text style={styles.modalTitle}>Xuất sắc!</Text>
                        <Text style={styles.modalMessage}>Bạn đã xem hết các từ vựng trong bài này.</Text>
                        <TouchableOpacity style={[styles.modalButton, styles.primaryButton]} onPress={handlePracticeNow}>
                            <Text style={styles.primaryButtonText}>Luyện tập ngay</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, styles.secondaryButton]} onPress={handleReviewAgain}>
                            <Text style={styles.secondaryButtonText}>Tiếp tục học từ vựng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ✨ MODAL 2: CẢNH BÁO THOÁT (EXIT WARNING) */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showExitModal}
                onRequestClose={handleStay}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, styles.exitModalBorder]}>
                        <View style={styles.warningIconContainer}>
                            <Ionicons name="alert-circle" size={50} color="#EF4444" />
                        </View>

                        <Text style={styles.modalTitle}>Khoan đã!</Text>

                        <Text style={styles.modalMessage}>
                            Nếu bạn rời đi bây giờ, toàn bộ tiến độ bài học này sẽ bị mất và bạn sẽ phải học lại từ đầu và Bạn sẽ không nhận được điểm thưởng của bài học. Bạn có chắc chắn muốn thoát không?
                        </Text>

                        {/* Nút Tiếp tục học (Primary) */}
                        <TouchableOpacity style={[styles.modalButton, styles.primaryButton]} onPress={handleStay}>
                            <Text style={styles.primaryButtonText}>Tiếp tục học</Text>
                        </TouchableOpacity>

                        {/* Nút Thoát (Danger) */}
                        <TouchableOpacity style={[styles.modalButton, styles.dangerButton]} onPress={handleConfirmExit}>
                            <Text style={styles.dangerButtonText}>Dừng lại và thoát</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    headerContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EEE' },
    backButton: { paddingLeft: 15, marginRight: 15, paddingVertical: 5 },
    progressBarWrapper: { flex: 1, justifyContent: 'center' },
    content: { flex: 1, width: '100%' },
    noDataText: { fontSize: 18, color: '#999', marginTop: 50, textAlign: 'center' },

    // Intro
    introContainer: { flex: 1, width: '100%', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 30, paddingHorizontal: 20 },
    centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    chatBubble: { backgroundColor: '#F3F4F6', borderRadius: 16, padding: 20, marginBottom: 20, maxWidth: '90%' },
    chatText: { fontSize: 18, color: '#374151', fontWeight: '500', textAlign: 'center', lineHeight: 26 },
    chatArrow: { position: 'absolute', bottom: -10, alignSelf: 'center', width: 0, height: 0, borderLeftWidth: 10, borderRightWidth: 10, borderTopWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#F3F4F6' },
    elisaImageLarge: { width: 250, height: 250 },
    startButtonBottom: { backgroundColor: '#3B82F6', width: '90%', paddingVertical: 18, borderRadius: 30, alignItems: 'center', shadowColor: "#3B82F6", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 6 },
    startButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

    // Flashcard
    flashcardContainer: { flex: 1, width: '100%', justifyContent: 'space-between', alignItems: 'center' },
    cardFooter: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 15, backgroundColor: '#FFFFFF' },
    pageIndicator: { fontSize: 18, fontWeight: 'bold', color: '#3B82F6' },
    navButton: { padding: 10 },

    // --- Modal Styles ---
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 10,
    },

    // Exit Modal Specific
    exitModalBorder: {
        borderTopWidth: 6,
        borderTopColor: '#EF4444',
    },
    warningIconContainer: {
        marginBottom: 15,
        backgroundColor: '#FEE2E2',
        padding: 10,
        borderRadius: 50,
    },

    // Components inside Modal
    modalImage: {
        width: 120,
        height: 120,
        marginBottom: 15,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 10,
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 24,
    },

    // Buttons
    modalButton: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    primaryButton: {
        backgroundColor: '#3B82F6',
        shadowColor: "#3B82F6",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },

    secondaryButton: {
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    secondaryButtonText: {
        color: '#4B4B4B',
        fontSize: 16,
        fontWeight: '600',
    },

    dangerButton: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#EF4444',
    },
    dangerButtonText: {
        color: '#EF4444',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default VocabularyScreen;