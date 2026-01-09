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
    TextInput,
    Keyboard,
    Modal,
    Platform,
    Vibration // 1. Thêm Vibration
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';

import exerciseService from '../../../services/exerciseService';
import { EnglishListeningDictationResponse } from '../../../types/response/ExerciseResponse';

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
    inputBg: '#F9FAFB',
    audioBtn: '#60A5FA',
    disabledBtn: '#D1D5DB'
};

const ListeningDictationScreen = ({ route, navigation }: any) => {
    const { lessonId, lessonTitle, section, currentScore } = route.params || {};

    const [questions, setQuestions] = useState<EnglishListeningDictationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [totalScore, setTotalScore] = useState(currentScore || 0);

    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [playCount, setPlayCount] = useState(0);
    const MAX_PLAYS = 3;

    const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
    const [isFinished, setIsFinished] = useState(false);
    const [exitModalVisible, setExitModalVisible] = useState(false);

    const progressAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

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
        const configureAudio = async () => {
            try {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: false,
                    staysActiveInBackground: false,
                    playsInSilentModeIOS: true,
                    shouldDuckAndroid: true,
                    playThroughEarpieceAndroid: false,
                });
            } catch (e) {
                console.log("Lỗi cấu hình Audio:", e);
            }
        };
        configureAudio();
        fetchQuestions();
        return () => {
            if (sound) sound.unloadAsync();
        };
    }, []);

    useEffect(() => {
        const stopSound = async () => {
            if (sound) {
                try {
                    const status = await sound.getStatusAsync();
                    if (status.isLoaded) {
                        await sound.stopAsync();
                        await sound.unloadAsync();
                    }
                } catch (error) { }
                setSound(null);
            }
        };

        if (questions.length > 0) {
            stopSound();
            setUserInput('');
            setStatus('idle');
            setIsPlaying(false);
            setPlayCount(0);
            fadeAnim.setValue(0);
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
            Animated.timing(progressAnim, {
                toValue: (currentIndex + 1) / questions.length,
                duration: 500,
                useNativeDriver: false,
            }).start();
        }
    }, [currentIndex, questions]);

    useEffect(() => {
        if (isPlaying) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.1, duration: 500, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true })
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [isPlaying]);

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const response = await exerciseService.getListeningDictationForChallenge(lessonId);
            if (response && response.data) {
                setQuestions(response.data);
            }
        } catch (error) {
            Alert.alert("Lỗi", "Không thể tải bài tập nghe.");
        } finally {
            setLoading(false);
        }
    };

    const handlePlayAudio = async () => {
        const currentQ = questions[currentIndex];
        if (!currentQ.audioUrl) return;
        if (!isPlaying && playCount >= MAX_PLAYS) return;

        try {
            if (sound) {
                const status = await sound.getStatusAsync();
                if (status.isLoaded) {
                    if (status.isPlaying) {
                        await sound.pauseAsync();
                        setIsPlaying(false);
                    } else {
                        if (playCount >= MAX_PLAYS) return;
                        setPlayCount(prev => prev + 1);
                        if (status.positionMillis === status.durationMillis) await sound.replayAsync();
                        else await sound.playAsync();
                        setIsPlaying(true);
                    }
                } else {
                    await sound.unloadAsync();
                    setSound(null);
                }
            }

            if (!sound) {
                if (playCount >= MAX_PLAYS) return;
                setPlayCount(prev => prev + 1);
                const { sound: newSound } = await Audio.Sound.createAsync(
                    { uri: currentQ.audioUrl },
                    { shouldPlay: true }
                );
                setSound(newSound);
                setIsPlaying(true);
                newSound.setOnPlaybackStatusUpdate((status) => {
                    if (status.isLoaded && status.didJustFinish) {
                        setIsPlaying(false);
                        newSound.setPositionAsync(0);
                    }
                });
            }
        } catch (error) {
            setIsPlaying(false);
            setSound(null);
            Alert.alert("Lỗi Audio", "Không thể phát âm thanh này.");
        }
    };

    const normalizeText = (text: string) => {
        return text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
    };

    const handleCheck = () => {
        Keyboard.dismiss();
        const currentQ = questions[currentIndex];
        const userClean = normalizeText(userInput);
        const transcriptClean = normalizeText(currentQ.transcript);

        if (userClean === transcriptClean) {
            setStatus('correct');
            setTotalScore((prev: number) => prev + 5);
            playFeedbackSound(true); // 3. Phát âm thanh ĐÚNG
        } else {
            setStatus('wrong');
            playFeedbackSound(false); // 4. Phát âm thanh SAI
            Vibration.vibrate([0, 100, 100, 100]); // 5. Rung máy
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setIsFinished(true);
        }
    };

    const handleNextChallenge = () => {
        navigation.navigate('ClozeScreen', {
            lessonId,
            lessonTitle,
            section,
            currentScore: totalScore
        });
    };

    const handleBackToCoursePress = () => setExitModalVisible(true);
    const cancelExit = () => setExitModalVisible(false);
    const confirmExit = async () => {
        setExitModalVisible(false);
        if (sound) {
            try { await sound.stopAsync(); await sound.unloadAsync(); } catch (e) { }
        }
        navigation.navigate('AppTabs');
    };

    const getMascotState = () => {
        if (status === 'correct') return { image: happy, message: "Tai thính quá nha!" };
        if (status === 'wrong') return { image: sad, message: "Nghe lại thật kỹ nhé!" };
        const currentQ = questions[currentIndex];
        const hint = currentQ?.hintText || "Nghe và chép lại câu.";
        return { image: normal, message: hint };
    };

    if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

    if (isFinished) {
        return (
            <View style={styles.resultContainer}>
                <Modal animationType="fade" transparent={true} visible={exitModalVisible} onRequestClose={cancelExit}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalIconContainer}><Text style={styles.modalIconText}>!</Text></View>
                            <Text style={styles.modalTitle}>Khoan đã!</Text>
                            <Text style={styles.modalBody}>Nếu bạn rời đi bây giờ, toàn bộ tiến độ thử thách này sẽ bị mất...</Text>
                            <TouchableOpacity style={styles.modalButtonPrimary} onPress={cancelExit}><Text style={styles.modalButtonPrimaryText}>TIẾP TỤC THỬ THÁCH</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.modalButtonSecondary} onPress={confirmExit}><Text style={styles.modalButtonSecondaryText}>DỪNG LẠI VÀ THOÁT</Text></TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <View style={styles.resultCard}>
                    <Text style={{ fontSize: 60 }}>🎉</Text>
                    <Text style={styles.resultTitle}>Hoàn thành thử thách 3!</Text>
                    <TouchableOpacity style={styles.btnFinish} onPress={handleNextChallenge}><Text style={styles.btnFinishText}>Thử thách tiếp theo</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.btnFinish, { backgroundColor: 'transparent', marginTop: 15, borderWidth: 2, borderColor: '#E5E7EB', elevation: 0 }]} onPress={handleBackToCoursePress}><Text style={{ color: COLORS.subText, fontWeight: 'bold', fontSize: 16 }}>Quay lại khoá học</Text></TouchableOpacity>
                </View>
            </View>
        );
    }

    const currentQ = questions[currentIndex];
    const mascot = getMascotState();
    const isPlayDisabled = !isPlaying && playCount >= MAX_PLAYS;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
            <View style={styles.headerContainer}>
                <View style={styles.progressBarBg}>
                    <Animated.View style={[styles.progressBarFill, { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
                </View>
                <Text style={styles.progressText}>Câu {currentIndex + 1}/{questions.length}</Text>
            </View>

            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
                    <View style={styles.mascotContainer}>
                        <Image source={mascot.image} style={styles.mascotImage} resizeMode="contain" />
                        <View style={styles.bubbleWrapper}>
                            <View style={styles.speechBubble}><Text style={styles.speechText}>{mascot.message}</Text></View>
                            <View style={styles.bubbleArrow} />
                        </View>
                    </View>
                    <Text style={styles.questionTitle}>Nghe và viết lại câu hoàn chỉnh:</Text>
                    <View style={styles.audioContainer}>
                        <TouchableOpacity onPress={handlePlayAudio} activeOpacity={0.7} disabled={isPlayDisabled}>
                            <Animated.View style={[styles.audioButton, isPlayDisabled && { backgroundColor: COLORS.disabledBtn, shadowOpacity: 0 }, { transform: [{ scale: pulseAnim }] }]}>
                                <Text style={styles.audioIcon}>{isPlaying ? '❚❚' : '▶'}</Text>
                            </Animated.View>
                        </TouchableOpacity>
                        <Text style={[styles.tapToListenText, isPlayDisabled && { color: COLORS.error }]}>
                            {isPlaying ? 'Đang phát...' : isPlayDisabled ? 'Hết lượt nghe' : `Nhấn để nghe (Còn ${MAX_PLAYS - playCount} lần)`}
                        </Text>
                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={[styles.textInput, status === 'correct' && { borderColor: COLORS.success, backgroundColor: '#F0FDF4' }, status === 'wrong' && { borderColor: COLORS.error, backgroundColor: '#FEF2F2' }]}
                            placeholder="Nhập nội dung bạn nghe được..."
                            placeholderTextColor="#9CA3AF"
                            multiline
                            value={userInput}
                            onChangeText={setUserInput}
                            editable={status === 'idle'}
                        />
                    </View>
                </Animated.View>
            </ScrollView>

            {status === 'idle' ? (
                <View style={styles.footerIdle}>
                    <TouchableOpacity style={[styles.btnCheck, { backgroundColor: userInput.length === 0 ? '#E5E7EB' : COLORS.primary }]} onPress={handleCheck} disabled={userInput.length === 0}>
                        <Text style={[styles.btnCheckText, { color: userInput.length === 0 ? '#9CA3AF' : COLORS.white }]}>KIỂM TRA</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={[styles.footerFeedback, { backgroundColor: status === 'correct' ? COLORS.successBg : COLORS.errorBg }]}>
                    <View style={styles.feedbackHeader}>
                        <View style={[styles.iconCircle, { backgroundColor: status === 'correct' ? COLORS.success : COLORS.error }]}><Text style={styles.iconText}>{status === 'correct' ? '✓' : '✕'}</Text></View>
                        <View style={{ marginLeft: 12, flex: 1 }}>
                            <Text style={[styles.feedbackTitle, { color: status === 'correct' ? COLORS.success : COLORS.error }]}>{status === 'correct' ? 'Chính xác! 🎉' : 'Chưa đúng rồi! 😢'}</Text>
                            {status === 'wrong' && (
                                <View><Text style={styles.correctLabel}>Đáp án đúng:</Text><Text style={styles.correctText}>{currentQ.transcript}</Text></View>
                            )}
                        </View>
                    </View>
                    <TouchableOpacity style={[styles.btnNext, { backgroundColor: status === 'correct' ? COLORS.success : COLORS.error }]} onPress={handleNext}>
                        <Text style={styles.btnNextText}>TIẾP TỤC</Text>
                    </TouchableOpacity>
                </View>
            )}
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
    contentContainer: { padding: 20 },
    mascotContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 10 },
    mascotImage: { width: 100, height: 100, marginRight: 10 },
    bubbleWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 5 },
    speechBubble: { flex: 1, backgroundColor: COLORS.white, borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 16, padding: 12 },
    speechText: { color: '#4B5563', fontSize: 15, fontWeight: '600' },
    bubbleArrow: { position: 'absolute', left: -8, width: 16, height: 16, backgroundColor: COLORS.white, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: '#E5E7EB', transform: [{ rotate: '45deg' }] },
    questionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 20 },
    audioContainer: { alignItems: 'center', marginBottom: 30 },
    audioButton: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
    audioIcon: { color: 'white', fontSize: 30, fontWeight: 'bold' },
    tapToListenText: { marginTop: 10, color: COLORS.subText, fontSize: 14, fontWeight: '600' },
    inputContainer: { marginBottom: 20 },
    textInput: { backgroundColor: COLORS.inputBg, borderWidth: 2, borderColor: COLORS.borderDefault, borderRadius: 16, padding: 16, fontSize: 18, color: COLORS.text, minHeight: 120, textAlignVertical: 'top' },
    footerIdle: { padding: 20, borderTopWidth: 1, borderColor: '#F3F4F6' },
    btnCheck: { paddingVertical: 16, borderRadius: 16, alignItems: 'center', borderBottomWidth: 4, borderBottomColor: 'rgba(0,0,0,0.1)' },
    btnCheckText: { fontSize: 16, fontWeight: '800', textTransform: 'uppercase' },
    footerFeedback: { padding: 24, paddingBottom: 34 },
    feedbackHeader: { flexDirection: 'row', marginBottom: 20, alignItems: 'flex-start' },
    iconCircle: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
    iconText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    feedbackTitle: { fontSize: 20, fontWeight: '800', marginBottom: 5 },
    correctLabel: { color: COLORS.error, fontWeight: 'bold', fontSize: 14 },
    correctText: { color: COLORS.error, fontSize: 15, marginTop: 2 },
    btnNext: { paddingVertical: 16, borderRadius: 16, alignItems: 'center', width: '100%', borderBottomWidth: 4, borderBottomColor: 'rgba(0,0,0,0.1)' },
    btnNextText: { color: COLORS.white, fontSize: 16, fontWeight: '800', textTransform: 'uppercase' },
    resultContainer: { flex: 1, backgroundColor: COLORS.secondary, justifyContent: 'center', padding: 20 },
    resultCard: { backgroundColor: COLORS.white, borderRadius: 24, padding: 40, alignItems: 'center', elevation: 5 },
    resultTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginTop: 20, marginBottom: 10, textAlign: 'center' },
    resultScore: { fontSize: 18, color: COLORS.subText, marginBottom: 30, textAlign: 'center' },
    btnFinish: { backgroundColor: COLORS.primary, paddingVertical: 16, width: '100%', borderRadius: 30, alignItems: 'center', borderBottomWidth: 4, borderBottomColor: 'rgba(0,0,0,0.1)' },
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

export default ListeningDictationScreen;