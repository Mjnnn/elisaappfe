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
    Platform,
    LayoutAnimation,
    UIManager,
    Modal // Thêm Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import exerciseService from '../../../services/exerciseService';
import { EnglishSentenceRewritingResponse } from '../../../types/response/EnglishSentenceRewritingResponse';

// Kích hoạt LayoutAnimation cho Android
if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
    wordBorder: '#3B82F6', // Viền xanh cho từ
    wordBg: '#EFF6FF',     // Nền xanh nhạt cho từ
};

interface WordItem {
    id: string;
    text: string;
}

const SentenceRewritingScreen = ({ route, navigation }: any) => {
    // Nhận params từ màn hình trước
    const { lessonId, lessonTitle, section, currentScore } = route.params || {};
    console.log("Điểm thử thách: phần trắc nghiệm: ", currentScore);

    // --- STATE ---
    const [questions, setQuestions] = useState<EnglishSentenceRewritingResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Tổng điểm tích lũy
    const [totalScore, setTotalScore] = useState(currentScore);

    // State xử lý từ vựng
    const [originalWords, setOriginalWords] = useState<WordItem[]>([]); // Từ ở hàng chờ
    const [userSentence, setUserSentence] = useState<WordItem[]>([]);   // Từ người dùng đã chọn

    // Trạng thái kiểm tra
    const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
    const [isFinished, setIsFinished] = useState(false);

    // --- NEW STATE: Modal Visibility ---
    const [exitModalVisible, setExitModalVisible] = useState(false);

    // --- ANIMATION REFS ---
    const progressAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;

    // --- EFFECT: Lấy dữ liệu ---
    useEffect(() => {
        fetchQuestions();
    }, []);

    // Effect: Chuẩn bị câu hỏi mới khi index thay đổi
    useEffect(() => {
        if (questions.length > 0 && currentIndex < questions.length) {
            prepareQuestion(questions[currentIndex]);

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
            const response = await exerciseService.getSentenceRewritingForChallenge(lessonId);
            if (response && response.data) {
                setQuestions(response.data);
            }
        } catch (error) {
            console.log("Lỗi lấy câu hỏi:", error);
            Alert.alert("Lỗi", "Không thể tải câu hỏi.");
        } finally {
            setLoading(false);
        }
    };

    // Chuẩn bị từ vựng cho câu hỏi
    const prepareQuestion = (question: EnglishSentenceRewritingResponse) => {
        // Tách chuỗi thành mảng các từ. API trả về "word1, word2, ..." -> split
        // Xử lý loại bỏ khoảng trắng thừa
        const words = question.originalSentence.split(',').map(w => w.trim());

        // Tạo object có ID riêng biệt để xử lý các từ giống nhau
        const wordItems: WordItem[] = words.map((text, index) => ({
            id: `${index}-${text}-${Date.now()}`,
            text: text
        }));

        setOriginalWords(wordItems);
        setUserSentence([]); // Reset câu trả lời
        setStatus('idle');

        // Fade in animation
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true
        }).start();
    };

    // --- LOGIC DI CHUYỂN TỪ (QUAN TRỌNG) ---
    const handleWordClick = (word: WordItem, from: 'bank' | 'answer') => {
        if (status !== 'idle') return; // Không cho sửa khi đã check

        // Kích hoạt hiệu ứng chuyển động layout
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        if (from === 'bank') {
            // Chuyển từ Bank -> Answer
            setOriginalWords(prev => prev.filter(w => w.id !== word.id));
            setUserSentence(prev => [...prev, word]);
        } else {
            // Chuyển từ Answer -> Bank
            setUserSentence(prev => prev.filter(w => w.id !== word.id));
            setOriginalWords(prev => [...prev, word]);
        }
    };

    // --- LOGIC KIỂM TRA ĐÁP ÁN ---
    const handleCheck = () => {
        const currentQ = questions[currentIndex];

        // 1. Nối các từ lại với nhau bằng dấu cách
        let userString = userSentence.map(w => w.text).join(' ');

        // 2. QUAN TRỌNG: Xóa khoảng trắng thừa trước các dấu câu (. , ? ! : ;)
        // Ví dụ: biến đổi "morning ?" thành "morning?"
        userString = userString.replace(/\s+([.,!?:;])/g, '$1');

        // 3. So sánh (chuyển về chữ thường và bỏ khoảng trắng đầu cuối để chắc chắn)
        const isCorrect = userString.trim().toLowerCase() === currentQ.rewrittenSentence.trim().toLowerCase();

        if (isCorrect) {
            setStatus('correct');
            // Cộng điểm (giữ nguyên logic cộng điểm của bạn)
            setTotalScore((prev: number) => prev + 4);
        } else {
            setStatus('wrong');
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setIsFinished(true);
        }
    };

    // --- LOGIC NAVIGATION MỚI ---
    const handleNextChallenge = () => {
        // Chuyển sang màn hình tiếp theo (ListeningDictation)
        // Truyền tiếp tổng điểm (totalScore)
        navigation.navigate('ListeningDictationScreen', {
            lessonId,
            lessonTitle: route.params?.lessonTitle,
            section: section,
            currentScore: totalScore
        });
    };

    const handleBackToCoursePress = () => {
        setExitModalVisible(true);
    };

    const confirmExit = () => {
        setExitModalVisible(false);
        navigation.navigate('AppTabs');
    };

    const cancelExit = () => {
        setExitModalVisible(false);
    };

    // --- HELPER: Mascot ---
    const getMascotState = () => {
        if (status === 'correct') return { image: happy, message: "Tuyệt vời ông mặt trời!" };
        if (status === 'wrong') return { image: sad, message: "Ôi không, sai mất rồi!" };
        return { image: normal, message: "Sắp xếp lại câu nhé!" };
    };

    // --- RENDER ---
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (isFinished) {
        return (
            <View style={styles.resultContainer}>
                {/* --- MODAL CẢNH BÁO THOÁT --- */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={exitModalVisible}
                    onRequestClose={cancelExit}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            {/* Icon Cảnh báo */}
                            <View style={styles.modalIconContainer}>
                                <Text style={styles.modalIconText}>!</Text>
                            </View>

                            <Text style={styles.modalTitle}>Khoan đã!</Text>

                            <Text style={styles.modalBody}>
                                Nếu bạn rời đi bây giờ, toàn bộ tiến độ thử thách này sẽ bị mất và khi bạn thử thách lại thì bạn sẽ làm lại từ đầu. Bạn có chắc chắn muốn thoát không?
                            </Text>

                            {/* Nút Tiếp tục học */}
                            <TouchableOpacity
                                style={styles.modalButtonPrimary}
                                onPress={cancelExit}
                            >
                                <Text style={styles.modalButtonPrimaryText}>TIẾP TỤC THỬ THÁCH</Text>
                            </TouchableOpacity>

                            {/* Nút Dừng lại và thoát */}
                            <TouchableOpacity
                                style={styles.modalButtonSecondary}
                                onPress={confirmExit}
                            >
                                <Text style={styles.modalButtonSecondaryText}>DỪNG LẠI VÀ THOÁT</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                {/* ----------------------------- */}

                <View style={styles.resultCard}>
                    {/* Icon hoặc Emoji chúc mừng */}
                    <Text style={{ fontSize: 60 }}>🎉</Text>

                    <Text style={styles.resultTitle}>Hoàn thành thử thách 2!</Text>

                    <Text style={styles.resultScore}>
                        Bạn đã hoàn thành phần ghép câu.
                    </Text>

                    {/* Nút Thử thách tiếp theo */}
                    <TouchableOpacity style={styles.btnFinish} onPress={handleNextChallenge}>
                        <Text style={styles.btnFinishText}>Thử thách tiếp theo</Text>
                    </TouchableOpacity>

                    {/* Nút Quay lại khoá học */}
                    <TouchableOpacity
                        style={[
                            styles.btnFinish,
                            {
                                backgroundColor: 'transparent',
                                marginTop: 15,
                                borderWidth: 2,
                                borderColor: '#E5E7EB',
                                elevation: 0
                            }
                        ]}
                        onPress={handleBackToCoursePress}
                    >
                        <Text style={{ color: COLORS.subText, fontWeight: 'bold', fontSize: 16 }}>
                            Quay lại khoá học
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const currentQ = questions[currentIndex];
    const mascot = getMascotState();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

            {/* HEADER PROGRESS (Đã sửa đổi theo yêu cầu)  */}
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
                {/* Hiển thị số câu hỏi (Câu X/Y) thay vì điểm số */}
                <Text style={styles.progressText}>
                    Câu {currentIndex + 1}/{questions.length}
                </Text>
            </View>

            <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>

                    {/* MASCOT AREA */}
                    <View style={styles.mascotContainer}>
                        <Image source={mascot.image} style={styles.mascotImage} resizeMode="contain" />
                        <View style={styles.bubbleWrapper}>
                            <View style={styles.speechBubble}>
                                <Text style={styles.speechText}>{mascot.message}</Text>
                            </View>
                            <View style={styles.bubbleArrow} />
                        </View>
                    </View>

                    <Text style={styles.label}>Sắp xếp lại câu:</Text>

                    {/* ANSWER AREA (Dòng kẻ + Từ đã chọn) */}
                    <View style={styles.answerArea}>
                        <View style={styles.linesContainer}>
                            <View style={styles.line} />
                            <View style={styles.line} />
                        </View>
                        <View style={styles.wordsWrap}>
                            {userSentence.map((word) => (
                                <TouchableOpacity
                                    key={word.id}
                                    style={styles.wordChipSelected}
                                    onPress={() => handleWordClick(word, 'answer')}
                                    disabled={status !== 'idle'}
                                >
                                    <Text style={styles.wordTextSelected}>{word.text}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* WORD BANK AREA (Từ để chọn) */}
                    <View style={styles.wordBankArea}>
                        {originalWords.map((word) => (
                            <TouchableOpacity
                                key={word.id}
                                style={styles.wordChip}
                                onPress={() => handleWordClick(word, 'bank')}
                                disabled={status !== 'idle'}
                            >
                                <Text style={styles.wordText}>{word.text}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                </Animated.View>
            </ScrollView>

            {/* FOOTER ACTION */}
            {status === 'idle' ? (
                <View style={styles.footerIdle}>
                    <TouchableOpacity
                        style={[
                            styles.btnCheck,
                            { backgroundColor: userSentence.length === 0 ? '#E5E7EB' : COLORS.primary }
                        ]}
                        onPress={handleCheck}
                        disabled={userSentence.length === 0}
                    >
                        <Text style={[
                            styles.btnCheckText,
                            { color: userSentence.length === 0 ? '#9CA3AF' : COLORS.white }
                        ]}>KIỂM TRA</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                /* FOOTER FEEDBACK (Correct/Wrong) */
                <View style={[
                    styles.footerFeedback,
                    { backgroundColor: status === 'correct' ? COLORS.successBg : COLORS.errorBg }
                ]}>
                    <View style={styles.feedbackHeader}>
                        <View style={[
                            styles.iconCircle,
                            { backgroundColor: status === 'correct' ? COLORS.success : COLORS.error }
                        ]}>
                            <Text style={styles.iconText}>{status === 'correct' ? '✓' : '✕'}</Text>
                        </View>
                        <View style={{ marginLeft: 12, flex: 1 }}>
                            <Text style={[
                                styles.feedbackTitle,
                                { color: status === 'correct' ? COLORS.success : COLORS.error }
                            ]}>
                                {status === 'correct' ? 'Chính xác! 🎉' : 'Chưa đúng rồi! 😢'}
                            </Text>
                            {status === 'wrong' && (
                                <View>
                                    <Text style={styles.correctLabel}>Đáp án đúng:</Text>
                                    <Text style={styles.correctText}>{currentQ.rewrittenSentence}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.btnNext,
                            { backgroundColor: status === 'correct' ? COLORS.success : COLORS.error }
                        ]}
                        onPress={handleNext}
                    >
                        <Text style={styles.btnNextText}>
                            {status === 'correct' ? 'TIẾP TỤC' : 'TIẾP TỤC'}
                            {/* Logic: Button text theo yêu cầu, nhưng hành động hiện tại là Next question */}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    // HEADER (Updated Styles)
    headerContainer: {
        paddingHorizontal: 20,
        paddingTop: 10,
        backgroundColor: COLORS.white,
    },
    progressBarBg: {
        height: 12,
        backgroundColor: '#E5E5E5',
        borderRadius: 8,
        overflow: 'hidden',
        width: '100%',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 8,
    },
    progressText: {
        marginTop: 10,
        textAlign: 'center', // Căn giữa text
        color: COLORS.subText,
        fontWeight: 'bold',
        fontSize: 14,
    },
    // CONTENT
    contentContainer: {
        padding: 20,
    },
    mascotContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 10
    },
    mascotImage: {
        width: 80,
        height: 80,
        marginRight: 10,
    },
    bubbleWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 5
    },
    speechBubble: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        padding: 12,
    },
    speechText: {
        color: '#4B5563',
        fontSize: 15,
        fontWeight: '600',
    },
    bubbleArrow: {
        position: 'absolute',
        left: -8,
        width: 16,
        height: 16,
        backgroundColor: COLORS.white,
        borderBottomWidth: 2,
        borderLeftWidth: 2,
        borderColor: '#E5E7EB',
        transform: [{ rotate: '45deg' }],
    },
    label: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 20,
    },

    // ANSWER AREA
    answerArea: {
        minHeight: 120, // Đủ chỗ cho nhiều dòng
        marginBottom: 30,
        justifyContent: 'center' // Căn giữa nội dung nếu ít
    },
    linesContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'space-evenly',
        zIndex: -1
    },
    line: {
        height: 2,
        backgroundColor: '#E5E7EB',
        width: '100%',
        marginVertical: 25 // Khoảng cách các dòng kẻ
    },
    wordsWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        alignItems: 'flex-start',
    },

    // WORD BANK AREA
    wordBankArea: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        marginTop: 10
    },

    // WORD CHIP STYLES
    wordChip: {
        backgroundColor: COLORS.white,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        // Hiệu ứng 3D nhẹ dưới đáy
        borderBottomWidth: 3,
    },
    wordText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4B5563',
    },
    // Selected Word (trong Answer Area)
    wordChipSelected: {
        backgroundColor: COLORS.white,
        borderWidth: 1.5,
        borderColor: COLORS.primary, // Viền xanh dương như ảnh mẫu
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 16,
        // Shadow xanh nhẹ
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        elevation: 2,
        borderBottomWidth: 3,
    },
    wordTextSelected: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.primary, // Chữ xanh dương
    },

    // FOOTERS
    footerIdle: {
        padding: 20,
        borderTopWidth: 1,
        borderColor: '#F3F4F6'
    },
    btnCheck: {
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        borderBottomWidth: 4,
        borderBottomColor: 'rgba(0,0,0,0.1)'
    },
    btnCheckText: {
        fontSize: 16,
        fontWeight: '800',
        textTransform: 'uppercase'
    },

    footerFeedback: {
        padding: 24,
        paddingBottom: 34,
    },
    feedbackHeader: {
        flexDirection: 'row',
        marginBottom: 20,
        alignItems: 'flex-start'
    },
    iconCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2
    },
    iconText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    },
    feedbackTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 5
    },
    correctLabel: {
        color: COLORS.error,
        fontWeight: 'bold',
        fontSize: 14,
    },
    correctText: {
        color: COLORS.error,
        fontSize: 15,
        marginTop: 2
    },
    btnNext: {
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        width: '100%',
        borderBottomWidth: 4,
        borderBottomColor: 'rgba(0,0,0,0.1)'
    },
    btnNextText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '800',
        textTransform: 'uppercase'
    },

    // Result Screen & Modal Styles
    resultContainer: {
        flex: 1,
        backgroundColor: COLORS.secondary,
        justifyContent: 'center',
        padding: 20
    },
    resultCard: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 40,
        alignItems: 'center',
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    resultTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: 20,
        marginBottom: 10,
        textAlign: 'center'
    },
    resultScore: {
        fontSize: 18,
        color: COLORS.subText,
        marginBottom: 30,
        textAlign: 'center'
    },
    btnFinish: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        width: '100%',
        borderRadius: 30,
        alignItems: 'center',
        borderBottomWidth: 4,
        borderBottomColor: 'rgba(0,0,0,0.1)'
    },
    btnFinishText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 16
    },

    // --- MODAL STYLES ---
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        width: '100%',
        maxWidth: 350,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFE5E5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15
    },
    modalIconText: {
        color: '#D32F2F',
        fontSize: 40,
        fontWeight: 'bold'
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10
    },
    modalBody: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 22
    },
    modalButtonPrimary: {
        backgroundColor: '#4285F4',
        paddingVertical: 14,
        width: '100%',
        borderRadius: 30,
        alignItems: 'center',
        marginBottom: 12,
        borderBottomWidth: 4,
        borderBottomColor: '#2b6cdb'
    },
    modalButtonPrimaryText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        textTransform: 'uppercase'
    },
    modalButtonSecondary: {
        backgroundColor: 'white',
        paddingVertical: 14,
        width: '100%',
        borderRadius: 30,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    modalButtonSecondaryText: {
        color: '#D32F2F',
        fontWeight: 'bold',
        fontSize: 16
    }
});

export default SentenceRewritingScreen;