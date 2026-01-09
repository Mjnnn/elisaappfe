import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Animated,
    Dimensions,
    StatusBar,
    ScrollView,
    Alert,
    Image,
    Modal,
    Platform,
    UIManager,
    LayoutAnimation,
    Vibration // 1. Thêm Vibration
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av'; // 2. Thêm Audio

// --- IMPORTS SERVICES ---
import exerciseService from '../../../services/exerciseService';
import { EnglishOrderingExerciseResponse, EnglishParagraphSegmentResponse } from '../../../types/response/ExerciseResponse';
import userProgressService from '../../../services/userProgressService';
import userXPService from '../../../services/userXPService';
import notificationService from '../../../services/notificationService';
import { getAchievementID, getRankIconByID } from '../../../services/data/RankingData';
import { rankingData } from '../../../services/data/RankingData';

// Kích hoạt Animation cho Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- ASSETS ---
import normal from '../../../../assets/images/logo/Elisa.png';
import happy from '../../../../assets/images/logo/Elisa_Happy.png';
import sad from '../../../../assets/images/logo/Elisa_Sad.png';

const { width } = Dimensions.get('window');

const COLORS = {
    primary: '#3B82F6',
    secondary: '#F5F7FA',
    success: '#58CC02',
    successBg: '#D7FFB8',
    error: '#FF4B4B',
    errorBg: '#FFDFE0',
    white: '#FFFFFF',
    text: '#2D3436',
    subText: '#636E72',
    borderDefault: '#E5E7EB',
    cardBg: '#FFFFFF',
    selectedBorder: '#3B82F6',
    selectedBg: '#EFF6FF',
};

const OrderingScreen = ({ route, navigation }: any) => {
    const { lessonId, lessonTitle, section, currentScore } = route.params || {};

    const [questions, setQuestions] = useState<EnglishOrderingExerciseResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [totalScore, setTotalScore] = useState(currentScore || 0);
    const [currentOrder, setCurrentOrder] = useState<EnglishParagraphSegmentResponse[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
    const [isFinished, setIsFinished] = useState(false);
    const [exitModalVisible, setExitModalVisible] = useState(false);
    const [hasUpdatedProgress, setHasUpdatedProgress] = useState(false);

    const progressAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;

    // --- LOGIC ÂM THANH PHẢN HỒI ---
    async function playFeedbackSound(isCorrect: boolean) {
        try {
            const { sound: feedbackSound } = await Audio.Sound.createAsync(
                isCorrect
                    ? require('../../../../assets/sounds/correct.mp3')
                    : require('../../../../assets/sounds/wrong.mp3')
            );
            await feedbackSound.playAsync();
            feedbackSound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish) {
                    feedbackSound.unloadAsync();
                }
            });
        } catch (error) {
            console.log("Lỗi âm thanh phản hồi:", error);
        }
    }

    useEffect(() => {
        fetchQuestions();
    }, []);

    useEffect(() => {
        const updateUserData = async () => {
            if (isFinished && totalScore >= 70 && !hasUpdatedProgress) {
                setHasUpdatedProgress(true);
                try {
                    const userIdString = await AsyncStorage.getItem("userId");
                    if (!userIdString) return;
                    const userId = Number(userIdString);
                    const fullName = await AsyncStorage.getItem("fullName") || "Học viên Elisa";
                    const progressResponse = await userProgressService.getUserProgressByUserId(userId);
                    const currentServerLessonId = progressResponse.data.lessonId;

                    if (currentServerLessonId > lessonId) return;

                    let nextLessonId = lessonId < 45 ? lessonId + 1 : lessonId;
                    await userProgressService.updateUserProgress({ userId, lessonId: nextLessonId, section: 1 });

                    const currentXPResponse = await userXPService.getUserXPByUserId(userId);
                    const currentXP = currentXPResponse.data.totalXP || 0;
                    const xpToAdd = 700;
                    const newAchievementID = getAchievementID(currentXP + xpToAdd);

                    if (newAchievementID !== currentXPResponse.data.achievementsID) {
                        await userXPService.updateUserXP({ userId, achievementsID: newAchievementID, totalXP: currentXP + xpToAdd });
                        const notificationPayloadLevel = {
                            userId, title: "Lên cấp!",
                            content: `Chúc mừng ${fullName} bạn vừa thăng cấp. Hãy tiếp tục cố gắng nhé!`,
                            imageUrl: `${getRankIconByID(newAchievementID)}`, type: "level",
                        };
                        await notificationService.createNotification(notificationPayloadLevel);
                    } else {
                        await userXPService.updateUserXP({ userId, achievementsID: currentXPResponse.data.achievementsID, totalXP: currentXP + xpToAdd });
                    }
                } catch (error) {
                    console.log("Lỗi update progress:", error);
                }
            }
        };
        updateUserData();
    }, [isFinished, totalScore]);

    useEffect(() => {
        if (questions.length > 0 && currentIndex < questions.length) {
            setupQuestion(questions[currentIndex]);
            Animated.timing(progressAnim, {
                toValue: (currentIndex + 1) / questions.length,
                duration: 500, useNativeDriver: false,
            }).start();
        }
    }, [currentIndex, questions]);

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const response = await exerciseService.getOrderingForChallenge(lessonId);
            if (response && response.data) setQuestions(response.data);
        } catch (error) {
            Alert.alert("Lỗi", "Không thể tải dữ liệu.");
        } finally {
            setLoading(false);
        }
    };

    const setupQuestion = (question: EnglishOrderingExerciseResponse) => {
        setStatus('idle');
        setSelectedId(null);
        let shuffled = [...question.paragraphs].sort(() => Math.random() - 0.5);
        setCurrentOrder(shuffled);
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    };

    const handleCardPress = (id: number) => {
        if (status !== 'idle') return;
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (selectedId === null) {
            setSelectedId(id);
        } else if (selectedId === id) {
            setSelectedId(null);
        } else {
            const newOrder = [...currentOrder];
            const indexA = newOrder.findIndex(p => p.id === selectedId);
            const indexB = newOrder.findIndex(p => p.id === id);
            [newOrder[indexA], newOrder[indexB]] = [newOrder[indexB], newOrder[indexA]];
            setCurrentOrder(newOrder);
            setSelectedId(null);
        }
    };

    const handleCheck = () => {
        const isCorrect = currentOrder.every((item, index) => item.correctOrder === index + 1);
        if (isCorrect) {
            setStatus('correct');
            setTotalScore((prev: number) => prev + 10);
            playFeedbackSound(true); // 3. Phát âm thanh ĐÚNG
        } else {
            setStatus('wrong');
            playFeedbackSound(false); // 4. Phát âm thanh SAI
            Vibration.vibrate([0, 100, 100, 100]); // 5. Rung máy
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) setCurrentIndex(prev => prev + 1);
        else setIsFinished(true);
    };

    const handleFinishChallenge = () => navigation.navigate('AppTabs');
    const handleBackToCoursePress = () => setExitModalVisible(true);
    const cancelExit = () => setExitModalVisible(false);
    const confirmExit = () => { setExitModalVisible(false); navigation.navigate('AppTabs'); };

    const getMascotState = () => {
        if (status === 'correct') return { image: happy, message: "Trí nhớ siêu phàm!" };
        if (status === 'wrong') return { image: sad, message: "Trật tự chưa đúng rồi!" };
        const currentQ = questions[currentIndex];
        const hint = currentQ?.hint || "Sắp xếp các đoạn văn theo thứ tự hợp lý.";
        return { image: normal, message: hint };
    };

    if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

    if (isFinished) {
        const isPassed = totalScore >= 70;
        return (
            <View style={styles.resultContainer}>
                <View style={styles.resultCard}>
                    {isPassed ? <Text style={{ fontSize: 80 }}>🏆</Text> : <Image source={sad} style={{ width: 100, height: 100, marginBottom: 10 }} resizeMode="contain" />}
                    <Text style={styles.resultTitle}>{isPassed ? "CHÚC MỪNG!" : "RẤT TIẾC!"}</Text>
                    <Text style={styles.resultSubtitle}>
                        {isPassed ? "Bạn đã hoàn thành xuất sắc và đạt trình độ Level A2. Hãy tiếp tục phát huy nhé!" : "Điểm số chưa đủ để qua màn. Bạn cần ôn tập thêm."}
                    </Text>
                    <View style={styles.scoreBadge}>
                        <Text style={styles.scoreLabel}>TỔNG ĐIỂM</Text>
                        <Text style={[styles.scoreValue, { color: isPassed ? COLORS.primary : COLORS.error }]}>{totalScore}/100</Text>
                    </View>
                    <TouchableOpacity style={[styles.btnFinish, { backgroundColor: isPassed ? COLORS.success : '#4B5563' }]} onPress={handleFinishChallenge}>
                        <Text style={styles.btnFinishText}>{isPassed ? "HOÀN THÀNH & VỀ TRANG CHỦ" : "QUAY VỀ ÔN TẬP"}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const mascot = getMascotState();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
            <View style={styles.headerContainer}>
                <View style={styles.progressBarBg}>
                    <Animated.View style={[styles.progressBarFill, { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
                </View>
                <Text style={styles.progressText}>Câu {currentIndex + 1}/{questions.length}</Text>
            </View>

            <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
                    <View style={styles.mascotContainer}>
                        <Image source={mascot.image} style={styles.mascotImage} resizeMode="contain" />
                        <View style={styles.bubbleWrapper}>
                            <View style={styles.speechBubble}><Text style={styles.speechText}>{mascot.message}</Text></View>
                            <View style={styles.bubbleArrow} />
                        </View>
                    </View>
                    <Text style={styles.questionTitle}>{questions[currentIndex].title}</Text>
                    <Text style={styles.guideText}>Chạm để chọn và tráo đổi vị trí:</Text>
                    <View style={styles.listContainer}>
                        {currentOrder.map((item, index) => {
                            const isSelected = selectedId === item.id;
                            let borderColor = COLORS.borderDefault;
                            let bgColor = COLORS.cardBg;
                            let icon = null;
                            if (status === 'idle') { if (isSelected) { borderColor = COLORS.selectedBorder; bgColor = COLORS.selectedBg; } }
                            else if (status === 'correct') { borderColor = COLORS.success; bgColor = '#F0FDF4'; icon = '✓'; }
                            else if (status === 'wrong') {
                                if (item.correctOrder === index + 1) { borderColor = COLORS.success; bgColor = '#F0FDF4'; icon = '✓'; }
                                else { borderColor = COLORS.error; bgColor = '#FEF2F2'; icon = '✕'; }
                            }
                            return (
                                <TouchableOpacity key={item.id} style={[styles.paragraphCard, { borderColor, backgroundColor: bgColor }, isSelected && styles.cardSelectedShadow]} activeOpacity={0.9} onPress={() => handleCardPress(item.id)} disabled={status !== 'idle'}>
                                    <View style={[styles.indexBadge, status === 'correct' && { backgroundColor: COLORS.success }]}><Text style={styles.indexText}>{index + 1}</Text></View>
                                    <Text style={styles.paragraphContent}>{item.content}</Text>
                                    {icon && <View style={styles.resultIconContainer}><Text style={[styles.resultIcon, { color: icon === '✓' ? COLORS.success : COLORS.error }]}>{icon}</Text></View>}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </Animated.View>
            </ScrollView>

            {status === 'idle' ? (
                <View style={styles.footerIdle}><TouchableOpacity style={[styles.btnCheck, { backgroundColor: COLORS.primary }]} onPress={handleCheck}><Text style={styles.btnCheckText}>KIỂM TRA</Text></TouchableOpacity></View>
            ) : (
                <View style={[styles.footerFeedback, { backgroundColor: status === 'correct' ? COLORS.successBg : COLORS.errorBg }]}>
                    <View style={styles.feedbackHeader}>
                        <View style={[styles.iconCircle, { backgroundColor: status === 'correct' ? COLORS.success : COLORS.error }]}><Text style={styles.iconText}>{status === 'correct' ? '✓' : '✕'}</Text></View>
                        <View style={{ marginLeft: 12, flex: 1 }}>
                            <Text style={[styles.feedbackTitle, { color: status === 'correct' ? COLORS.success : COLORS.error }]}>{status === 'correct' ? 'Tuyệt vời! 🎉' : 'Thứ tự không đúng! 😢'}</Text>
                            {status === 'wrong' && <Text style={styles.correctText}>Hãy thử sắp xếp lại nhé.</Text>}
                        </View>
                    </View>
                    <TouchableOpacity style={[styles.btnNext, { backgroundColor: status === 'correct' ? COLORS.success : COLORS.error }]} onPress={handleNext}><Text style={styles.btnNextText}>{status === 'correct' ? 'TIẾP TỤC' : 'LÀM LẠI NGAY'}</Text></TouchableOpacity>
                </View>
            )}
            <Modal animationType="fade" transparent={true} visible={exitModalVisible} onRequestClose={cancelExit}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalIconContainer}><Text style={styles.modalIconText}>!</Text></View>
                        <Text style={styles.modalTitle}>Khoan đã!</Text>
                        <Text style={styles.modalBody}>Bạn sắp hoàn thành rồi! Nếu thoát bây giờ sẽ mất điểm.</Text>
                        <TouchableOpacity style={styles.modalButtonPrimary} onPress={cancelExit}><Text style={styles.modalButtonPrimaryText}>TIẾP TỤC LÀM</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.modalButtonSecondary} onPress={confirmExit}><Text style={styles.modalButtonSecondaryText}>Thoát</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

// --- STYLES GIỮ NGUYÊN ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerContainer: { paddingHorizontal: 20, paddingTop: 10, backgroundColor: COLORS.white },
    progressBarBg: { height: 12, backgroundColor: '#E5E5E5', borderRadius: 8, overflow: 'hidden', width: '100%' },
    progressBarFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 8 },
    progressText: { marginTop: 10, textAlign: 'center', color: COLORS.subText, fontWeight: 'bold', fontSize: 14 },
    contentContainer: { padding: 20, paddingBottom: 100 },
    mascotContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 10 },
    mascotImage: { width: 80, height: 80, marginRight: 10 },
    bubbleWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 5 },
    speechBubble: { flex: 1, backgroundColor: COLORS.white, borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 16, padding: 12 },
    speechText: { color: '#4B5563', fontSize: 15, fontWeight: '600' },
    bubbleArrow: { position: 'absolute', left: -8, width: 16, height: 16, backgroundColor: COLORS.white, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: '#E5E7EB', transform: [{ rotate: '45deg' }] },
    questionTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 5 },
    guideText: { fontSize: 14, color: COLORS.subText, marginBottom: 15, fontStyle: 'italic' },
    listContainer: { gap: 12 },
    paragraphCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderWidth: 2, borderRadius: 16, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2, borderBottomWidth: 4 },
    cardSelectedShadow: { shadowColor: COLORS.primary, shadowOpacity: 0.2, elevation: 5, transform: [{ scale: 1.02 }] },
    indexBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    indexText: { fontWeight: 'bold', color: '#6B7280', fontSize: 16 },
    paragraphContent: { flex: 1, fontSize: 16, color: COLORS.text, lineHeight: 24, fontWeight: '500' },
    resultIconContainer: { marginLeft: 10 },
    resultIcon: { fontSize: 20, fontWeight: 'bold' },
    footerIdle: { padding: 20, borderTopWidth: 1, borderColor: '#F3F4F6' },
    btnCheck: { paddingVertical: 16, borderRadius: 16, alignItems: 'center', borderBottomWidth: 4, borderBottomColor: 'rgba(0,0,0,0.1)' },
    btnCheckText: { fontSize: 16, fontWeight: '800', textTransform: 'uppercase', color: COLORS.white },
    footerFeedback: { padding: 24, paddingBottom: 34 },
    feedbackHeader: { flexDirection: 'row', marginBottom: 20, alignItems: 'flex-start' },
    iconCircle: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
    iconText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    feedbackTitle: { fontSize: 20, fontWeight: '800', marginBottom: 5 },
    correctText: { color: COLORS.error, fontSize: 15, marginTop: 2 },
    btnNext: { paddingVertical: 16, borderRadius: 16, alignItems: 'center', width: '100%', borderBottomWidth: 4, borderBottomColor: 'rgba(0,0,0,0.1)' },
    btnNextText: { color: COLORS.white, fontSize: 16, fontWeight: '800', textTransform: 'uppercase' },
    resultContainer: { flex: 1, backgroundColor: COLORS.secondary, justifyContent: 'center', padding: 20 },
    resultCard: { backgroundColor: COLORS.white, borderRadius: 24, padding: 30, alignItems: 'center', elevation: 5 },
    resultTitle: { fontSize: 28, fontWeight: '900', color: COLORS.text, marginTop: 10, marginBottom: 10, textAlign: 'center' },
    resultSubtitle: { fontSize: 16, color: COLORS.subText, textAlign: 'center', marginBottom: 20, paddingHorizontal: 10, lineHeight: 24 },
    scoreBadge: { backgroundColor: '#F3F4F6', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 20, alignItems: 'center', marginBottom: 30 },
    scoreLabel: { fontSize: 14, color: COLORS.subText, fontWeight: 'bold', marginBottom: 5, letterSpacing: 1 },
    scoreValue: { fontSize: 36, color: COLORS.primary, fontWeight: '900' },
    btnFinish: { paddingVertical: 16, width: '100%', borderRadius: 30, alignItems: 'center', borderBottomWidth: 4, borderBottomColor: 'rgba(0,0,0,0.1)' },
    btnFinishText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'center', width: '100%', maxWidth: 350 },
    modalIconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFE5E5', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    modalIconText: { color: '#D32F2F', fontSize: 40, fontWeight: 'bold' },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 10 },
    modalBody: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 25, lineHeight: 22 },
    modalButtonPrimary: { backgroundColor: '#4285F4', paddingVertical: 14, width: '100%', borderRadius: 30, alignItems: 'center', marginBottom: 12, borderBottomWidth: 4, borderBottomColor: '#2b6cdb' },
    modalButtonPrimaryText: { color: 'white', fontWeight: 'bold', fontSize: 16, textTransform: 'uppercase' },
    modalButtonSecondary: { backgroundColor: 'white', paddingVertical: 14, width: '100%', borderRadius: 30, alignItems: 'center', borderWidth: 2, borderColor: '#E5E7EB' },
    modalButtonSecondaryText: { color: '#D32F2F', fontWeight: 'bold', fontSize: 16 }
});

export default OrderingScreen;