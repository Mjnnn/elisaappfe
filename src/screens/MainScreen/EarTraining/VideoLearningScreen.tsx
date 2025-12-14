import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    ActivityIndicator,
    Alert,
    Keyboard,
    ScrollView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import YoutubePlayer, { YoutubeIframeRef } from "react-native-youtube-iframe";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';

// Hãy đảm bảo đường dẫn import service đúng với dự án của bạn
import videoService from '../../../services/videoService';
import { EnglishVideoResponse } from '../../../types/response/VideoResponse';

const { width } = Dimensions.get('window');

// 1. ĐỊNH NGHĨA MÀU THEO LEVEL
const LEVEL_THEMES: Record<string, { primary: string; secondary: string; name: string }> = {
    A1: { primary: '#FF6B6B', secondary: '#FFEBEE', name: 'Beginner' },
    A2: { primary: '#FF9F43', secondary: '#FFF3E0', name: 'Elementary' },
    B1: { primary: '#FDCB6E', secondary: '#FFF8E1', name: 'Intermediate' },
    B2: { primary: '#2ECC71', secondary: '#E8F5E9', name: 'Upper-Inter' },
    C1: { primary: '#0984E3', secondary: '#E3F2FD', name: 'Advanced' },
    C2: { primary: '#6C5CE7', secondary: '#EDE7F6', name: 'Proficiency' },
    DEFAULT: { primary: '#2196F3', secondary: '#E3F2FD', name: 'General' } // Fallback
};

// Theme cơ bản (giữ lại các màu trung tính)
const BASE_THEME = {
    background: '#F5F7FA',
    cardBg: '#FFFFFF',
    textDark: '#2D3436',
    textLight: '#636e72',
    success: '#00B894',
    error: '#FF7675',
    hint: '#B2BEC3'
};

const VideoLearningScreen = ({ route, navigation }: any) => {
    const { videoId } = route.params;

    // --- STATE ---
    const [videoData, setVideoData] = useState<EnglishVideoResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [playing, setPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [status, setStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');
    const [isRevealed, setIsRevealed] = useState(false);

    const playerRef = useRef<YoutubeIframeRef>(null);
    const inputRef = useRef<any>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    // --- 2. TÍNH TOÁN THEME HIỆN TẠI ---
    const currentLevelCode = videoData?.level ? videoData.level.toUpperCase() : 'DEFAULT';
    const activeTheme = LEVEL_THEMES[currentLevelCode] || LEVEL_THEMES.DEFAULT;

    const maskContent = (content: string) => {
        return content.split(' ').map(word => '*'.repeat(word.length)).join(' ');
    };

    // --- 1. LẤY DATA ---
    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await videoService.getVideoById(videoId);
                if (response && response.data) {
                    setVideoData(response.data);
                }
            } catch (error) {
                Alert.alert("Lỗi", "Không tải được video.");
                navigation.goBack();
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [videoId]);

    // --- 2. LOGIC ĐỒNG BỘ VIDEO ---
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (playing && videoData?.subtitles) {
            interval = setInterval(async () => {
                try {
                    const timeInSeconds = await playerRef.current?.getCurrentTime();
                    if (timeInSeconds !== undefined && videoData.subtitles[currentIndex]) {
                        const currentTimeMs = timeInSeconds * 1000;
                        const currentSub = videoData.subtitles[currentIndex];

                        // Tự động dừng khi hết câu
                        if (currentTimeMs >= currentSub.endTime - 100) {
                            setPlaying(false);
                        }
                    }
                } catch (e) {
                    console.log("Lỗi lấy thời gian video:", e);
                }
            }, 250);
        }
        return () => clearInterval(interval);
    }, [playing, currentIndex, videoData]);

    // --- CÁC HÀM XỬ LÝ ---

    // Hàm mới: Xử lý logic Play/Pause thông minh hơn
    const togglePlaying = async () => {
        if (playing) {
            setPlaying(false);
        } else {
            // Khi bấm Play: Kiểm tra xem video có đang kẹt ở cuối câu không
            if (videoData && videoData.subtitles[currentIndex]) {
                try {
                    const currentSub = videoData.subtitles[currentIndex];
                    const currentTime = await playerRef.current?.getCurrentTime();

                    // Nếu thời gian hiện tại đã vượt quá (hoặc gần sát) thời gian kết thúc câu (trừ hao 200ms)
                    // Thì tua lại đầu câu để tránh bị logic interval dừng lại ngay lập tức
                    if (currentTime && (currentTime * 1000 >= currentSub.endTime - 200)) {
                        playerRef.current?.seekTo(currentSub.startTime / 1000, true);
                    }
                } catch (e) {
                    console.log("Lỗi check thời gian:", e);
                }
            }
            setPlaying(true);
        }
    };

    const checkAnswer = () => {
        if (!videoData) return;
        const currentSub = videoData.subtitles[currentIndex];
        const normalize = (str: string) => str.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");

        if (normalize(userInput) === normalize(currentSub.content)) {
            setStatus('CORRECT');
            setIsRevealed(true);
            Keyboard.dismiss();
        } else {
            setStatus('WRONG');
            inputRef.current?.shake(800);
        }
    };

    const nextSentence = () => {
        if (!videoData) return;
        const nextIdx = currentIndex + 1;
        if (nextIdx < videoData.subtitles.length) {
            setCurrentIndex(nextIdx);
            setUserInput('');
            setStatus('IDLE');
            setIsRevealed(false);
            const nextSub = videoData.subtitles[nextIdx];
            playerRef.current?.seekTo(nextSub.startTime / 1000, true);
            setPlaying(true);
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        } else {
            Alert.alert("Chúc mừng!", "Bạn đã hoàn thành bài học.");
        }
    };

    const replayCurrentSentence = () => {
        if (!videoData) return;
        const currentSub = videoData.subtitles[currentIndex];
        playerRef.current?.seekTo(currentSub.startTime / 1000, true);
        setPlaying(true);
    };

    const toggleReveal = () => {
        setIsRevealed(!isRevealed);
        if (!isRevealed) {
            setStatus('IDLE');
        }
    };

    const changeSpeed = () => {
        const speeds = [0.5, 0.75, 1.0, 1.25, 1.5];
        const currentIdx = speeds.indexOf(playbackSpeed);
        const nextSpeed = speeds[(currentIdx + 1) % speeds.length];
        setPlaybackSpeed(nextSpeed);
    };

    if (loading || !videoData) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={LEVEL_THEMES.DEFAULT.primary} />
            </View>
        );
    }

    const currentSub = videoData.subtitles[currentIndex];
    const progressPercent = ((currentIndex) / videoData.subtitles.length) * 100;

    return (
        <View style={styles.container}>
            {/* --- HEADER --- */}
            <StatusBar
                barStyle="light-content"
                backgroundColor="transparent"
                translucent={true}
            />

            <View style={[
                styles.headerBackground,
                {
                    backgroundColor: activeTheme.primary,
                    shadowColor: activeTheme.primary
                }
            ]}>
                <SafeAreaView>
                    <View style={styles.headerContent}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.headerBtn}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <MaterialCommunityIcons name="arrow-left" size={26} color="#FFF" />
                        </TouchableOpacity>

                        <View style={styles.headerTitleContainer}>
                            <Text style={styles.headerSubtitle}>
                                {activeTheme.name.toUpperCase()} - {videoData.level}
                            </Text>
                            <Text style={styles.headerTitleMain} numberOfLines={1}>
                                {videoData.title}
                            </Text>
                        </View>

                        <View style={[styles.headerBtn, { backgroundColor: 'transparent' }]} />
                    </View>
                </SafeAreaView>
            </View>

            {/* --- VIDEO PLAYER & CONTROLS --- */}
            <View style={styles.videoContainer}>
                <YoutubePlayer
                    ref={playerRef}
                    height={220}
                    play={playing}
                    videoId={videoData.youtubeId}
                    playbackRate={playbackSpeed}
                    onChangeState={(state: string) => {
                        if (state === 'ended') setPlaying(false);
                        if (state === "playing") setPlaying(true);
                        if (state === "paused") setPlaying(false);
                    }}
                    initialPlayerParams={{ controls: 1, modestbranding: true, rel: false }}
                />

                <View style={styles.overallProgress}>
                    <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: activeTheme.primary }]} />
                </View>

                {/* SỬA LOGIC NÚT BẮT ĐẦU / TẠM DỪNG TẠI ĐÂY */}
                <View style={styles.videoControlsRow}>
                    <TouchableOpacity
                        style={[styles.videoControlBtn, { backgroundColor: activeTheme.secondary }]}
                        onPress={togglePlaying} // Sử dụng hàm togglePlaying mới
                    >
                        <MaterialCommunityIcons
                            name={playing ? "pause" : "play"}
                            size={20}
                            color={activeTheme.primary}
                        />
                        <Text style={[styles.videoControlText, { color: activeTheme.primary }]}>
                            {playing ? "Tạm dừng" : "Bắt đầu"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.videoControlBtn, { backgroundColor: activeTheme.secondary }]} onPress={replayCurrentSentence}>
                        <MaterialCommunityIcons name="refresh" size={20} color={activeTheme.primary} />
                        <Text style={[styles.videoControlText, { color: activeTheme.primary }]}>Phát lại câu</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* --- SCROLL CONTENT --- */}
            <ScrollView
                ref={scrollViewRef}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* DICTATION CARD */}
                <View style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle}>Chép chính tả</Text>
                        <View style={styles.dictationControls}>
                            <TouchableOpacity onPress={() => Alert.alert("Hướng dẫn", "Nghe video và điền từ còn thiếu.")}>
                                <MaterialCommunityIcons name="information-outline" size={20} color={BASE_THEME.textLight} style={styles.controlIcon} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={changeSpeed}>
                                <Text style={styles.speedText}>{playbackSpeed}x</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Text style={styles.instruction}>Gõ những gì bạn nghe được:</Text>

                    <Animatable.View ref={inputRef}>
                        <TextInput
                            style={[
                                styles.inputApi,
                                status === 'CORRECT' && styles.inputCorrect,
                                status === 'WRONG' && styles.inputWrong
                            ]}
                            placeholder="Gõ câu trả lời..."
                            placeholderTextColor="#B2BEC3"
                            multiline
                            value={userInput}
                            onChangeText={setUserInput}
                            editable={status !== 'CORRECT' && !isRevealed}
                        />
                    </Animatable.View>

                    <View style={styles.hintContainer}>
                        {isRevealed || status === 'CORRECT' ? (
                            <Animatable.View animation="fadeIn">
                                <Text style={styles.correctAnswerText}>{currentSub.content}</Text>
                            </Animatable.View>
                        ) : (
                            <Text style={styles.maskedText}>
                                {maskContent(currentSub.content)}
                            </Text>
                        )}
                    </View>

                    <View style={styles.actionButtonsContainer}>
                        {status === 'CORRECT' ? (
                            <TouchableOpacity style={[styles.actionBtn, styles.btnSuccess]} onPress={nextSentence}>
                                <Text style={styles.actionBtnText}>Tiếp theo</Text>
                                <MaterialCommunityIcons name="chevron-right" size={20} color="#fff" />
                            </TouchableOpacity>
                        ) : (
                            <>
                                <TouchableOpacity
                                    style={[
                                        styles.actionBtn,
                                        styles.btnPrimary,
                                        { backgroundColor: activeTheme.primary, shadowColor: activeTheme.primary }
                                    ]}
                                    onPress={checkAnswer}
                                >
                                    <Text style={styles.actionBtnText}>Kiểm tra</Text>
                                </TouchableOpacity>
                                {!isRevealed && (
                                    <TouchableOpacity
                                        style={[
                                            styles.actionBtn,
                                            styles.btnSecondary,
                                            { borderColor: activeTheme.primary }
                                        ]}
                                        onPress={toggleReveal}
                                    >
                                        <Text style={[styles.actionBtnText, { color: activeTheme.primary }]}>Hiện đáp án</Text>
                                    </TouchableOpacity>
                                )}
                            </>
                        )}
                        {isRevealed && status !== 'CORRECT' && (
                            <TouchableOpacity style={[styles.actionBtn, styles.btnSuccess, { marginTop: 10 }]} onPress={nextSentence}>
                                <Text style={styles.actionBtnText}>Tiếp theo (Bỏ qua)</Text>
                                <MaterialCommunityIcons name="chevron-right" size={20} color="#fff" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* TRANSCRIPT LIST */}
                <View style={styles.transcriptSection}>
                    <Text style={styles.sectionHeader}>Danh sách câu ({currentIndex + 1}/{videoData.subtitles.length})</Text>
                    {videoData.subtitles.map((sub, index) => {
                        const isActive = index === currentIndex;
                        const isPassed = index < currentIndex;
                        return (
                            <TouchableOpacity
                                key={sub.id}
                                style={[
                                    styles.transcriptItem,
                                    isActive && {
                                        borderColor: activeTheme.primary,
                                        backgroundColor: activeTheme.secondary
                                    }
                                ]}
                                onPress={() => {
                                    if (isPassed || isActive) {
                                        setCurrentIndex(index);
                                        setIsRevealed(isPassed);
                                        setStatus('IDLE');
                                        playerRef.current?.seekTo(sub.startTime / 1000, true);
                                        setPlaying(true);
                                    }
                                }}
                            >
                                <View style={styles.transcriptIndexBox}>
                                    <Text
                                        style={[
                                            styles.transcriptIndexText,
                                            isActive && { color: activeTheme.primary }
                                        ]}
                                    >
                                        #{index + 1}
                                    </Text>
                                </View>
                                <View style={styles.transcriptContentBox}>
                                    <Text style={[styles.transcriptText, isPassed && { color: BASE_THEME.textDark }]} numberOfLines={2}>
                                        {(isPassed || (isActive && isRevealed)) ? sub.content : maskContent(sub.content)}
                                    </Text>
                                </View>
                                <View style={styles.transcriptIconBox}>
                                    {isPassed ? (
                                        <MaterialCommunityIcons name="check-circle" size={20} color={BASE_THEME.success} />
                                    ) : isActive ? (
                                        <MaterialCommunityIcons name="pencil" size={20} color={activeTheme.primary} />
                                    ) : (
                                        <MaterialCommunityIcons name="lock" size={18} color={BASE_THEME.hint} />
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
};

export default VideoLearningScreen;

// --- STYLES ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BASE_THEME.background },
    center: { justifyContent: 'center', alignItems: 'center' },

    headerBackground: {
        backgroundColor: LEVEL_THEMES.DEFAULT.primary,
        paddingTop: Platform.OS === 'android' ? 0 : 0,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 8,
        shadowColor: LEVEL_THEMES.DEFAULT.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        zIndex: 100,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: 10,
    },
    headerBtn: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 10,
    },
    headerSubtitle: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.9)',
        textTransform: 'uppercase',
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 2,
    },
    headerTitleMain: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
    },

    videoContainer: {
        backgroundColor: '#000',
        elevation: 5,
        zIndex: 10,
        marginTop: 15,
        marginHorizontal: 15,
        borderRadius: 15,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    overallProgress: { height: 4, backgroundColor: '#E0E0E0' },
    progressBarFill: { height: '100%', backgroundColor: LEVEL_THEMES.DEFAULT.primary },
    videoControlsRow: { flexDirection: 'row', backgroundColor: BASE_THEME.cardBg, padding: 12, justifyContent: 'space-around', borderBottomWidth: 1, borderBottomColor: '#EEE' },
    videoControlBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: LEVEL_THEMES.DEFAULT.secondary, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
    videoControlText: { marginLeft: 6, color: LEVEL_THEMES.DEFAULT.primary, fontWeight: '600', fontSize: 13 },

    scrollView: { flex: 1 },
    scrollContent: { padding: 15, paddingBottom: 30 },

    card: { backgroundColor: BASE_THEME.cardBg, borderRadius: 16, padding: 20, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
    cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: BASE_THEME.textDark },

    dictationControls: { flexDirection: 'row', alignItems: 'center' },
    controlIcon: { marginRight: 15 },
    speedText: { fontWeight: 'bold', color: BASE_THEME.textDark, backgroundColor: BASE_THEME.background, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, fontSize: 12 },
    instruction: { fontSize: 14, color: BASE_THEME.textLight, marginBottom: 12 },
    inputApi: { backgroundColor: BASE_THEME.background, borderRadius: 12, padding: 15, fontSize: 16, color: BASE_THEME.textDark, borderWidth: 1, borderColor: '#F0F0F0', minHeight: 120, textAlignVertical: 'top' },
    inputCorrect: { borderColor: BASE_THEME.success, backgroundColor: '#E8F5E9', color: BASE_THEME.success },
    inputWrong: { borderColor: BASE_THEME.error, backgroundColor: '#FFEBEE' },

    hintContainer: { marginVertical: 20, padding: 15, backgroundColor: BASE_THEME.background, borderRadius: 12, alignItems: 'center', justifyContent: 'center', minHeight: 60 },
    maskedText: { fontSize: 18, color: BASE_THEME.hint, letterSpacing: 2, textAlign: 'center', lineHeight: 28 },
    correctAnswerText: { fontSize: 18, color: BASE_THEME.success, fontWeight: '600', textAlign: 'center', lineHeight: 28 },

    actionButtonsContainer: { flexDirection: 'column', gap: 12 },
    actionBtn: { paddingVertical: 14, borderRadius: 12, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
    btnPrimary: { backgroundColor: LEVEL_THEMES.DEFAULT.primary, shadowColor: LEVEL_THEMES.DEFAULT.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, elevation: 3 },
    btnSecondary: { backgroundColor: '#FFF', borderWidth: 1, borderColor: LEVEL_THEMES.DEFAULT.primary },
    btnSuccess: { backgroundColor: BASE_THEME.success, shadowColor: BASE_THEME.success, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, elevation: 3 },
    actionBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    transcriptSection: { marginTop: 10 },
    sectionHeader: { fontSize: 16, fontWeight: 'bold', color: BASE_THEME.textDark, marginBottom: 15, paddingLeft: 5 },
    transcriptItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: BASE_THEME.cardBg, padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#F5F5F5' },
    transcriptIndexBox: { marginRight: 12, backgroundColor: BASE_THEME.background, width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    transcriptIndexText: { fontSize: 12, fontWeight: 'bold', color: BASE_THEME.textLight },
    transcriptContentBox: { flex: 1, marginRight: 10 },
    transcriptText: { fontSize: 15, color: BASE_THEME.hint, lineHeight: 22 },
    transcriptIconBox: {},
});