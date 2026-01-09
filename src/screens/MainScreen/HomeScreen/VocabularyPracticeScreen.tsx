import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, Vibration } from 'react-native'; // Thêm Vibration
import { Audio } from 'expo-av'; // Thêm Audio
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import * as Progress from 'react-native-progress';
import { AuthStackParamList } from '../../../navigation/AuthStack';
import { EnglishVocabularyTheoryResponse } from '../../../types/response/VocabularyResponse';
import userProgressService from '../../../services/userProgressService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Định nghĩa kiểu Route
type VocabularyPracticeRouteProp = RouteProp<AuthStackParamList, 'VocabularyPractice'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLOR_PRIMARY = '#3B82F6';
const COLOR_SUCCESS = '#58CC02';
const COLOR_ERROR = '#FF4B4B';
const COLOR_GRAY = '#E5E5E5';

interface Question {
    id: number;
    question: string;
    options: string[];
    correctAnswer: string;
    type: 'word_to_meaning' | 'fill_in_blank';
}

const VocabularyPracticeScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp<AuthStackParamList>>();
    const route = useRoute<VocabularyPracticeRouteProp>();

    const { lessonId, lessonTitle, section, vocabularyList } = route.params;
    const newSection = section + 1;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isChecked, setIsChecked] = useState(false);
    const [score, setScore] = useState(0);

    // --- LOGIC ÂM THANH ---
    async function playSound(isCorrect: boolean) {
        try {
            const { sound } = await Audio.Sound.createAsync(
                isCorrect
                    ? require('../../../../assets/sounds/correct.mp3')
                    : require('../../../../assets/sounds/wrong.mp3')
            );
            await sound.playAsync();

            // Giải phóng bộ nhớ sau khi phát xong
            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish) {
                    sound.unloadAsync();
                }
            });
        } catch (error) {
            console.log("Lỗi phát âm thanh:", error);
        }
    }

    const questions: Question[] = useMemo(() => {
        if (!vocabularyList || vocabularyList.length === 0) return [];
        let allQuestions: Question[] = [];
        const backupWords = ["Apple", "School", "Teacher", "Student", "Computer", "Water", "House"];
        const backupMeanings = ["Quả táo", "Trường học", "Giáo viên", "Học sinh", "Máy tính", "Nước", "Ngôi nhà"];

        vocabularyList.forEach((vocab) => {
            {
                const questionText = `Nghĩa của từ "${vocab.word}" là gì?`;
                const correctAnswer = vocab.meaning;
                let wrongMeanings = vocabularyList.filter(v => v.id !== vocab.id).map(v => v.meaning);
                wrongMeanings = wrongMeanings.sort(() => 0.5 - Math.random()).slice(0, 3);
                while (wrongMeanings.length < 3) {
                    const randomBackup = backupMeanings[Math.floor(Math.random() * backupMeanings.length)];
                    if (!wrongMeanings.includes(randomBackup) && randomBackup !== correctAnswer) {
                        wrongMeanings.push(randomBackup);
                    }
                }
                const options = [...wrongMeanings, correctAnswer].sort(() => 0.5 - Math.random());
                allQuestions.push({
                    id: vocab.id * 10 + 1,
                    question: questionText,
                    options: options,
                    correctAnswer: correctAnswer,
                    type: 'word_to_meaning'
                });
            }

            if (vocab.example && vocab.example.toLowerCase().includes(vocab.word.toLowerCase())) {
                const parts = vocab.example ? vocab.example.split(" -> ") : [];
                const englishPhrase = parts[0];
                const regex = new RegExp(vocab.word, 'gi');
                const questionText = englishPhrase.replace(regex, '_______');
                const correctAnswer = vocab.word;
                let wrongWords = vocabularyList.filter(v => v.id !== vocab.id).map(v => v.word);
                wrongWords = wrongWords.sort(() => 0.5 - Math.random()).slice(0, 3);
                while (wrongWords.length < 3) {
                    const randomBackup = backupWords[Math.floor(Math.random() * backupWords.length)];
                    if (!wrongWords.includes(randomBackup) && randomBackup !== correctAnswer) {
                        wrongWords.push(randomBackup);
                    }
                }
                const options = [...wrongWords, correctAnswer].sort(() => 0.5 - Math.random());
                allQuestions.push({
                    id: vocab.id * 10 + 2,
                    question: questionText,
                    options: options,
                    correctAnswer: correctAnswer,
                    type: 'fill_in_blank'
                });
            }
        });
        return allQuestions.sort(() => 0.5 - Math.random()).slice(0, 8);
    }, [vocabularyList]);

    const currentQuestion = questions[currentIndex];
    const progress = questions.length > 0 ? (currentIndex + 1) / questions.length : 0;

    const handleSelectOption = (option: string) => {
        if (isChecked) return;
        setSelectedOption(option);
    };

    const handleContinue = async () => {
        if (!selectedOption) return;

        if (!isChecked) {
            setIsChecked(true);
            if (selectedOption === currentQuestion.correctAnswer) {
                // ĐÚNG: Phát tiếng "tíng tong"
                playSound(true);
                setScore(score + 1);
            } else {
                // SAI: Phát tiếng "rẹc rẹc" và rung máy
                playSound(false);
                Vibration.vibrate([0, 100, 100, 100]); // Kiểu rung ngắn ngắt quãng
            }
        } else {
            if (currentIndex < questions.length - 1) {
                setCurrentIndex(currentIndex + 1);
                setSelectedOption(null);
                setIsChecked(false);
            } else {
                if (score >= 6) {
                    const userIdString = await AsyncStorage.getItem("userId");
                    if (!userIdString) {
                        Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng.");
                        return;
                    }
                    const userId = Number(userIdString);
                    await userProgressService.updateUserProgress({ userId: userId, lessonId: lessonId, section: 2 });
                    Alert.alert(
                        "Chúc mừng!",
                        `Bạn đã trả lời đúng ${score}/${questions.length} câu. Bạn đã đủ điều kiện để học Ngữ pháp. Tuy nhiên hãy ôn luyện thường xuyên nhé!`,
                        [{ text: "Học Ngữ pháp", onPress: () => navigation.navigate('GrammarScreen', { lessonId, lessonTitle, section: newSection } as any) }]
                    );
                } else {
                    Alert.alert(
                        "Chưa đạt yêu cầu",
                        `Bạn chỉ đúng ${score}/${questions.length} câu (Cần tối thiểu 6 câu đúng). Vốn từ vựng của bạn chưa đủ để học Ngữ pháp.`,
                        [{ text: "Học lại Từ vựng", onPress: () => navigation.navigate('VocabularyScreen', { lessonId, lessonTitle, section }) }]
                    );
                }
            }
        }
    };

    const getOptionButtonStyle = (option: string) => {
        let baseStyle = { backgroundColor: '#FFFFFF', borderColor: COLOR_GRAY, borderWidth: 2, borderBottomWidth: 4 };
        if (!isChecked && option === selectedOption) return { backgroundColor: '#E3F2FD', borderColor: COLOR_PRIMARY, borderWidth: 2, borderBottomWidth: 4 };
        if (isChecked) {
            if (option === currentQuestion.correctAnswer) return { backgroundColor: '#D7FFB8', borderColor: COLOR_SUCCESS, borderWidth: 2, borderBottomWidth: 4 };
            if (option === selectedOption && option !== currentQuestion.correctAnswer) return { backgroundColor: '#FFDFDF', borderColor: COLOR_ERROR, borderWidth: 2, borderBottomWidth: 4 };
        }
        return baseStyle;
    };

    const getOptionTextStyle = (option: string) => {
        if (isChecked) {
            if (option === currentQuestion.correctAnswer) return { color: '#2D6900', fontWeight: 'bold' };
            if (option === selectedOption) return { color: '#A30000', fontWeight: 'bold' };
        }
        if (selectedOption === option) return { color: COLOR_PRIMARY, fontWeight: 'bold' };
        return { color: '#4B4B4B' };
    };

    const handleGoBack = () => navigation.goBack();

    if (!currentQuestion) return (
        <SafeAreaView style={styles.container}>
            <Text style={{ textAlign: 'center', marginTop: 50 }}>Đang tạo câu hỏi...</Text>
        </SafeAreaView>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="#555" />
                </TouchableOpacity>
                <View style={styles.progressBarContainer}>
                    <Progress.Bar
                        progress={progress}
                        width={null}
                        height={12}
                        color={COLOR_PRIMARY}
                        unfilledColor="#E5E5E5"
                        borderWidth={0}
                        borderRadius={10}
                        style={{ width: '100%' }}
                    />
                </View>
            </View>

            <View style={styles.content}>
                <Text style={styles.questionCounter}>Câu {currentIndex + 1} / {questions.length}</Text>
                <Text style={styles.questionText}>{currentQuestion.question}</Text>
                <View style={styles.optionsContainer}>
                    {currentQuestion.options.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.optionButton, getOptionButtonStyle(option)]}
                            onPress={() => handleSelectOption(option)}
                            activeOpacity={0.7}
                            disabled={isChecked}
                        >
                            <Text style={[styles.optionText, getOptionTextStyle(option) as any]}>{option}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={[styles.footer, isChecked ? (selectedOption === currentQuestion.correctAnswer ? styles.footerCorrect : styles.footerWrong) : {}]}>
                {isChecked && (
                    <View style={styles.feedbackContainer}>
                        <View style={styles.feedbackHeader}>
                            <Ionicons
                                name={selectedOption === currentQuestion.correctAnswer ? "checkmark-circle" : "close-circle"}
                                size={30}
                                color={selectedOption === currentQuestion.correctAnswer ? COLOR_SUCCESS : COLOR_ERROR}
                            />
                            <Text style={[styles.feedbackTitle, { color: selectedOption === currentQuestion.correctAnswer ? COLOR_SUCCESS : COLOR_ERROR }]}>
                                {selectedOption === currentQuestion.correctAnswer ? "Chính xác!" : "Chưa chính xác"}
                            </Text>
                        </View>
                        {selectedOption !== currentQuestion.correctAnswer && (
                            <Text style={styles.feedbackSubtitle}>Đáp án đúng: {currentQuestion.correctAnswer}</Text>
                        )}
                    </View>
                )}
                <TouchableOpacity
                    style={[styles.continueButton, { backgroundColor: isChecked ? (selectedOption === currentQuestion.correctAnswer ? COLOR_SUCCESS : COLOR_ERROR) : (selectedOption ? COLOR_PRIMARY : '#E5E5E5') }]}
                    onPress={handleContinue}
                    disabled={!selectedOption}
                >
                    <Text style={styles.continueButtonText}>{isChecked ? "TIẾP TỤC" : "KIỂM TRA"}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

// ... Styles giữ nguyên như cũ ...
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
    backButton: { marginRight: 15 },
    progressBarContainer: { flex: 1 },
    content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
    questionCounter: { fontSize: 14, color: '#999', fontWeight: '600', marginBottom: 15, textTransform: 'uppercase' },
    questionText: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 40, lineHeight: 32 },
    optionsContainer: { gap: 15 },
    optionButton: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    optionText: { fontSize: 18, fontWeight: '500' },
    footer: { padding: 20, paddingBottom: 30 },
    footerCorrect: { backgroundColor: '#D7FFB8' },
    footerWrong: { backgroundColor: '#FFDFDF' },
    feedbackContainer: { marginBottom: 15 },
    feedbackHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    feedbackTitle: { fontSize: 22, fontWeight: 'bold', marginLeft: 10 },
    feedbackSubtitle: { fontSize: 16, color: COLOR_ERROR, marginLeft: 40 },
    continueButton: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
    },
    continueButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase' },
});

export default VocabularyPracticeScreen;