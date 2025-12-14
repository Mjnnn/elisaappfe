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
    KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import exerciseService from '../../../services/exerciseService';
import { EnglishClozeExerciseResponse } from '../../../types/response/ExerciseResponse';

// --- ASSETS ---
import normal from '../../../../assets/images/logo/Elisa.png';
import happy from '../../../../assets/images/logo/Elisa_Happy.png';
import sad from '../../../../assets/images/logo/Elisa_Sad.png';

const { width } = Dimensions.get('window');

// --- COLORS ---
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
    highlight: '#EFF6FF', // Màu nền đoạn văn
};

const ClozeScreen = ({ route, navigation }: any) => {
    // Nhận params: currentScore là điểm tích lũy từ các màn trước
    const { lessonId, lessonTitle, section, currentScore } = route.params || {};
    console.log("Điểm thử thách: phần nghe và chép lại: ", currentScore);

    // --- STATE ---
    const [questions, setQuestions] = useState<EnglishClozeExerciseResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [totalScore, setTotalScore] = useState(currentScore || 0);

    // State lưu câu trả lời của user: { [blankId]: string }
    const [userInputs, setUserInputs] = useState<{ [key: number]: string }>({});

    // State lưu kết quả chấm: { [blankId]: 'correct' | 'wrong' }
    const [results, setResults] = useState<{ [key: number]: 'correct' | 'wrong' }>({});

    // Status chung của cả câu hỏi
    const [status, setStatus] = useState<'idle' | 'checked'>('idle');
    const [isFinished, setIsFinished] = useState(false);
    const [exitModalVisible, setExitModalVisible] = useState(false);

    // --- ANIMATION REFS ---
    const progressAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;

    // --- EFFECT: Load Data ---
    useEffect(() => {
        fetchQuestions();
    }, []);

    // Effect: Update Progress & Reset cho câu hỏi mới
    useEffect(() => {
        if (questions.length > 0) {
            // Reset state
            setUserInputs({});
            setResults({});
            setStatus('idle');

            // Animation Fade In nội dung
            fadeAnim.setValue(0);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true
            }).start();

            // Animation Progress Bar
            Animated.timing(progressAnim, {
                toValue: (currentIndex + 1) / questions.length,
                duration: 500,
                useNativeDriver: false,
            }).start();
        }
    }, [currentIndex, questions]);

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const response = await exerciseService.getClozeForChallenge(lessonId);
            if (response && response.data) {
                setQuestions(response.data);
            }
        } catch (error) {
            console.log("Lỗi tải bài tập điền từ:", error);
            Alert.alert("Lỗi", "Không thể tải dữ liệu.");
        } finally {
            setLoading(false);
        }
    };

    // --- LOGIC HELPER ---
    const handleInputChange = (text: string, blankId: number) => {
        setUserInputs(prev => ({
            ...prev,
            [blankId]: text
        }));
    };

    const normalizeText = (text: string) => {
        return text ? text.trim().toLowerCase() : '';
    };

    const handleCheck = () => {
        Keyboard.dismiss();
        const currentQ = questions[currentIndex];

        let earnedPoints = 0;
        const newResults: { [key: number]: 'correct' | 'wrong' } = {};
        let allCorrect = true;

        // Duyệt qua từng chỗ trống để chấm điểm
        currentQ.blanks.forEach(blank => {
            const userInput = normalizeText(userInputs[blank.id]);
            const correctAns = normalizeText(blank.correctAnswer);

            if (userInput === correctAns) {
                newResults[blank.id] = 'correct';
                earnedPoints += 2; // Cộng 2 điểm mỗi chỗ trống đúng
            } else {
                newResults[blank.id] = 'wrong';
                allCorrect = false;
            }
        });

        setResults(newResults);
        setTotalScore((prev: number) => prev + earnedPoints);
        setStatus('checked');
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setIsFinished(true);
        }
    };

    const handleNextChallenge = () => {
        // Chuyển sang màn hình tiếp theo: OrderingScreen (Sắp xếp đoạn văn)
        navigation.navigate('OrderingScreen', {
            lessonId,
            lessonTitle,
            section,
            currentScore: totalScore
        });
    };

    const handleBackToCoursePress = () => setExitModalVisible(true);
    const cancelExit = () => setExitModalVisible(false);
    const confirmExit = () => {
        setExitModalVisible(false);
        navigation.navigate('AppTabs');
    };

    // --- HELPER: Mascot Logic ---
    const getMascotState = () => {
        if (status === 'idle') {
            return { image: normal, message: "Điền từ còn thiếu vào chỗ trống nhé!" };
        }

        // Nếu đã check, xem có sai câu nào không
        const hasError = Object.values(results).includes('wrong');
        if (hasError) {
            return { image: sad, message: "Có vài chỗ chưa đúng, hãy xem lại nhé!" };
        }
        return { image: happy, message: "Xuất sắc! Bạn đã điền đúng hết!" };
    };

    // --- HELPER: Render Content with Inputs ---
    const renderClozeContent = () => {
        const currentQ = questions[currentIndex];
        if (!currentQ) return null;

        // Tách chuỗi dựa trên ký tự giữ chỗ
        const parts = currentQ.content.split('_____');

        return (
            <View style={styles.passageContainer}>
                <Text style={styles.passageText}>
                    {parts.map((part, index) => {
                        const textElement = <Text key={`text-${index}`} style={styles.textPart}>{part}</Text>;

                        if (index < parts.length - 1) {
                            const blankData = currentQ.blanks.find(b => b.blankIndex === index + 1);
                            if (!blankData) return textElement;

                            const blankId = blankData.id;
                            const res = results[blankId];

                            let inputBorderColor = COLORS.borderDefault;
                            let inputBgColor = COLORS.white;
                            let textColor = COLORS.text;

                            if (status === 'checked') {
                                if (res === 'correct') {
                                    inputBorderColor = COLORS.success;
                                    inputBgColor = '#F0FDF4';
                                    textColor = COLORS.success;
                                } else {
                                    inputBorderColor = COLORS.error;
                                    inputBgColor = '#FEF2F2';
                                    textColor = COLORS.error;
                                }
                            }

                            const inputElement = (
                                <View key={`blank-${blankId}`} style={styles.inlineInputWrapper}>
                                    <TextInput
                                        style={[
                                            styles.inlineInput,
                                            {
                                                borderColor: inputBorderColor,
                                                backgroundColor: inputBgColor,
                                                color: textColor
                                            }
                                        ]}
                                        placeholder={`(${index + 1})`}
                                        placeholderTextColor={COLORS.subText}
                                        onChangeText={(text) => handleInputChange(text, blankId)}
                                        value={userInputs[blankId] || ''}
                                        editable={status === 'idle'}
                                        autoCapitalize="none"
                                    />
                                    {/* Hiển thị đáp án đúng nếu sai */}
                                    {status === 'checked' && res === 'wrong' && (
                                        <Text style={styles.correctionText}>{blankData.correctAnswer}</Text>
                                    )}
                                </View>
                            );

                            return (
                                <Text key={`group-${index}`}>
                                    {textElement}
                                    {inputElement}
                                </Text>
                            );
                        }
                        return textElement;
                    })}
                </Text>
            </View>
        );
    };

    // --- RENDER ---
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    // Màn hình kết quả
    if (isFinished) {
        return (
            <View style={styles.resultContainer}>
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={exitModalVisible}
                    onRequestClose={cancelExit}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalIconContainer}>
                                <Text style={styles.modalIconText}>!</Text>
                            </View>
                            <Text style={styles.modalTitle}>Khoan đã!</Text>
                            <Text style={styles.modalBody}>
                                Nếu bạn rời đi bây giờ, toàn bộ tiến độ bài học này sẽ bị mất. Bạn có chắc chắn muốn thoát không?
                            </Text>
                            <TouchableOpacity style={styles.modalButtonPrimary} onPress={cancelExit}>
                                <Text style={styles.modalButtonPrimaryText}>TIẾP TỤC THỬ THÁCH</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalButtonSecondary} onPress={confirmExit}>
                                <Text style={styles.modalButtonSecondaryText}>DỪNG LẠI VÀ THOÁT</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <View style={styles.resultCard}>
                    <Text style={{ fontSize: 60 }}>🎉</Text>
                    <Text style={styles.resultTitle}>Hoàn thành thử thách 4!</Text>
                    <Text style={styles.resultScore}>
                        Bạn đã hoàn thành phần điền từ.
                    </Text>

                    <TouchableOpacity style={styles.btnFinish} onPress={handleNextChallenge}>
                        <Text style={styles.btnFinishText}>Thử thách tiếp theo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.btnFinish, { backgroundColor: 'transparent', marginTop: 15, borderWidth: 2, borderColor: '#E5E7EB', elevation: 0 }]}
                        onPress={handleBackToCoursePress}
                    >
                        <Text style={{ color: COLORS.subText, fontWeight: 'bold', fontSize: 16 }}>Quay lại khoá học</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const currentQ = questions[currentIndex];
    const mascot = getMascotState();
    const isAllFilled = currentQ.blanks.every(b => userInputs[b.id] && userInputs[b.id].trim().length > 0);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

            {/* HEADER */}
            <View style={styles.headerContainer}>
                <View style={styles.progressBarBg}>
                    <Animated.View
                        style={[
                            styles.progressBarFill,
                            {
                                width: progressAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0%', '100%']
                                })
                            }
                        ]}
                    />
                </View>
                <Text style={styles.progressText}>
                    Câu {currentIndex + 1}/{questions.length}
                </Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                    <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>

                        <View style={styles.mascotContainer}>
                            <Image source={mascot.image} style={styles.mascotImage} resizeMode="contain" />
                            <View style={styles.bubbleWrapper}>
                                <View style={styles.speechBubble}>
                                    <Text style={styles.speechText}>{mascot.message}</Text>
                                </View>
                                <View style={styles.bubbleArrow} />
                            </View>
                        </View>

                        <Text style={styles.questionTitle}>{currentQ.title}</Text>

                        {renderClozeContent()}

                        <View style={styles.hintContainer}>
                            <Text style={styles.hintLabel}>Gợi ý:</Text>
                            {currentQ.blanks.map((blank) => (
                                <Text key={blank.id} style={styles.hintText}>
                                    ({blank.blankIndex}) {blank.hint}
                                </Text>
                            ))}
                        </View>

                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* FOOTER */}
            {status === 'idle' ? (
                <View style={styles.footerIdle}>
                    <TouchableOpacity
                        style={[
                            styles.btnCheck,
                            { backgroundColor: !isAllFilled ? '#E5E7EB' : COLORS.primary }
                        ]}
                        onPress={handleCheck}
                        disabled={!isAllFilled}
                    >
                        <Text style={[
                            styles.btnCheckText,
                            { color: !isAllFilled ? '#9CA3AF' : COLORS.white }
                        ]}>KIỂM TRA</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={[
                    styles.footerFeedback,
                    { backgroundColor: Object.values(results).includes('wrong') ? COLORS.errorBg : COLORS.successBg }
                ]}>
                    <View style={styles.feedbackHeader}>
                        <View style={[
                            styles.iconCircle,
                            { backgroundColor: Object.values(results).includes('wrong') ? COLORS.error : COLORS.success }
                        ]}>
                            <Text style={styles.iconText}>{Object.values(results).includes('wrong') ? '✕' : '✓'}</Text>
                        </View>
                        <View style={{ marginLeft: 12, flex: 1 }}>
                            <Text style={[
                                styles.feedbackTitle,
                                { color: Object.values(results).includes('wrong') ? COLORS.error : COLORS.success }
                            ]}>
                                {Object.values(results).includes('wrong') ? 'Chưa chính xác hoàn toàn! 😢' : 'Chính xác! 🎉'}
                            </Text>
                            {Object.values(results).includes('wrong') && (
                                <Text style={styles.correctText}>Hãy xem đáp án đúng màu đỏ ở trên nhé.</Text>
                            )}
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.btnNext,
                            { backgroundColor: Object.values(results).includes('wrong') ? COLORS.error : COLORS.success }
                        ]}
                        onPress={handleNext}
                    >
                        <Text style={styles.btnNextText}>TIẾP TỤC</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

// --- STYLE FIX ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    headerContainer: { paddingHorizontal: 20, paddingTop: 10, backgroundColor: COLORS.white },
    progressBarBg: { height: 12, backgroundColor: '#E5E5E5', borderRadius: 8, overflow: 'hidden', width: '100%' },
    progressBarFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 8 },
    progressText: { marginTop: 10, textAlign: 'center', color: COLORS.subText, fontWeight: 'bold', fontSize: 14 },

    contentContainer: { padding: 20 },
    mascotContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 10 },
    mascotImage: { width: 80, height: 80, marginRight: 10 },
    bubbleWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 5 },
    speechBubble: { flex: 1, backgroundColor: COLORS.white, borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 16, padding: 12 },
    speechText: { color: '#4B5563', fontSize: 15, fontWeight: '600' },
    bubbleArrow: { position: 'absolute', left: -8, width: 16, height: 16, backgroundColor: COLORS.white, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: '#E5E7EB', transform: [{ rotate: '45deg' }] },

    questionTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 15 },

    // Passage & Inputs (ĐÃ SỬA: Tăng line height và dùng transform đẩy input xuống)
    passageContainer: {
        backgroundColor: COLORS.highlight,
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#DBEAFE'
    },
    passageText: {
        fontSize: 18,
        lineHeight: 45, // Tăng lên 45 để các dòng cách xa nhau, đủ chỗ cho input
        color: COLORS.text,
        fontWeight: '500',
    },
    textPart: {
        fontSize: 18,
        color: COLORS.text,
    },
    inlineInputWrapper: {
        width: 85,
        height: 32,
        justifyContent: 'center',
        marginHorizontal: 4,
        // Dùng transform để đẩy ô input xuống cho thẳng hàng với chữ (baseline alignment)
        transform: [{ translateY: 12 }]
    },
    inlineInput: {
        borderBottomWidth: 2,
        height: 32,
        paddingVertical: 0,
        paddingHorizontal: 5,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        minWidth: 80,
    },
    correctionText: {
        position: 'absolute',
        top: -18,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.error,
        backgroundColor: 'rgba(255,255,255,0.9)'
    },

    hintContainer: {
        marginTop: 10,
        padding: 15,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
    },
    hintLabel: { fontSize: 14, fontWeight: 'bold', color: COLORS.subText, marginBottom: 5 },
    hintText: { fontSize: 14, color: '#4B5563', marginBottom: 4, fontStyle: 'italic' },

    footerIdle: { padding: 20, borderTopWidth: 1, borderColor: '#F3F4F6' },
    btnCheck: { paddingVertical: 16, borderRadius: 16, alignItems: 'center', borderBottomWidth: 4, borderBottomColor: 'rgba(0,0,0,0.1)' },
    btnCheckText: { fontSize: 16, fontWeight: '800', textTransform: 'uppercase' },

    footerFeedback: { padding: 24, paddingBottom: 34 },
    feedbackHeader: { flexDirection: 'row', marginBottom: 20, alignItems: 'flex-start' },
    iconCircle: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
    iconText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    feedbackTitle: { fontSize: 20, fontWeight: '800', marginBottom: 5 },
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

export default ClozeScreen;