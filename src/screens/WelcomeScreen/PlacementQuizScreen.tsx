import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// ✨ Import Data và Types
import { quizQuestions, QuizQuestion, FillInTheBlankQuestion, SentenceReorderQuestion } from '../../services/data/QuizData';
import { AuthStackParamList } from '../../navigation/AuthStack';

// Định nghĩa kiểu Props và Route
type PlacementQuizScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'PlacementQuiz'>;
type PlacementQuizRouteProp = RouteProp<AuthStackParamList, 'PlacementQuiz'>;

const COLOR_PRIMARY = '#3B82F6';
const COLOR_GRAY_BORDER = '#E5E5E5';
const QUIZ_SIZE = 10;
const FILL_IN_COUNT = 5;
const REORDER_COUNT = 5;

// Hàm Utility để lấy ngẫu nhiên N phần tử từ một mảng
const getRandomSubset = <T,>(array: T[], count: number): T[] => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

const PlacementQuizScreen: React.FC = () => {
    const [selectedQuestions, setSelectedQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({}); // {questionId: answer}
    const [availableWords, setAvailableWords] = useState<string[]>([]); // Dùng cho dạng Sắp xếp câu
    const [currentSentence, setCurrentSentence] = useState<string[]>([]); // Dùng cho dạng Sắp xếp câu

    const navigation = useNavigation<PlacementQuizScreenNavigationProp>();
    const route = useRoute<PlacementQuizRouteProp>();
    const onboardingData = route.params;

    const currentQuestion = selectedQuestions[currentQuestionIndex];
    const totalQuestions = selectedQuestions.length;

    // --- LOGIC CHỌN CÂU HỎI NGẪU NHIÊN KHI KHỞI TẠO ---
    useEffect(() => {
        // Phân loại các câu hỏi theo dạng
        const fillInQuestions = quizQuestions.filter(q => q.type === 'fill_in_the_blank') as FillInTheBlankQuestion[];
        const reorderQuestions = quizQuestions.filter(q => q.type === 'sentence_reorder') as SentenceReorderQuestion[];

        // Lấy ngẫu nhiên 5 câu Điền từ và 5 câu Sắp xếp
        const randomFillIn = getRandomSubset(fillInQuestions, FILL_IN_COUNT);
        const randomReorder = getRandomSubset(reorderQuestions, REORDER_COUNT);

        // ✨ THAY ĐỔI CỐT LÕI: Kết hợp Dạng 1 trước, sau đó là Dạng 2.
        // Không cần xáo trộn lần cuối cùng nữa.
        const finalQuiz = [...randomFillIn, ...randomReorder];

        // Đảm bảo tổng số câu là 10 trước khi thiết lập
        if (finalQuiz.length === QUIZ_SIZE) {
            setSelectedQuestions(finalQuiz);
        } else {
            Alert.alert("Lỗi Dữ liệu", `Không đủ ${QUIZ_SIZE} câu hỏi để tạo bài kiểm tra. Chỉ tìm thấy ${finalQuiz.length} câu.`);
            setSelectedQuestions(finalQuiz);
        }
    }, []); // Chỉ chạy một lần khi component mount

    // Khởi tạo/Reset state cho dạng Sắp xếp câu khi chuyển câu hỏi
    useEffect(() => {
        // Chỉ chạy nếu đã có câu hỏi được chọn
        if (selectedQuestions.length > 0 && currentQuestion && currentQuestion.type === 'sentence_reorder') {
            const parts = (currentQuestion as SentenceReorderQuestion).sentenceParts;
            // Đảo thứ tự các từ để tạo sự ngẫu nhiên trong ngân hàng từ (đây là điều cần thiết)
            const shuffledParts = [...parts].sort(() => Math.random() - 0.5);
            setAvailableWords(shuffledParts);
            setCurrentSentence([]);
        }
    }, [currentQuestionIndex, selectedQuestions]);

    // --- Xử lý Dạng 1: Điền vào chỗ trống ---
    const handleSelectFillInAnswer = (optionText: string) => {
        setUserAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: optionText,
        }));
    };

    // --- Xử lý Dạng 2: Sắp xếp câu ---
    const handleWordSelect = (word: string, index: number) => {
        // Di chuyển từ từ ngân hàng từ lên câu hiện tại
        setAvailableWords(prev => prev.filter((_, i) => i !== index));
        setCurrentSentence(prev => [...prev, word]);
    };

    const handleWordRemove = (word: string, index: number) => {
        // Di chuyển từ từ câu hiện tại xuống ngân hàng từ
        setCurrentSentence(prev => prev.filter((_, i) => i !== index));
        setAvailableWords(prev => [...prev, word]); // Thêm lại vào ngân hàng từ
    };

    // Lưu đáp án Sắp xếp câu
    const saveSentenceReorderAnswer = () => {
        const finalSentence = currentSentence.join(' ');
        setUserAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: finalSentence,
        }));
    };

    // --- Điều hướng ---
    const handleNext = () => {
        // Kiểm tra xem người dùng đã trả lời câu hỏi hiện tại chưa
        const isAnswered = currentQuestion.type === 'fill_in_the_blank'
            ? userAnswers.hasOwnProperty(currentQuestion.id)
            : currentSentence.length > 0;

        if (!isAnswered) {
            Alert.alert('Chưa hoàn thành', 'Vui lòng chọn hoặc điền đáp án trước khi tiếp tục.');
            return;
        }

        // Lưu đáp án Sắp xếp câu trước khi chuyển
        if (currentQuestion.type === 'sentence_reorder') {
            saveSentenceReorderAnswer();
        }

        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // ✨ HOÀN THÀNH BÀI KIỂM TRA

            // Đảm bảo đáp án cuối cùng được lưu nếu đó là dạng Sắp xếp câu
            const finalAnswers = {
                ...userAnswers,
                [currentQuestion.id]: currentQuestion.type === 'sentence_reorder' ? currentSentence.join(' ') : userAnswers[currentQuestion.id],
            };

            navigation.replace('QuizResults', {
                learningLanguage: onboardingData.languageName,
                quizAnswers: finalAnswers,
            });
        }
    };

    const handleGoBack = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        } else {
            navigation.goBack();
        }
    };

    // Nếu chưa load được câu hỏi (ví dụ: đang ở trạng thái loading ban đầu)
    if (selectedQuestions.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Đang tải bài kiểm tra...</Text>
            </View>
        );
    }

    // --- Render các dạng câu hỏi (Giữ nguyên logic render) ---

    // Dạng 1: Điền vào chỗ trống
    const renderFillInTheBlank = (question: FillInTheBlankQuestion) => {
        const userAnswer = userAnswers[question.id];
        const parts = question.questionText.split('_______');

        return (
            <View>
                <Text style={styles.questionText}>
                    {parts[0]}
                    <Text style={styles.blankSpace}>_______</Text>
                    {parts[1]}
                </Text>

                {question.options.map((option, index) => {
                    const isSelected = userAnswer === option.text;
                    return (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.optionItem,
                                isSelected && styles.optionItemSelected,
                            ]}
                            onPress={() => handleSelectFillInAnswer(option.text)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.optionText}>{option.text}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };

    // Dạng 2: Sắp xếp câu
    const renderSentenceReorder = (question: SentenceReorderQuestion) => {
        return (
            <View>
                <Text style={styles.questionText}>Sắp xếp các từ sau thành một câu hoàn chỉnh:</Text>

                {/* Câu hiện tại đang được sắp xếp */}
                <View style={styles.currentSentenceContainer}>
                    {currentSentence.length > 0 ? (
                        currentSentence.map((word, index) => (
                            <TouchableOpacity
                                key={`sentence-${index}`}
                                style={styles.sentenceWordChip}
                                onPress={() => handleWordRemove(word, index)}
                            >
                                <Text style={styles.sentenceWordText}>{word}</Text>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <Text style={styles.placeholderText}>Nhấn vào các từ bên dưới để tạo câu...</Text>
                    )}
                </View>

                <Text style={styles.subTitle}>Ngân hàng từ:</Text>

                {/* Ngân hàng từ */}
                <View style={styles.availableWordsContainer}>
                    {availableWords.map((word, index) => (
                        <TouchableOpacity
                            key={`available-${index}`}
                            style={styles.availableWordChip}
                            onPress={() => handleWordSelect(word, index)}
                        >
                            <Text style={styles.availableWordText}>{word}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.hintText}>Gợi ý: {question.hint}</Text>
            </View>
        );
    };


    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header Bar và Progress Bar */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#888" />
                    </TouchableOpacity>
                    <View style={styles.progressBarContainer}>
                        {/* Thanh tiến trình của Quiz: Sử dụng totalQuestions */}
                        <View style={[styles.progressBar, { width: `${(currentQuestionIndex + 1) / totalQuestions * 100}%` }]} />
                    </View>
                </View>

                <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    {/* Số câu hỏi hiện tại: Sử dụng totalQuestions */}
                    <Text style={styles.questionNumber}>Câu {currentQuestionIndex + 1} / {totalQuestions}</Text>

                    {/* Render Question */}
                    {currentQuestion && currentQuestion.type === 'fill_in_the_blank' && (
                        renderFillInTheBlank(currentQuestion as FillInTheBlankQuestion)
                    )}

                    {currentQuestion && currentQuestion.type === 'sentence_reorder' && (
                        renderSentenceReorder(currentQuestion as SentenceReorderQuestion)
                    )}

                    <View style={{ height: 100 }} />
                </ScrollView>
            </View>

            {/* Footer Button (TIẾP TỤC) */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.continueButton}
                    onPress={handleNext}
                    activeOpacity={0.8}
                >
                    <Text style={styles.continueButtonText}>
                        {currentQuestionIndex === totalQuestions - 1 ? 'HOÀN THÀNH' : 'TIẾP TỤC'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        fontSize: 18,
        color: '#666',
    },
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    scrollContainer: {
        flex: 1,
    },
    // ... (Các styles khác giữ nguyên)

    // --- Header & Progress Bar ---
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
    },
    backButton: {
        paddingRight: 15,
    },
    progressBarContainer: {
        flex: 1,
        height: 10,
        backgroundColor: '#E5E5E5',
        borderRadius: 5,
    },
    progressBar: {
        height: '100%',
        backgroundColor: COLOR_PRIMARY,
        borderRadius: 5,
    },

    // --- Quiz Content ---
    questionNumber: {
        fontSize: 16,
        color: '#999',
        marginBottom: 10,
        fontWeight: '500',
    },
    questionText: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 30,
        lineHeight: 30,
        color: '#333',
    },
    blankSpace: {
        color: COLOR_PRIMARY,
        textDecorationLine: 'underline',
        fontWeight: '900',
    },
    subTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 20,
        marginBottom: 10,
        color: '#666',
    },
    hintText: {
        fontSize: 14,
        color: '#888',
        marginTop: 20,
        fontStyle: 'italic',
    },

    // --- Options (Fill in the Blank) ---
    optionItem: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLOR_GRAY_BORDER,
        marginBottom: 10,
        backgroundColor: 'white',
        alignItems: 'center',
    },
    optionItemSelected: {
        borderColor: COLOR_PRIMARY,
        backgroundColor: '#F0F8FF',
        borderWidth: 3,
    },
    optionText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#4B4B4B',
    },

    // --- Sentence Reorder ---
    currentSentenceContainer: {
        minHeight: 100,
        borderWidth: 2,
        borderColor: COLOR_GRAY_BORDER,
        borderRadius: 12,
        padding: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },
    placeholderText: {
        color: '#AAA',
        fontStyle: 'italic',
        fontSize: 16,
        padding: 5,
    },
    sentenceWordChip: {
        backgroundColor: COLOR_PRIMARY,
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    sentenceWordText: {
        color: 'white',
        fontWeight: 'bold',
    },
    availableWordsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#F0F0F0',
        borderRadius: 12,
        padding: 10,
    },
    availableWordChip: {
        backgroundColor: '#F0F0F0',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: COLOR_GRAY_BORDER,
    },
    availableWordText: {
        color: '#333',
        fontWeight: '600',
    },


    // --- Footer & Button ---
    footer: {
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 15,
        paddingBottom: Platform.OS === 'ios' ? 0 : 15,
        marginLeft: 20, // Đảm bảo footer kéo rộng ra hết màn hình
        marginRight: 20,
        paddingHorizontal: 20,
    },
    continueButton: {
        width: '100%',
        paddingVertical: 18,
        borderRadius: 15,
        alignItems: 'center',
        backgroundColor: COLOR_PRIMARY,
    },
    continueButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
});

export default PlacementQuizScreen;