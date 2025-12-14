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
    Modal // Thêm Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import exerciseService from '../../../services/exerciseService';
import { EnglishMultipleChoiceResponse } from '../../../types/response/EnglishMultipleChoiceResponse';

// --- ASSETS ---
// Đảm bảo đường dẫn này đúng với project của bạn
import normal from '../../../../assets/images/logo/Elisa.png';
import happy from '../../../../assets/images/logo/Elisa_Happy.png';
import sad from '../../../../assets/images/logo/Elisa_Sad.png';

const { width } = Dimensions.get('window');

// Màu sắc chủ đạo (Tinh chỉnh lại cho giống ảnh mẫu hơn)
const COLORS = {
    primary: '#3B82F6',    // Màu xanh lá chủ đạo (giống Duolingo/Elisa)
    secondary: '#F5F7FA',
    success: '#58CC02',    // Xanh lá đậm cho text/border
    successBg: '#D7FFB8',  // Xanh lá nhạt cho background
    error: '#FF4B4B',      // Đỏ đậm
    errorBg: '#FFDFE0',    // Đỏ nhạt
    white: '#FFFFFF',
    text: '#2D3436',
    subText: '#636E72',
    borderDefault: '#E5E7EB', // Màu viền xám mặc định
    bubbleBorder: '#E5E7EB',
};

const MultipleChoiceScreen = ({ route, navigation }: any) => {

    const { lessonId, lessonTitle, section } = route.params;

    // --- STATE ---
    const [questions, setQuestions] = useState<EnglishMultipleChoiceResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Sửa logic: Biến score giờ sẽ lưu điểm số thực (float), khởi tạo là 0
    const [score, setScore] = useState(0);

    // Trạng thái câu trả lời hiện tại
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [isFinished, setIsFinished] = useState(false);

    // --- NEW STATE: Modal Visibility ---
    const [exitModalVisible, setExitModalVisible] = useState(false);

    // --- ANIMATION REFS ---
    const progressAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    // --- EFFECT: Lấy dữ liệu ---
    useEffect(() => {
        fetchQuestions();
    }, []);

    // Cập nhật thanh tiến trình mỗi khi index thay đổi
    useEffect(() => {
        if (questions.length > 0) {
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
            const response = await exerciseService.getMultipleChoiceForChallenge(lessonId);
            if (response && response.data) {
                setQuestions(response.data);
            }
        } catch (error) {
            console.log("Lỗi lấy câu hỏi:", error);
            Alert.alert("Lỗi", "Không thể tải câu hỏi. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    // --- LOGIC HELPER: Lấy trạng thái Linh vật ---
    const getMascotState = () => {
        if (!selectedOption) {
            return { image: normal, message: "Cố lên bạn ơi!", emotion: 'normal' };
        }
        if (isCorrect) {
            return { image: happy, message: "Tuyệt vời ông mặt trời!", emotion: 'happy' };
        }
        return { image: sad, message: "Ôi không, sai mất rồi!", emotion: 'sad' };
    };

    // --- LOGIC XỬ LÝ (Đã cập nhật tính điểm) ---
    const handleOptionSelect = (optionValue: string) => {
        if (selectedOption) return;

        const currentQuestion = questions[currentIndex];
        const isAnswerCorrect = optionValue === currentQuestion.correctAnswer;

        setSelectedOption(optionValue);
        setIsCorrect(isAnswerCorrect);

        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();

        if (isAnswerCorrect) {
            // CẬP NHẬT: Cộng 1.5 điểm nếu đúng
            setScore(prev => prev + 1.5);
        } else {
            // Nếu sai thì không cộng điểm
        }
    };

    const handleNextQuestion = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true
        }).start(() => {
            setSelectedOption(null);
            setIsCorrect(null);

            if (currentIndex < questions.length - 1) {
                setCurrentIndex(prev => prev + 1);
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true
                }).start();
            } else {
                setIsFinished(true);
            }
        });
    };

    // --- LOGIC NAVIGATION MỚI ---
    const handleNextChallenge = () => {
        // Chuyển sang màn hình ghép câu và truyền điểm số hiện tại
        //console.log("Điểm thử thách: phần trắc nghiệm: ", score);
        navigation.navigate('SentenceRewritingScreen', {
            lessonId: lessonId,
            lessonTitle: lessonTitle,
            section: section,
            currentScore: score // Điểm tích lũy từ phần trắc nghiệm
        });

    };

    // Hàm kích hoạt modal cảnh báo
    const handleBackToCoursePress = () => {
        setExitModalVisible(true);
    };

    // Hàm xác nhận thoát (Dừng lại và thoát)
    const confirmExit = () => {
        setExitModalVisible(false);
        navigation.navigate('AppTabs');
    };

    // Hàm hủy thoát (Tiếp tục học)
    const cancelExit = () => {
        setExitModalVisible(false);
    };

    // --- RENDER HELPERS ---
    const renderOption = (optionLabel: string, optionValue: string) => {
        const currentQuestion = questions[currentIndex];
        const isSelected = selectedOption === optionValue;
        const isResultCorrect = currentQuestion.correctAnswer === optionValue;

        // Mặc định (chưa chọn)
        let backgroundColor = COLORS.white;
        let borderColor = COLORS.borderDefault;
        let borderWidth = 2;
        let labelColor = COLORS.text;

        // Trạng thái hiển thị icon bên phải (Radio hoặc Check/X)
        let RightIconComponent = <View style={styles.radioCircle} />;

        if (selectedOption) {
            if (isResultCorrect) {
                // ĐÁP ÁN ĐÚNG
                backgroundColor = COLORS.successBg;
                borderColor = COLORS.success;
                RightIconComponent = (
                    <View style={[styles.statusIcon, { backgroundColor: COLORS.success }]}>
                        <Text style={styles.iconText}>✓</Text>
                    </View>
                );
            } else if (isSelected && !isCorrect) {
                // ĐÁP ÁN SAI
                backgroundColor = COLORS.errorBg;
                borderColor = COLORS.error;
                RightIconComponent = (
                    <View style={[styles.statusIcon, { backgroundColor: COLORS.error }]}>
                        <Text style={styles.iconText}>✕</Text>
                    </View>
                );
            } else {
                borderColor = COLORS.borderDefault;
            }
        }

        return (
            <TouchableOpacity
                key={optionLabel}
                activeOpacity={0.9}
                onPress={() => handleOptionSelect(optionValue)}
                disabled={!!selectedOption}
                style={[
                    styles.optionCard,
                    {
                        backgroundColor,
                        borderColor,
                        borderWidth,
                        transform: [{ scale: isSelected ? scaleAnim : 1 }]
                    }
                ]}
            >
                <View style={styles.optionLabelContainer}>
                    <Text style={styles.optionLabelText}>{optionLabel}</Text>
                </View>

                <Text style={styles.optionText}>{optionValue}</Text>

                <View style={styles.rightIconContainer}>
                    {RightIconComponent}
                </View>
            </TouchableOpacity>
        );
    };

    // --- MÀN HÌNH KẾT QUẢ / CHUYỂN TIẾP ---
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
                            {/* Icon Cảnh báo (Vòng tròn đỏ + dấu chấm than) */}
                            <View style={styles.modalIconContainer}>
                                <Text style={styles.modalIconText}>!</Text>
                            </View>

                            <Text style={styles.modalTitle}>Khoan đã!</Text>

                            <Text style={styles.modalBody}>
                                Nếu bạn rời đi bây giờ, toàn bộ tiến độ thử thách này sẽ bị mất và khi bạn thử thách lại thì bạn sẽ làm lại từ đầu. Bạn có chắc chắn muốn thoát không?
                            </Text>

                            {/* Nút Tiếp tục học (Xanh) */}
                            <TouchableOpacity
                                style={styles.modalButtonPrimary}
                                onPress={cancelExit}
                            >
                                <Text style={styles.modalButtonPrimaryText}>TIẾP TỤC THỬ THÁCH</Text>
                            </TouchableOpacity>

                            {/* Nút Dừng lại và thoát (Trắng viền đỏ) */}
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

                    <Text style={styles.resultTitle}>Hoàn thành thử thách 1!</Text>

                    <Text style={styles.resultScore}>
                        Bạn đã hoàn thành phần trắc nghiệm.
                    </Text>

                    {/* Nút Thử thách tiếp theo */}
                    <TouchableOpacity style={styles.restartButton} onPress={handleNextChallenge}>
                        <Text style={styles.restartButtonText}>Thử thách tiếp theo</Text>
                    </TouchableOpacity>

                    {/* Nút Quay lại khoá học (Kích hoạt Modal) */}
                    <TouchableOpacity
                        style={[
                            styles.restartButton,
                            {
                                backgroundColor: 'transparent',
                                marginTop: 15,
                                borderWidth: 2,
                                borderColor: '#E5E7EB'
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

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{ marginTop: 10, color: COLORS.subText }}>Đang tải câu hỏi...</Text>
            </View>
        );
    }

    const currentQ = questions[currentIndex];
    const mascotState = getMascotState();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

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

            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
                <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>

                    {/* MASCOT */}
                    <View style={styles.mascotContainer}>
                        <Image source={mascotState.image} style={styles.mascotImage} resizeMode="contain" />
                        <View style={styles.bubbleWrapper}>
                            <View style={styles.speechBubble}>
                                <Text style={styles.speechText}>{mascotState.message}</Text>
                            </View>
                            <View style={styles.bubbleArrow} />
                        </View>
                    </View>

                    {/* CÂU HỎI */}
                    <View style={styles.questionSection}>
                        <Text style={styles.questionText}>
                            {currentQ.questionText.replace(/\*\*/g, '')}
                        </Text>
                        {currentQ.linkMedia && (
                            <View style={styles.mediaPlaceholder}>
                                <Text style={{ color: COLORS.white }}>Media</Text>
                            </View>
                        )}
                    </View>

                    {/* FORM ĐÁP ÁN */}
                    <View style={styles.optionsContainer}>
                        {renderOption("A", currentQ.optionA)}
                        {renderOption("B", currentQ.optionB)}
                        {renderOption("C", currentQ.optionC)}
                        {renderOption("D", currentQ.optionD)}
                    </View>

                </Animated.View>
            </ScrollView>

            {/* FOOTER */}
            {selectedOption && (
                <View style={[styles.footer, { borderTopColor: 'transparent', backgroundColor: isCorrect ? COLORS.successBg : COLORS.errorBg }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                        <View style={[styles.footerIcon, { backgroundColor: isCorrect ? COLORS.success : COLORS.error }]}>
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{isCorrect ? '✓' : '✕'}</Text>
                        </View>
                        <View style={{ marginLeft: 12 }}>
                            <Text style={[styles.feedbackTitle, { color: isCorrect ? COLORS.success : COLORS.error }]}>
                                {isCorrect ? "Chính xác! 🎉" : "Chưa đúng rồi! 😢"}
                            </Text>
                            {!isCorrect && (
                                <Text style={styles.feedbackSubtitle}>Đáp án đúng: {currentQ.correctAnswer}</Text>
                            )}
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.nextButton, { backgroundColor: isCorrect ? COLORS.success : COLORS.error }]}
                        onPress={handleNextQuestion}
                    >
                        <Text style={styles.nextButtonText}>{isCorrect ? "TIẾP TỤC" : "TIẾP TỤC"}</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

// --- STYLES ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
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
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 8,
    },
    progressText: {
        marginTop: 8,
        textAlign: 'center',
        color: COLORS.subText,
        fontWeight: 'bold',
        fontSize: 12,
        marginBottom: 5
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    mascotContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    mascotImage: {
        width: 100,
        height: 100,
        marginRight: 10,
    },
    bubbleWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 5,
    },
    speechBubble: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
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
    questionSection: {
        marginBottom: 20,
    },
    questionText: {
        fontSize: 20,
        fontWeight: '800',
        color: '#374151',
        lineHeight: 30,
        textAlign: 'left',
    },
    mediaPlaceholder: {
        marginTop: 15,
        height: 150,
        width: '100%',
        backgroundColor: '#bdc3c7',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    optionsContainer: {
        gap: 14,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderBottomWidth: 4,
    },
    optionLabelContainer: {
        width: 34,
        height: 34,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
        borderWidth: 1,
        borderColor: '#E5E7EB'
    },
    optionLabelText: {
        fontWeight: '700',
        fontSize: 14,
        color: '#6B7280'
    },
    optionText: {
        flex: 1,
        fontSize: 17,
        fontWeight: '600',
        color: '#374151',
    },
    rightIconContainer: {
        marginLeft: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        backgroundColor: 'transparent',
    },
    statusIcon: {
        width: 26,
        height: 26,
        borderRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        paddingBottom: 34,
        borderTopWidth: 0,
    },
    footerIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    feedbackTitle: {
        fontSize: 19,
        fontWeight: '800',
    },
    feedbackSubtitle: {
        color: COLORS.error,
        fontSize: 15,
        fontWeight: '600',
        marginTop: 2
    },
    nextButton: {
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        width: '100%',
        borderBottomWidth: 4,
        borderBottomColor: 'rgba(0,0,0,0.1)'
    },
    nextButtonText: {
        color: COLORS.white,
        fontWeight: '800',
        fontSize: 16,
        textTransform: 'uppercase',
        letterSpacing: 1
    },
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
    restartButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 30,
        width: '100%',
        alignItems: 'center'
    },
    restartButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 16
    },

    // --- MODAL STYLES ---
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)', // Nền tối mờ
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
        backgroundColor: '#FFE5E5', // Đỏ nhạt nền icon
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15
    },
    modalIconText: {
        color: '#D32F2F', // Đỏ đậm dấu chấm than
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
        backgroundColor: '#4285F4', // Xanh dương
        paddingVertical: 14,
        width: '100%',
        borderRadius: 30,
        alignItems: 'center',
        marginBottom: 12,
        // Hiệu ứng nổi
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
        color: '#D32F2F', // Màu đỏ cảnh báo
        fontWeight: 'bold',
        fontSize: 16
    }
});

export default MultipleChoiceScreen;