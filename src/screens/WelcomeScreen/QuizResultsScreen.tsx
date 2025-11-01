import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';

// ✨ Import Data   
import { quizQuestions } from '../../services/data/QuizData';
import { AuthStackParamList } from '../../navigation/AuthStack';
import foxImage from '../../../assets/images/logo/Elisa.png';

// Định nghĩa kiểu Route
type QuizResultsRouteProp = RouteProp<AuthStackParamList, 'QuizResults'>;

const COLOR_PRIMARY = '#3B82F6';
const COLOR_SUCCESS = '#4CAF50';
const COLOR_FAIL = '#F44336';
const COLOR_TEXT = '#4B4B4B';
const QUIZ_SIZE = 10;

const QuizResultsScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<QuizResultsRouteProp>();
    const { quizAnswers, learningLanguage } = route.params;

    // --- Logic tính điểm và xác định trình độ ---
    const { score, totalQuestions, userLevelRecommendation } = useMemo(() => {
        let correctCount = 0;
        const total = QUIZ_SIZE;

        quizQuestions.forEach(question => {
            const userAnswer = quizAnswers[question.id];
            let isCorrect = false;

            if (question.type === 'fill_in_the_blank') {
                // Tìm câu trả lời đúng từ options
                const correctAnswer = question.options.find(opt => opt.isCorrect)?.text;
                if (userAnswer === correctAnswer) {
                    isCorrect = true;
                }
            } else if (question.type === 'sentence_reorder') {
                // So sánh câu hoàn chỉnh đã sắp xếp
                if (userAnswer === question.correctOrder) {
                    isCorrect = true;
                }
            }

            if (isCorrect) {
                correctCount++;
            }
        });

        const percent = (correctCount / total) * 100;
        let recommendation = '';

        // Logic gợi ý trình độ (có thể thay đổi tùy ý)
        if (percent >= 80) {
            recommendation = 'Trình độ Nâng cao (B2/C1)';
        } else if (percent >= 50) {
            recommendation = 'Trình độ Trung cấp (A2/B1)';
        } else {
            recommendation = 'Trình độ Sơ cấp (A1)';
        }

        return {
            score: correctCount,
            totalQuestions: total,
            userLevelRecommendation: recommendation
        };

    }, [quizAnswers]);

    // --- Hàm xử lý điều hướng cuối cùng ---
    const handleFinalize = () => {
        // TODO: Gửi kết quả cuối cùng lên API (điểm, trình độ gợi ý)
        console.log("Dữ liệu cuối cùng được gửi lên server:", {
            ...route.params,
            score,
            userLevelRecommendation,
        });

        // Điều hướng sang màn hình Tab chính của ứng dụng
        // navigation.replace('HomeTabs'); // Thay thế bằng tên màn hình chính của bạn
        Alert.alert("Hoàn thành!", `Bạn đã sẵn sàng bắt đầu học với lộ trình ${userLevelRecommendation}!`);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>

                {/* Phần Chatbot và Kết quả */}
                <View style={styles.chatbotArea}>
                    <Image
                        source={foxImage}
                        style={styles.chatbotIcon}
                        resizeMode="contain"
                    />
                    <View style={styles.speechBubble}>
                        <Text style={styles.speechText}>Chúc mừng! Bài kiểm tra trình độ của bạn đã hoàn thành.</Text>
                    </View>
                </View>

                <Text style={styles.resultTitle}>KẾT QUẢ ĐÁNH GIÁ</Text>

                <View style={styles.summaryBox}>
                    <Text style={styles.summaryLabel}>Ngôn ngữ học:</Text>
                    <Text style={styles.summaryValue}>{learningLanguage}</Text>
                </View>

                <View style={styles.summaryBox}>
                    <Text style={styles.summaryLabel}>Số câu đúng:</Text>
                    <Text style={[styles.summaryValue, styles.scoreValue]}>{score} / {QUIZ_SIZE}</Text>
                </View>

                <View style={styles.recommendationBox}>
                    <Text style={styles.recommendationLabel}>Trình độ được đề xuất:</Text>
                    <Text style={styles.recommendationText}>{userLevelRecommendation}</Text>
                </View>

                <Text style={styles.reviewPrompt}>
                    Chúng tôi sẽ điều chỉnh lộ trình học của bạn dựa trên kết quả này để tối ưu hiệu quả.
                </Text>

                <View style={{ height: 50 }} />
            </ScrollView>

            {/* Footer Button (BẮT ĐẦU HỌC) */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.continueButton}
                    onPress={handleFinalize}
                    activeOpacity={0.8}
                >
                    <Text style={styles.continueButtonText}>BẮT ĐẦU HỌC</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingVertical: 30,
    },

    // --- Chatbot Area ---
    chatbotArea: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 40,
        marginTop: 10,
    },
    chatbotIcon: {
        width: 100,
        height: 100,
        borderRadius: 40,
    },
    speechBubble: {
        backgroundColor: '#E6F0FF',
        borderRadius: 15,
        padding: 15,
        marginLeft: 10,
        maxWidth: '70%',
        justifyContent: 'center',
    },
    speechText: {
        fontSize: 18,
        fontWeight: '500',
        color: '#333',
    },

    // --- Results Summary ---
    resultTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLOR_PRIMARY,
        textAlign: 'center',
        marginBottom: 30,
    },
    summaryBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    summaryLabel: {
        fontSize: 16,
        color: '#666',
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLOR_TEXT,
    },
    scoreValue: {
        color: COLOR_SUCCESS,
        fontSize: 20,
    },

    // --- Recommendation ---
    recommendationBox: {
        backgroundColor: '#F7FFF0',
        borderRadius: 15,
        padding: 20,
        marginTop: 30,
        borderWidth: 1,
        borderColor: COLOR_SUCCESS,
    },
    recommendationLabel: {
        fontSize: 16,
        color: COLOR_SUCCESS,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    recommendationText: {
        fontSize: 20,
        fontWeight: '900',
        color: COLOR_TEXT,
    },
    reviewPrompt: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        marginTop: 20,
    },

    // --- Footer & Button ---
    footer: {
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 15,
        paddingBottom: Platform.OS === 'ios' ? 0 : 15,
        marginLeft: 20,
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

export default QuizResultsScreen;