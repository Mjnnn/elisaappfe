import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Image, Dimensions,
    Alert, ActivityIndicator, FlatList, ListRenderItemInfo, Modal, Animated, Easing
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, RouteProp, useRoute, NavigationProp } from '@react-navigation/native';
import * as Progress from 'react-native-progress';
import * as Speech from 'expo-speech';
import * as Animatable from 'react-native-animatable';
import { Audio } from 'expo-av'; // Thêm mới
import { AuthStackParamList } from '../../../navigation/AuthStack';
import foxImage from '../../../../assets/images/logo/Elisa.png';
import vocabularyService from '../../../services/vocabularyService';
import { EnglishVocabularyTheoryResponse, VocabularyPageResponse } from '../../../types/response/VocabularyResponse';
import { EnglishPronunciationScoreResponse } from '../../../types/response/EnglishPronunciationScoreResponse'; // Đảm bảo import đúng type
import { Platform } from 'react-native';

type VocabularyScreenRouteProp = RouteProp<AuthStackParamList, 'VocabularyScreen'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- Sub-Component: Flashcard ---
const Flashcard: React.FC<{ item: EnglishVocabularyTheoryResponse }> = ({ item }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [scoreResult, setScoreResult] = useState<EnglishPronunciationScoreResponse | null>(null);
    const [showResultModal, setShowResultModal] = useState(false);

    const pulseAnim = useRef(new Animated.Value(1)).current;
    const resultAnim = useRef(new Animated.Value(0)).current;

    const parts = item.example ? item.example.split(" -> ") : [];
    const englishPhrase = parts[0];
    const vietnamesePhrase = parts[1];

    const getScoreColor = (score: number) => {
        if (score > 80) return '#10B981'; // Xanh lá cây
        if (score > 60) return '#3B82F6'; // Xanh nước biển
        if (score > 40) return '#F59E0B'; // Vàng
        return '#EF4444';                // Đỏ
    };

    useEffect(() => {
        if (isRecording) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.3, duration: 400, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [isRecording]);

    const speakWord = async () => {
        try {
            const isSpeaking = await Speech.isSpeakingAsync();
            if (isSpeaking) await Speech.stop();
            Speech.speak(item.word, { language: 'en-US', pitch: 1.0, rate: 0.85 });
        } catch (error) { console.log("Lỗi phát âm:", error); }
    };

    // --- LOGIC GHI ÂM VÀ GỌI API ---
    const startRecording = async () => {
        try {
            const permission = await Audio.requestPermissionsAsync();
            if (permission.status !== 'granted') return Alert.alert("Lỗi", "Bạn cần cấp quyền micro để luyện tập.");

            await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
            const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            setRecording(recording);
            setIsRecording(true);
        } catch (err) { console.log('Failed to start recording', err); }
    };

    const stopRecording = async () => {
        if (!recording) return;
        setIsRecording(false);
        setIsAnalyzing(true);
        try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            setRecording(null);

            if (uri) {
                const formData = new FormData();
                formData.append('audio', {
                    uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
                    type: 'audio/m4a',
                    name: 'pronunciation.m4a',
                } as any);
                formData.append('word', item.word);

                const response = await vocabularyService.getPronunciationScore(formData);
                setScoreResult(response.data);
                setShowResultModal(true);

                // Hiệu ứng hiện Modal
                Animated.spring(resultAnim, { toValue: 1, friction: 5, useNativeDriver: true }).start();
            }
        } catch (error) {
            Alert.alert("Lỗi", "Server hiện tại đang cập nhật. Vui lòng thử lại sau.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handlePronunciationPractice = () => {
        if (isRecording) stopRecording();
        else startRecording();
    };

    return (
        <View style={flashcardStyles.cardWrapper}>
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

                <View style={flashcardStyles.wordHeader}>
                    <Text style={flashcardStyles.wordText}>{item.word}</Text>
                    <TouchableOpacity onPress={speakWord} style={flashcardStyles.speakerIcon}>
                        <Ionicons name="volume-medium" size={32} color="#3B82F6" />
                    </TouchableOpacity>
                </View>

                <View style={flashcardStyles.rowInfo}>
                    {item.ipa ? <Text style={flashcardStyles.ipaText}>/{item.ipa}/</Text> : null}
                    <Text style={flashcardStyles.typeText}>[{item.type}]</Text>
                </View>

                <Text style={flashcardStyles.meaningText}>{item.meaning}</Text>

                <View style={flashcardStyles.practiceContainer}>
                    <View style={flashcardStyles.exampleContainer}>
                        {item.example && <Text style={flashcardStyles.exampleText}>Example: "{englishPhrase}"</Text>}
                        {item.example && <Text style={flashcardStyles.exampleText}> {'->'} "{vietnamesePhrase}"</Text>}
                    </View>

                    <Text style={flashcardStyles.practiceLabel}>{isAnalyzing ? "Đang phân tích..." : "Thử phát âm ngay:"}</Text>

                    <TouchableOpacity onPress={handlePronunciationPractice} disabled={isAnalyzing}>
                        <Animated.View style={[
                            flashcardStyles.micBtn,
                            { transform: [{ scale: pulseAnim }], backgroundColor: isRecording ? '#EF4444' : '#10B981' }
                        ]}>
                            {isAnalyzing ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <MaterialCommunityIcons name={isRecording ? "stop" : "microphone"} size={32} color="white" />
                            )}
                        </Animated.View>
                    </TouchableOpacity>
                    {isRecording && (
                        <Animatable.Text animation="fadeIn" iterationCount="infinite" style={flashcardStyles.recordingStatus}>
                            Đang lắng nghe...
                        </Animatable.Text>
                    )}
                </View>
            </View>

            <Modal transparent visible={showResultModal} animationType="none">
                <View style={resultModalStyles.overlay}>
                    <Animatable.View animation="bounceIn" duration={1000} style={resultModalStyles.container}>
                        {scoreResult && (
                            <>
                                <View style={[
                                    resultModalStyles.scoreCircle,
                                    { backgroundColor: getScoreColor(scoreResult.score) } // Cập nhật màu nền
                                ]}>
                                    <Animatable.Text animation="pulse" iterationCount="infinite" style={resultModalStyles.scoreText}>
                                        {scoreResult.score}
                                    </Animatable.Text>
                                    <Text style={resultModalStyles.scoreLabel}>/100</Text>
                                </View>

                                <Animatable.View animation="fadeInUp" delay={500} style={resultModalStyles.infoBox}>
                                    <Text style={resultModalStyles.resultWord}>{scoreResult.word}</Text>
                                    <Text style={resultModalStyles.hintText}>"{scoreResult.hint}"</Text>
                                </Animatable.View>

                                <View style={resultModalStyles.rewardContainer}>
                                    {scoreResult.score >= 80 ? (
                                        <Animatable.Text
                                            animation="tada"
                                            iterationCount="infinite"
                                            style={[resultModalStyles.rankText, { color: getScoreColor(scoreResult.score) }]} // Cập nhật màu chữ
                                        >
                                            🌟 TUYỆT VỜI! 🌟
                                        </Animatable.Text>
                                    ) : (
                                        <Text style={[resultModalStyles.rankText, { color: getScoreColor(scoreResult.score) }]}>
                                            {scoreResult.score > 60 ? 'RẤT TỐT!' : scoreResult.score > 40 ? 'KHÁ TỐT' : 'CỐ GẮNG LÊN!'}
                                        </Text>
                                    )}
                                </View>

                                <TouchableOpacity
                                    style={[resultModalStyles.closeBtn, { backgroundColor: getScoreColor(scoreResult.score) }]}
                                    onPress={() => setShowResultModal(false)}
                                >
                                    <Text style={resultModalStyles.closeBtnText}>TIẾP TỤC HỌC</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </Animatable.View>
                </View>
            </Modal>
        </View>
    );
};

// --- GIỮ NGUYÊN CSS FLASHCARD CŨ ---
const flashcardStyles = StyleSheet.create({
    cardWrapper: { width: SCREEN_WIDTH, alignItems: 'center', justifyContent: 'center' },
    cardContent: {
        width: SCREEN_WIDTH * 0.9,
        height: SCREEN_WIDTH * 1.5,
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    imageWrapper: { width: '100%', height: Platform.OS === 'ios' ? '55%' : '45%', marginBottom: 15, borderRadius: 16, overflow: 'hidden' },
    image: { width: '100%', height: '100%' },
    imagePlaceholder: { width: '100%', height: '100%', backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
    placeholderText: { color: '#9CA3AF' },
    wordHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 5 },
    wordText: { fontSize: 32, fontWeight: 'bold', color: '#1E3A8A' },
    speakerIcon: { marginLeft: 10, backgroundColor: '#EFF6FF', padding: 6, borderRadius: 50 },
    rowInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    typeText: { fontSize: 14, color: '#6B7280', fontStyle: 'italic' },
    ipaText: { fontSize: 16, color: '#fb0000ff', marginRight: 8, fontWeight: '500' },
    meaningText: { fontSize: 18, color: '#374151', marginBottom: 5, fontWeight: '600' },
    exampleContainer: { marginBottom: 10 },
    practiceContainer: { alignItems: 'center' },
    practiceLabel: { fontSize: 13, color: '#9CA3AF', marginBottom: 10, fontWeight: '500' },
    micBtn: {
        width: 64, height: 64, borderRadius: 32,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2, shadowRadius: 5, elevation: 8,
    },
    recordingStatus: { marginTop: 8, color: '#EF4444', fontSize: 12, fontWeight: 'bold' },
    exampleText: { fontSize: 14, color: '#6B7280', fontStyle: 'italic', textAlign: 'center', marginTop: 5 },
});

// --- CSS MỚI CHO MODAL KẾT QUẢ AI ---
const resultModalStyles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
    container: { width: '85%', backgroundColor: '#FFF', borderRadius: 30, padding: 30, alignItems: 'center', overflow: 'hidden' },
    scoreCircle: {
        width: 120, height: 120, borderRadius: 60, backgroundColor: '#3B82F6',
        justifyContent: 'center', alignItems: 'center', marginBottom: 20,
        borderWidth: 5, borderColor: '#DBEAFE', elevation: 10
    },
    scoreText: { color: '#FFF', fontSize: 40, fontWeight: 'bold' },
    scoreLabel: { color: '#DBEAFE', fontSize: 14, fontWeight: '600' },
    infoBox: { alignItems: 'center', marginBottom: 25 },
    resultWord: { fontSize: 24, fontWeight: 'bold', color: '#1E3A8A', marginBottom: 10 },
    hintText: { fontSize: 16, color: '#4B5563', textAlign: 'center', fontStyle: 'italic', lineHeight: 22 },
    rewardContainer: { marginBottom: 30 },
    rankText: { fontSize: 22, fontWeight: '900', color: '#F59E0B' },
    closeBtn: { backgroundColor: '#10B981', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 25, elevation: 5 },
    closeBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});

// --- GIỮ NGUYÊN TOÀN BỘ VocabularyScreen BÊN DƯỚI ---
const VocabularyScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp<AuthStackParamList>>();
    const route = useRoute<VocabularyScreenRouteProp>();
    const { lessonId, lessonTitle, section } = route.params;

    const [vocabularyData, setVocabularyData] = useState<EnglishVocabularyTheoryResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0.0);
    const [showChatbot, setShowChatbot] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [showExitModal, setShowExitModal] = useState(false);
    const flatListRef = useRef<FlatList<EnglishVocabularyTheoryResponse>>(null);
    const isUserConfirmedExit = useRef(false);

    useLayoutEffect(() => {
        navigation.setOptions({ gestureEnabled: false });
    }, [navigation]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            if (isUserConfirmedExit.current || showChatbot || showCompletionModal) return;
            e.preventDefault();
            setShowExitModal(true);
        });
        return unsubscribe;
    }, [navigation, showChatbot, showCompletionModal]);

    useEffect(() => {
        return () => { Speech.stop(); };
    }, []);

    const fetchVocabulary = async (page: number, size: number) => {
        if (!lessonId) return;
        setLoading(true);
        try {
            const response = await vocabularyService.getVocabularyTheoriesByLesson(lessonId, page, size);
            setVocabularyData(response.data.content);
        } catch (error) {
            Alert.alert("Lỗi", "Không thể tải dữ liệu.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (lessonId) fetchVocabulary(0, 10); }, [lessonId]);

    useEffect(() => {
        if (vocabularyData.length > 0) setProgress((activeIndex + 1) / vocabularyData.length);
        else setProgress(0);
    }, [activeIndex, vocabularyData]);

    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: any }) => {
        if (viewableItems.length > 0) setActiveIndex(viewableItems[0].index);
    }).current;

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

    const handleGoBack = () => {
        if (showChatbot || showCompletionModal) navigation.navigate('AppTabs' as any);
        else setShowExitModal(true);
    };

    const handleConfirmExit = () => {
        setShowExitModal(false);
        isUserConfirmedExit.current = true;
        navigation.navigate('AppTabs' as any);
    };

    const renderContent = () => {
        if (loading) return <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 50 }} />;
        if (vocabularyData.length === 0) return <Text style={styles.noDataText}>Không tìm thấy từ vựng nào.</Text>;
        if (showChatbot) {
            return (
                <View style={styles.introContainer}>
                    <View style={styles.centerContent}>
                        <Animatable.View animation="bounceIn" style={styles.chatBubble}>
                            <Text style={styles.chatText}>Trước tiên, hãy cùng nhau học từ vựng của chủ đề "{lessonTitle}" trước nhé!</Text>
                            <View style={styles.chatArrow} />
                        </Animatable.View>
                        <Animatable.Image
                            animation="pulse"
                            iterationCount="infinite"
                            source={foxImage}
                            style={styles.elisaImageLarge}
                            resizeMode="contain"
                        />
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
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={SCREEN_WIDTH}
                    snapToAlignment="center"
                    decelerationRate="fast"
                    getItemLayout={(_, index) => ({
                        length: SCREEN_WIDTH,
                        offset: SCREEN_WIDTH * index,
                        index,
                    })}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
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
            {!showChatbot && (
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={handleGoBack} style={styles.backButton}><Ionicons name="arrow-back" size={28} color="#9CA3AF" /></TouchableOpacity>
                    <View style={styles.progressBarWrapper}><Progress.Bar progress={progress} height={12} width={null} color="#3B82F6" unfilledColor="#E0E0E0" borderRadius={6} borderWidth={0} style={{ width: '100%' }} /></View>
                    <View style={{ width: 15 }} />
                </View>
            )}
            {showChatbot && <TouchableOpacity onPress={handleGoBack} style={[styles.backButton, { position: 'absolute', top: 50, left: 10, zIndex: 10 }]}><Ionicons name="arrow-back" size={28} color="#333" /></TouchableOpacity>}

            <View style={styles.content}>{renderContent()}</View>

            <Modal animationType="fade" transparent visible={showCompletionModal} onRequestClose={() => setShowCompletionModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Image source={foxImage} style={styles.modalImage} resizeMode="contain" />
                        <Text style={styles.modalTitle}>Xuất sắc!</Text>
                        <Text style={styles.modalMessage}>Bạn đã xem hết các từ vựng trong bài này.</Text>
                        <TouchableOpacity style={[styles.modalButton, styles.primaryButton]} onPress={() => { setShowCompletionModal(false); navigation.navigate('VocabularyPractice' as any, { lessonId, lessonTitle, section, vocabularyList: vocabularyData }); }}><Text style={styles.primaryButtonText}>Luyện tập ngay</Text></TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, styles.secondaryButton]} onPress={() => { setShowCompletionModal(false); setActiveIndex(0); flatListRef.current?.scrollToIndex({ index: 0, animated: true }); }}><Text style={styles.secondaryButtonText}>Tiếp tục học từ vựng</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal animationType="fade" transparent visible={showExitModal} onRequestClose={() => setShowExitModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, styles.exitModalBorder]}>
                        <View style={styles.warningIconContainer}><Ionicons name="alert-circle" size={50} color="#EF4444" /></View>
                        <Text style={styles.modalTitle}>Khoan đã!</Text>
                        <Text style={styles.modalMessage}>Nếu bạn rời đi bây giờ, toàn bộ tiến độ bài học này sẽ bị mất...</Text>
                        <TouchableOpacity style={[styles.modalButton, styles.primaryButton]} onPress={() => setShowExitModal(false)}><Text style={styles.primaryButtonText}>Tiếp tục học</Text></TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, styles.dangerButton]} onPress={handleConfirmExit}><Text style={styles.dangerButtonText}>Dừng lại và thoát</Text></TouchableOpacity>
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
    introContainer: { flex: 1, width: '100%', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 30, paddingHorizontal: 20 },
    centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    chatBubble: { backgroundColor: '#F3F4F6', borderRadius: 16, padding: 20, marginBottom: 20, maxWidth: '90%' },
    chatText: { fontSize: 18, color: '#374151', fontWeight: '500', textAlign: 'center', lineHeight: 26 },
    chatArrow: { position: 'absolute', bottom: -10, alignSelf: 'center', width: 0, height: 0, borderLeftWidth: 10, borderRightWidth: 10, borderTopWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#F3F4F6' },
    elisaImageLarge: { width: 250, height: 250 },
    startButtonBottom: { backgroundColor: '#3B82F6', width: '90%', paddingVertical: 18, borderRadius: 30, alignItems: 'center', shadowColor: "#3B82F6", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 6 },
    startButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    flashcardContainer: { flex: 1, width: '100%', justifyContent: 'space-between', alignItems: 'center' },
    cardFooter: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 15, backgroundColor: '#FFFFFF' },
    pageIndicator: { fontSize: 18, fontWeight: 'bold', color: '#3B82F6' },
    navButton: { padding: 10 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '85%', backgroundColor: 'white', borderRadius: 24, padding: 25, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 10 },
    exitModalBorder: { borderTopWidth: 6, borderTopColor: '#EF4444' },
    warningIconContainer: { marginBottom: 15, backgroundColor: '#FEE2E2', padding: 10, borderRadius: 50 },
    modalImage: { width: 120, height: 120, marginBottom: 15 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', marginBottom: 10, textAlign: 'center' },
    modalMessage: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 25, lineHeight: 24 },
    modalButton: { width: '100%', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginBottom: 12 },
    primaryButton: { backgroundColor: '#3B82F6', elevation: 3 },
    primaryButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase' },
    secondaryButton: { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
    secondaryButtonText: { color: '#4B4B4B', fontSize: 16, fontWeight: '600' },
    dangerButton: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EF4444' },
    dangerButtonText: { color: '#EF4444', fontSize: 16, fontWeight: '600' },
});

export default VocabularyScreen;