import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    Alert, ScrollView, Dimensions, Image, ActivityIndicator,
    Vibration // 1. Thêm Vibration
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import * as Progress from 'react-native-progress';
import * as Animatable from 'react-native-animatable';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av'; // 2. Thêm Audio

// --- Services ---
import userProgressService from '../../../services/userProgressService';
import userXPService from '../../../services/userXPService';
import exerciseService from '../../../services/exerciseService';
import notificationService from '../../../services/notificationService';

// --- Data & Utils ---
import { getLessonTitleById } from '../../../services/data/LearningPathData';
import { rankingData, getAchievementID, getRankIconByID } from '../../../services/data/RankingData';

// --- Types ---
import { CombinedQuestion, MultipleChoiceQuestion, SentenceRewritingQuestion } from '../../../types/response/ExerciseResponse';
import { AuthStackParamList } from '../../../navigation/AuthStack';

// --- Import Modals ---
import LevelUpModal, { LevelData } from '../../../components/LevelUpModal';
import LessonCompletionModal from '../../../components/LessonCompletionModal';

// --- Assets ---
import mascotNormal from '../../../../assets/images/logo/Elisa.png';
import mascotHappy from '../../../../assets/images/logo/Elisa_Happy.png';
import mascotSad from '../../../../assets/images/logo/Elisa_Sad.png';
import confetti from '../../../../assets/animations/Confetti.json';

const { width } = Dimensions.get('window');

const shuffleArray = (array: string[]) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
};

// --- COMPONENT: MASCOT ---
const MascotFeedback = ({ status }: { status: 'THINKING' | 'CORRECT' | 'WRONG' }) => {
    let source = mascotNormal;
    let animation = undefined;

    if (status === 'CORRECT') {
        source = mascotHappy;
        animation = "bounce";
    } else if (status === 'WRONG') {
        source = mascotSad;
        animation = "shake";
    }

    return (
        <Animatable.View animation={animation} duration={1000} style={styles.mascotContainer}>
            <Image source={source} style={styles.mascotImage} resizeMode="contain" />
            <View style={styles.bubble}>
                <Text style={styles.bubbleText}>
                    {status === 'THINKING' ? "Cố lên bạn ơi!" :
                        status === 'CORRECT' ? "Tuyệt vời ông mặt trời!" : "Ôi không, sai mất rồi!"}
                </Text>
                <View style={styles.bubbleArrow} />
            </View>
        </Animatable.View>
    );
};

// --- COMPONENT: MULTIPLE CHOICE ---
const MultipleChoiceView = ({ data, options, onSelect, selectedOption, isChecked, correctAnswer }: { data: MultipleChoiceQuestion, options: string[], onSelect: any, selectedOption: any, isChecked: boolean, correctAnswer: string }) => {
    return (
        <View style={styles.contentContainer}>
            <Text style={styles.questionText}>
                {data.questionText.split(/(\*\*.*?\*\*)/).map((part, index) =>
                    part.startsWith('**') && part.endsWith('**')
                        ? <Text key={index} style={{ fontWeight: 'bold', color: '#3B82F6' }}>{part.replace(/\*\*/g, '')}</Text>
                        : <Text key={index}>{part}</Text>
                )}
            </Text>

            <View style={styles.optionsContainer}>
                {options.map((val, idx) => {
                    const keyChar = ['A', 'B', 'C', 'D'][idx];
                    let bgColor = '#FFF';
                    let borderColor = '#E5E7EB';
                    let iconName = "radio-button-off";
                    let iconColor = "#9CA3AF";
                    let textColor = "#374151";

                    if (selectedOption === val) {
                        bgColor = '#DBEAFE'; borderColor = '#3B82F6'; iconName = "radio-button-on"; iconColor = "#3B82F6"; textColor = "#1E40AF";
                    }

                    if (isChecked) {
                        if (val === correctAnswer) {
                            bgColor = '#D1FAE5'; borderColor = '#10B981'; iconName = "checkmark-circle"; iconColor = "#10B981";
                        } else if (selectedOption === val && val !== correctAnswer) {
                            bgColor = '#FEE2E2'; borderColor = '#EF4444'; iconName = "close-circle"; iconColor = "#EF4444";
                        }
                    }

                    return (
                        <TouchableOpacity
                            key={idx}
                            style={[styles.optionButton, { backgroundColor: bgColor, borderColor: borderColor, borderBottomWidth: 4 }]}
                            onPress={() => !isChecked && onSelect(val)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.optionLabel}>
                                <Text style={styles.optionLabelText}>{keyChar}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.optionText, { color: textColor }]}>{val}</Text>
                            </View>
                            <Ionicons name={iconName as any} size={24} color={iconColor} />
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

// --- COMPONENT: SENTENCE REWRITING ---
const SentenceRewritingView = ({ userSentence, setUserSentence, availableWords, setAvailableWords, isChecked }: any) => {
    const handleWordClick = (word: string, index: number, type: 'select' | 'deselect') => {
        if (isChecked) return;
        if (type === 'select') {
            const newAvailable = [...availableWords];
            newAvailable.splice(index, 1);
            setAvailableWords(newAvailable);
            setUserSentence([...userSentence, word]);
        } else {
            const newUserSent = [...userSentence];
            newUserSent.splice(index, 1);
            setUserSentence(newUserSent);
            setAvailableWords([...availableWords, word]);
        }
    };

    return (
        <View style={styles.contentContainer}>
            <Text style={styles.questionText}>Sắp xếp lại câu:</Text>
            <View style={styles.sentenceBox}>
                <View style={styles.wordWrapArea}>
                    {userSentence.map((word: string, index: number) => (
                        <Animatable.View animation="fadeIn" duration={300} key={`${word}-${index}`}>
                            <TouchableOpacity style={styles.wordChipSelected} onPress={() => handleWordClick(word, index, 'deselect')}>
                                <Text style={styles.wordTextSelected}>{word}</Text>
                            </TouchableOpacity>
                        </Animatable.View>
                    ))}
                </View>
                {userSentence.length === 0 && <View style={styles.linePlaceholder} />}
            </View>

            <View style={styles.wordPool}>
                {availableWords.map((word: string, index: number) => (
                    <Animatable.View animation="zoomIn" delay={index * 50} key={`${word}-${index}_pool`}>
                        <TouchableOpacity style={styles.wordChipNormal} onPress={() => handleWordClick(word, index, 'select')}>
                            <Text style={styles.wordTextNormal}>{word}</Text>
                        </TouchableOpacity>
                    </Animatable.View>
                ))}
            </View>
        </View>
    );
};


// --- MAIN SCREEN ---
type ExerciseScreenRouteProp = RouteProp<AuthStackParamList, 'ExerciseScreen'>;

const ExerciseScreen = () => {
    const navigation = useNavigation<NavigationProp<AuthStackParamList>>();
    const route = useRoute<ExerciseScreenRouteProp>();
    const { lessonId, lessonTitle, section } = route.params || { lessonId: 1 };

    const [questions, setQuestions] = useState<CombinedQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isChecked, setIsChecked] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [mascotStatus, setMascotStatus] = useState<'THINKING' | 'CORRECT' | 'WRONG'>('THINKING');
    const [hearts, setHearts] = useState(5);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [userSentence, setUserSentence] = useState<string[]>([]);
    const [availableWords, setAvailableWords] = useState<string[]>([]);
    const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
    const [showLevelUpModal, setShowLevelUpModal] = useState<boolean>(false);
    const [newLevelData, setNewLevelData] = useState<LevelData | null>(null);
    const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
    const [xpReceived, setXpReceived] = useState<number>(300);

    const confettiRef = useRef<LottieView>(null);

    // --- LOGIC ÂM THANH MỚI ---
    async function playFeedbackSound(correct: boolean) {
        try {
            const { sound } = await Audio.Sound.createAsync(
                correct
                    ? require('../../../../assets/sounds/correct.mp3')
                    : require('../../../../assets/sounds/wrong.mp3')
            );
            await sound.playAsync();
            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish) {
                    sound.unloadAsync();
                }
            });
        } catch (error) {
            console.log("Lỗi phát âm thanh:", error);
        }
    }

    const showPostCompletionOptions = () => {
        setShowLevelUpModal(false);
        setShowCompletionModal(false);
        Alert.alert(
            "Hoàn thành bài học! 🌟",
            "Bạn đã hoàn thành xuất sắc bài học! Bạn muốn làm gì tiếp theo?",
            [
                { text: "Về trang chủ", style: "cancel", onPress: () => navigation.navigate('AppTabs' as any) },
                {
                    text: "Bài tiếp theo",
                    onPress: () => {
                        if (lessonId >= 45) {
                            Alert.alert("Thông báo", "Bạn đã hoàn thành toàn bộ lộ trình!", [
                                { text: "Về trang chủ", onPress: () => navigation.navigate('AppTabs' as any) }
                            ]);
                        } else {
                            const nextLessonId = lessonId + 1;
                            (navigation as any).replace('LessonLoading' as any, {
                                lessonId: nextLessonId,
                                lessonTitle: getLessonTitleById(nextLessonId),
                                section: 1,
                                targetRoute: 'VocabularyScreen'
                            });
                        }
                    }
                }
            ],
            { cancelable: false }
        );
    };

    const processExerciseCompletion = async () => {
        try {
            const userIdString = await AsyncStorage.getItem("userId");
            if (!userIdString) {
                Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng.");
                showPostCompletionOptions();
                return;
            }
            const userId = Number(userIdString);
            const fullName = await AsyncStorage.getItem("fullName") || "Học viên Elisa";
            const progressResponse = await userProgressService.getUserProgressByUserId(userId);
            const currentServerLessonId = progressResponse.data.lessonId;

            if (currentServerLessonId > lessonId) {
                setXpReceived(0);
                setShowCompletionModal(true);
                return;
            }

            setXpReceived(300);
            let nextLessonId = lessonId < 45 ? lessonId + 1 : lessonId;
            await userProgressService.updateUserProgress({ userId: userId, lessonId: nextLessonId, section: 1 });
            const currentXPResponse = await userXPService.getUserXPByUserId(userId);
            const currentXP = currentXPResponse.data.totalXP || 0;
            const xpToAdd = 300;
            const newAchievementID = getAchievementID(currentXP + xpToAdd);

            if (newAchievementID !== currentXPResponse.data.achievementsID) {
                await userXPService.updateUserXP({ userId: userId, achievementsID: newAchievementID, totalXP: currentXP + xpToAdd });
                const notificationPayloadLevel = {
                    userId: userId,
                    title: "Lên cấp!",
                    content: `Chúc mừng ${fullName} bạn vừa thăng cấp. Hãy tiếp tục cố gắng để đạt được những thành tựu cao hơn nhé!`,
                    imageUrl: `${getRankIconByID(newAchievementID)}`,
                    type: "level",
                };
                await notificationService.createNotification(notificationPayloadLevel);
                const rankInfo = rankingData.find(r => r.achievementID === newAchievementID);
                if (rankInfo) {
                    setNewLevelData(rankInfo);
                    setShowLevelUpModal(true);
                } else {
                    setShowCompletionModal(true);
                }
            } else {
                await userXPService.updateUserXP({ userId: userId, achievementsID: currentXPResponse.data.achievementsID, totalXP: currentXP + xpToAdd });
                setShowCompletionModal(true);
            }
        } catch (error) {
            console.log("Lỗi update user progress:", error);
            showPostCompletionOptions();
        }
    };

    useEffect(() => {
        const fetchExercises = async () => {
            if (!lessonId) return;
            setLoading(true);
            try {
                const response = await exerciseService.getExercisesByLesson(lessonId);
                const data = response.data;
                const mcList: CombinedQuestion[] = (data.listMultipleChoice || []).map(q => ({ type: 'MULTIPLE_CHOICE', data: q, id: `mc_${q.questionId}` }));
                const srList: CombinedQuestion[] = (data.listSentenceRewriting || []).map(q => ({ type: 'SENTENCE_REWRITING', data: q, id: `sr_${q.questionId}` }));
                const combined = [...mcList, ...srList];
                if (combined.length === 0) {
                    Alert.alert("Thông báo", "Chưa có bài tập cho bài học này.");
                    navigation.goBack();
                } else {
                    setQuestions(combined);
                }
            } catch (error) {
                console.log(error);
                Alert.alert("Lỗi", "Không thể tải bài tập.");
            } finally {
                setLoading(false);
            }
        };
        fetchExercises();
    }, [lessonId]);

    useEffect(() => {
        if (questions.length > 0 && currentIndex < questions.length) {
            const currentQ = questions[currentIndex];
            setIsChecked(false); setIsCorrect(false); setMascotStatus('THINKING');
            setSelectedOption(null); setUserSentence([]);

            if (currentQ.type === 'MULTIPLE_CHOICE') {
                const data = currentQ.data as MultipleChoiceQuestion;
                const opts = [data.optionA, data.optionB, data.optionC, data.optionD].filter(Boolean);
                setShuffledOptions(shuffleArray([...opts]));
            } else if (currentQ.type === 'SENTENCE_REWRITING') {
                const data = currentQ.data as SentenceRewritingQuestion;
                const rawWords = data.originalSentence.split(',').map(w => w.trim());
                setAvailableWords(shuffleArray([...rawWords]));
            }
        }
    }, [currentIndex, questions]);

    const handleCheck = () => {
        const currentQ = questions[currentIndex];
        let correct = false;

        if (currentQ.type === 'MULTIPLE_CHOICE') {
            const data = currentQ.data as MultipleChoiceQuestion;
            if (!selectedOption) return;
            correct = selectedOption === data.correctAnswer;
        } else {
            const data = currentQ.data as SentenceRewritingQuestion;
            const normalize = (str: string) => str.replace(/\s/g, '').toLowerCase();
            const userString = userSentence.join('');
            const correctString = data.rewrittenSentence;
            correct = normalize(userString) === normalize(correctString);
        }

        setIsCorrect(correct);
        setIsChecked(true);

        // --- XỬ LÝ ÂM THANH & RUNG ---
        if (correct) {
            setMascotStatus('CORRECT');
            playFeedbackSound(true); // Phát tiếng đúng
            confettiRef.current?.play();
        } else {
            setMascotStatus('WRONG');
            playFeedbackSound(false); // Phát tiếng sai
            Vibration.vibrate([0, 100, 100, 100]); // Rung máy
            const remainingHearts = hearts - 1;
            setHearts(remainingHearts);

            if (remainingHearts <= 0) {
                setTimeout(() => {
                    Alert.alert(
                        "Rất tiếc! 💔",
                        "Bạn đã sai quá 5 lần. Hãy quay lại ôn tập từ vựng nhé!",
                        [{ text: "Ôn lại từ vựng", onPress: () => navigation.navigate('VocabularyScreen' as any, { lessonId, lessonTitle }), style: 'default' }],
                        { cancelable: false }
                    );
                }, 500);
            }
        }
    };

    const handleNext = () => {
        if (isCorrect) {
            if (currentIndex < questions.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                processExerciseCompletion();
            }
        } else {
            setIsChecked(false);
            setMascotStatus('THINKING');
            setSelectedOption(null);
            setUserSentence([]);
            const currentQ = questions[currentIndex];
            if (currentQ.type === 'MULTIPLE_CHOICE') {
                const data = currentQ.data as MultipleChoiceQuestion;
                const opts = [data.optionA, data.optionB, data.optionC, data.optionD].filter(Boolean);
                setShuffledOptions(shuffleArray([...opts]));
            } else if (currentQ.type === 'SENTENCE_REWRITING') {
                const data = currentQ.data as SentenceRewritingQuestion;
                const rawWords = data.originalSentence.split(',').map(w => w.trim());
                setAvailableWords(shuffleArray([...rawWords]));
            }
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                <ActivityIndicator size="large" color="#58CC02" />
                <Text style={{ marginTop: 10, color: '#777' }}>Đang tải bài tập...</Text>
            </View>
        );
    }

    if (questions.length === 0) return null;

    const currentQuestion = questions[currentIndex];
    const progress = (currentIndex + 1) / questions.length;

    return (
        <SafeAreaView style={styles.safeArea}>
            <LevelUpModal visible={showLevelUpModal} levelData={newLevelData} onClose={showPostCompletionOptions} />
            <LessonCompletionModal visible={showCompletionModal} xpGained={xpReceived} onClose={showPostCompletionOptions} />

            {isCorrect && isChecked && (
                <View style={styles.lottieOverlay} pointerEvents="none">
                    <LottieView ref={confettiRef} source={confetti} autoPlay={false} loop={false} style={{ width: '100%', height: '100%' }} />
                </View>
            )}

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="close-outline" size={32} color="#9CA3AF" />
                </TouchableOpacity>
                <View style={styles.progressContainer}>
                    <Progress.Bar progress={progress} width={width - 140} color="#3B82F6" unfilledColor="#E5E7EB" borderWidth={0} height={12} borderRadius={8} />
                </View>
                <View style={styles.heartContainer}>
                    <Ionicons name="heart" size={28} color="#EF4444" />
                    <Text style={styles.heartText}>{hearts}</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <MascotFeedback status={mascotStatus} />
                {currentQuestion.type === 'MULTIPLE_CHOICE' ? (
                    <MultipleChoiceView
                        data={currentQuestion.data as MultipleChoiceQuestion}
                        options={shuffledOptions}
                        onSelect={setSelectedOption}
                        selectedOption={selectedOption}
                        isChecked={isChecked}
                        correctAnswer={(currentQuestion.data as MultipleChoiceQuestion).correctAnswer}
                    />
                ) : (
                    <SentenceRewritingView
                        userSentence={userSentence} setUserSentence={setUserSentence}
                        availableWords={availableWords} setAvailableWords={setAvailableWords}
                        isChecked={isChecked}
                    />
                )}
            </ScrollView>

            <Animatable.View animation={isChecked ? "slideInUp" : undefined} duration={300} style={[styles.footer, isChecked ? (isCorrect ? styles.footerCorrect : styles.footerWrong) : {}]}>
                {!isChecked ? (
                    <TouchableOpacity
                        style={[styles.checkButton, (!selectedOption && userSentence.length === 0) && { backgroundColor: '#E5E7EB', borderColor: '#E5E7EB' }]}
                        onPress={handleCheck}
                        disabled={!selectedOption && userSentence.length === 0}
                    >
                        <Text style={[styles.checkButtonText, (!selectedOption && userSentence.length === 0) && { color: '#A1A1AA' }]}>KIỂM TRA</Text>
                    </TouchableOpacity>
                ) : (
                    <View>
                        <View style={styles.feedbackHeader}>
                            <View style={styles.iconFeedback}>
                                <Ionicons name={isCorrect ? "checkmark" : "close"} size={30} color={isCorrect ? "#58CC02" : "#EF4444"} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.feedbackTitle, { color: isCorrect ? '#15803D' : '#B91C1C' }]}>{isCorrect ? "Chính xác!" : "Chưa đúng rồi!"}</Text>
                                {!isCorrect && currentQuestion.type === 'MULTIPLE_CHOICE' && (
                                    <Text style={{ color: '#B91C1C' }}>Đáp án đúng: {(currentQuestion.data as MultipleChoiceQuestion).correctAnswer}</Text>
                                )}
                                {!isCorrect && currentQuestion.type === 'SENTENCE_REWRITING' && (
                                    <Text style={{ color: '#B91C1C' }}>Đáp án đúng: {(currentQuestion.data as SentenceRewritingQuestion).rewrittenSentence}</Text>
                                )}
                            </View>
                        </View>
                        <TouchableOpacity style={[styles.checkButton, { backgroundColor: isCorrect ? '#58CC02' : '#EF4444', borderColor: isCorrect ? '#46A302' : '#B91C1C' }]} onPress={handleNext}>
                            <Text style={styles.checkButtonText}>{isCorrect ? "TIẾP TỤC" : "LÀM LẠI NGAY"}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </Animatable.View>
        </SafeAreaView>
    );
};

// --- Styles giữ nguyên ---
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFF' },
    lottieOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, justifyContent: 'space-between' },
    progressContainer: { alignItems: 'center', justifyContent: 'center', flex: 1, marginHorizontal: 15 },
    heartContainer: { flexDirection: 'row', alignItems: 'center' },
    heartText: { color: '#EF4444', fontWeight: 'bold', fontSize: 16, marginLeft: 4 },
    scrollContent: { padding: 20, paddingBottom: 150 },
    mascotContainer: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 20, height: 100 },
    mascotImage: { width: 80, height: 80, marginRight: 10 },
    bubble: { flex: 1, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#E5E7EB', padding: 12, borderRadius: 16, marginBottom: 20, paddingLeft: 20 },
    bubbleArrow: { position: 'absolute', left: -12, bottom: 20, width: 0, height: 0, borderTopWidth: 10, borderTopColor: 'transparent', borderBottomWidth: 10, borderBottomColor: 'transparent', borderRightWidth: 12, borderRightColor: '#E5E7EB' },
    bubbleText: { color: '#4B5563', fontSize: 15, fontWeight: '600' },
    contentContainer: { marginTop: 10 },
    questionText: { fontSize: 20, color: '#1F2937', fontWeight: 'bold', marginBottom: 25, lineHeight: 28 },
    optionsContainer: { gap: 12 },
    optionButton: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 2, borderBottomWidth: 4 },
    optionLabel: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    optionLabelText: { fontWeight: 'bold', color: '#6B7280', fontSize: 14 },
    optionText: { fontSize: 17, fontWeight: '500' },
    sentenceBox: { minHeight: 60, flexDirection: 'row', flexWrap: 'wrap', borderBottomWidth: 2, borderBottomColor: '#E5E7EB', marginBottom: 30, paddingVertical: 10 },
    linePlaceholder: { height: 2, backgroundColor: '#E5E7EB', width: '100%', marginTop: 20 },
    wordWrapArea: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    wordPool: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
    wordChipNormal: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E7EB', borderBottomWidth: 4, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 },
    wordTextNormal: { fontSize: 16, color: '#374151', fontWeight: '600' },
    wordChipSelected: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#3B82F6', borderBottomWidth: 4, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, marginBottom: 8, shadowColor: "#3B82F6", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2 },
    wordTextSelected: { fontSize: 16, color: '#3B82F6', fontWeight: 'bold' },
    footer: { position: 'absolute', bottom: 0, width: '100%', borderTopWidth: 1, borderTopColor: '#F3F4F6', backgroundColor: '#FFF', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 50, shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 5 },
    footerCorrect: { backgroundColor: '#D1FAE5', borderTopWidth: 0 },
    footerWrong: { backgroundColor: '#FEE2E2', borderTopWidth: 0 },
    feedbackHeader: { flexDirection: 'row', marginBottom: 15, alignItems: 'center' },
    iconFeedback: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
    feedbackTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 2 },
    checkButton: { backgroundColor: '#3B82F6', paddingVertical: 16, borderRadius: 16, alignItems: 'center', borderWidth: 0, borderBottomWidth: 4, borderColor: '#2563EB' },
    checkButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 }
});

export default ExerciseScreen;