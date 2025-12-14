import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    TextInput, Modal, Alert, ActivityIndicator, Platform,
    ScrollView, KeyboardAvoidingView, Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- SERVICE IMPORT ---
import exerciseService from '../../../services/exerciseService';
import { EnglishListeningDictationResponse } from '../../../types/response/ExerciseResponse';
import { EnglishListeningDictationRequest } from '../../../types/request/EnglishListeningDictationRequest';

// --- THEME COLORS (Tím chủ đạo) ---
const THEME = {
    primary: '#8B5CF6',    // Tím đậm
    light: '#F3E8FF',      // Tím nhạt
    dark: '#5B21B6',       // Tím rất đậm
    bg: '#F5F3FF',         // Nền màn hình
    white: '#FFFFFF',
    text: '#1F2937',
    subText: '#6B7280',
    danger: '#EF4444',
    success: '#10B981',
    warningBg: '#FEF2F2',
    warningBorder: '#FECACA',
    warningText: '#B91C1C'
};

const MIN_QUESTIONS_REQUIRED = 4;

const CreateListeningDictationScreen = ({ route, navigation }: any) => {
    const insets = useSafeAreaInsets();

    // Lấy lessonTitle từ params
    const { lessonId, lessonTitle } = route.params || { lessonId: 1, lessonTitle: "Listening Dictation" };

    // --- STATE ---
    const [questions, setQuestions] = useState<EnglishListeningDictationResponse[]>([]);
    const [loading, setLoading] = useState(false);

    // Audio State
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [playingId, setPlayingId] = useState<number | null>(null);

    // Form State
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<number | null>(null);

    // Input Fields
    const [title, setTitle] = useState('');
    const [transcript, setTranscript] = useState('');
    const [hintText, setHintText] = useState('');
    const [audioFile, setAudioFile] = useState<any>(null);
    const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);

    // Validation State
    const [errors, setErrors] = useState({
        title: '',
        transcript: '',
        audio: ''
    });

    // --- 1. CONFIG AUDIO & LOAD DATA ---
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

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const res = await exerciseService.getListeningDictationForChallenge(lessonId);
            if (res && res.data) {
                setQuestions(res.data);
            }
        } catch (error) {
            console.log("Lỗi lấy danh sách:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- 2. AUDIO HANDLER ---
    const handlePlayAudio = async (url: string, id: number) => {
        try {
            if (playingId === id && sound) {
                await sound.pauseAsync();
                setPlayingId(null);
                return;
            }

            if (sound) {
                await sound.unloadAsync();
                setSound(null);
            }

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: url },
                { shouldPlay: true }
            );

            setSound(newSound);
            setPlayingId(id);

            newSound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish) {
                    setPlayingId(null);
                }
            });

        } catch (error) {
            console.log("Audio Error:", error);
            Alert.alert("Lỗi", "Không thể phát file này.");
            setPlayingId(null);
        }
    };

    // --- 3. FORM HANDLERS & VALIDATION ---
    const handlePickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'audio/*',
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                setAudioFile(file);
                setCurrentAudioUrl(null);
                setErrors(prev => ({ ...prev, audio: '' }));
            }
        } catch (err) {
            console.log("Picker Error: ", err);
        }
    };

    const resetForm = () => {
        setTitle('');
        setTranscript('');
        setHintText('');
        setAudioFile(null);
        setCurrentAudioUrl(null);
        setIsEditing(false);
        setCurrentId(null);
        setErrors({ title: '', transcript: '', audio: '' });
    };

    const handleBlur = (field: 'title' | 'transcript') => {
        let errorMessage = '';
        if (field === 'title' && !title.trim()) {
            errorMessage = 'Không được để trống tiêu đề.';
        }
        if (field === 'transcript' && !transcript.trim()) {
            errorMessage = 'Không được để trống nội dung transcript.';
        }

        setErrors(prev => ({ ...prev, [field]: errorMessage }));
    };

    const openAddModal = () => {
        resetForm();
        setModalVisible(true);
    };

    const openEditModal = (item: EnglishListeningDictationResponse) => {
        setErrors({ title: '', transcript: '', audio: '' });

        setTitle(item.title);
        setTranscript(item.transcript);
        setHintText(item.hintText);
        setCurrentAudioUrl(item.audioUrl);
        setAudioFile(null);
        setCurrentId(item.id);
        setIsEditing(true);
        setModalVisible(true);
    };

    const handleSave = async () => {
        const titleError = !title.trim() ? 'Không được để trống tiêu đề.' : '';
        const transcriptError = !transcript.trim() ? 'Không được để trống nội dung transcript.' : '';
        const audioError = (!isEditing && !audioFile) ? 'Vui lòng chọn file âm thanh.' : '';

        setErrors({
            title: titleError,
            transcript: transcriptError,
            audio: audioError
        });

        if (titleError || transcriptError || audioError) {
            return;
        }

        setLoading(true);
        try {
            const requestData: EnglishListeningDictationRequest = {
                title: title.trim(),
                transcript: transcript.trim(),
                hintText: hintText.trim(),
                audioUrl: currentAudioUrl || ""
            };

            if (isEditing && currentId) {
                const response = await exerciseService.updateListeningDictationQuestion(currentId, requestData);
                if (response.status === 200 || response.data) {
                    const updatedItem = response.data;
                    setQuestions(prev => prev.map(q => q.id === currentId ? updatedItem : q));
                    Alert.alert("Thành công", "Đã cập nhật câu hỏi.");
                    setModalVisible(false);
                }
            } else {
                const fileToUpload = {
                    uri: audioFile.uri,
                    name: audioFile.name || 'audio.mp3',
                    type: audioFile.mimeType || 'audio/mpeg'
                } as any;

                const response = await exerciseService.createListeningDictationQuestion(lessonId, requestData, fileToUpload);
                if (response.status === 200 || response.data) {
                    const newItem = response.data;
                    setQuestions(prev => [...prev, newItem]);
                    Alert.alert("Thành công", "Đã thêm câu hỏi mới.");
                    setModalVisible(false);
                }
            }
        } catch (error) {
            console.log("Lỗi Save:", error);
            Alert.alert("Lỗi", "Có lỗi xảy ra khi lưu dữ liệu. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: number) => {
        Alert.alert("Xác nhận", "Bạn có chắc muốn xoá câu hỏi này?", [
            { text: "Huỷ", style: "cancel" },
            {
                text: "Xoá", style: "destructive",
                onPress: async () => {
                    try {
                        setLoading(true);
                        const response = await exerciseService.deleteListeningDictationQuestion(id);
                        if (response.status === 200 || response.status === 204) {
                            setQuestions(prev => prev.filter(q => q.id !== id));
                        } else {
                            Alert.alert("Lỗi", "Không thể xoá câu hỏi.");
                        }
                    } catch (error) {
                        console.log("Lỗi xoá:", error);
                        Alert.alert("Lỗi", "Có lỗi xảy ra khi xoá.");
                    } finally {
                        setLoading(false);
                    }
                }
            }
        ]);
    };

    // --- RENDER COMPONENT: WARNING BANNER ---
    const renderWarningBanner = () => {
        if (questions.length >= MIN_QUESTIONS_REQUIRED) return null;

        return (
            <Animatable.View animation="fadeInDown" duration={600} style={styles.warningContainer}>
                <View style={styles.warningIconBox}>
                    <Ionicons name="warning" size={24} color="#F59E0B" />
                </View>
                <View style={styles.warningContent}>
                    <Text style={styles.warningTitle}>Chưa đủ điều kiện!</Text>
                    <Text style={styles.warningText}>
                        Cần tối thiểu {MIN_QUESTIONS_REQUIRED} câu để học viên có thể bắt đầu thử thách.
                        (Hiện tại: {questions.length}/{MIN_QUESTIONS_REQUIRED})
                    </Text>
                </View>
            </Animatable.View>
        );
    };

    // --- RENDER ITEM ---
    const renderItem = ({ item, index }: { item: EnglishListeningDictationResponse, index: number }) => {
        const isPlaying = playingId === item.id;

        return (
            <Animatable.View
                animation="fadeInUp"
                duration={500}
                delay={index * 100}
                style={styles.card}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.tagContainer}>
                        <Text style={styles.tagText}>Câu {index + 1}</Text>
                    </View>
                    <View style={styles.actionButtons}>
                        <TouchableOpacity onPress={() => openEditModal(item)} style={styles.iconBtn}>
                            <MaterialCommunityIcons name="pencil" size={20} color={THEME.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(item.id)} style={[styles.iconBtn, { marginLeft: 8 }]}>
                            <MaterialCommunityIcons name="trash-can-outline" size={20} color={THEME.danger} />
                        </TouchableOpacity>
                    </View>
                </View>

                {item.hintText ? (
                    <View style={styles.hintContainer}>
                        <MaterialCommunityIcons name="lightbulb-on-outline" size={18} color="#F59E0B" style={{ marginRight: 6 }} />
                        <Text style={styles.hintText} numberOfLines={1}>{item.hintText}</Text>
                    </View>
                ) : null}

                <View style={styles.contentContainer}>
                    <View style={styles.titleWrapper}>
                        <Text style={styles.questionTitle}>{item.title}</Text>
                        <Text style={styles.transcriptPreview} numberOfLines={1}>"{item.transcript}"</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.playButton, isPlaying && styles.playingButton]}
                        onPress={() => handlePlayAudio(item.audioUrl, item.id)}
                    >
                        <Ionicons
                            name={isPlaying ? "pause" : "play"}
                            size={22}
                            color="white"
                            style={!isPlaying ? { marginLeft: 2 } : {}}
                        />
                    </TouchableOpacity>
                </View>
            </Animatable.View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header đã bỏ nút Back */}
            <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                style={[styles.header, { paddingTop: insets.top }]}
            >
                <View style={styles.headerContent}>
                    {/* BỎ NÚT TOUCHABLE OPACITY BACK Ở ĐÂY */}
                    <View>
                        <Text style={styles.headerTitle}>Bài Tập</Text>
                        <Text style={styles.headerSubtitle}>
                            Lesson: <Text style={{ fontWeight: 'bold', color: '#fff' }}>{lessonTitle}</Text>
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            <View style={styles.body}>
                <View style={styles.listControlHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialCommunityIcons name="playlist-music" size={26} color={THEME.primary} />
                        <Text style={styles.listTitle}>Danh sách câu hỏi</Text>
                    </View>
                    <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
                        <Ionicons name="add" size={20} color="#FFF" />
                        <Text style={styles.addButtonText}>Thêm câu</Text>
                    </TouchableOpacity>
                </View>

                {loading && questions.length === 0 ? (
                    <ActivityIndicator size="large" color={THEME.primary} style={{ marginTop: 20 }} />
                ) : (
                    <FlatList
                        ListHeaderComponent={renderWarningBanner}
                        data={questions}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={{ alignItems: 'center', marginTop: 50 }}>
                                <Text style={{ color: '#9CA3AF' }}>Chưa có câu hỏi nào.</Text>
                            </View>
                        }
                    />
                )}
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{isEditing ? "Chỉnh Sửa" : "Tạo Mới"}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                            <Text style={styles.label}>Tiêu đề <Text style={{ color: 'red' }}>*</Text></Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    errors.title ? styles.inputError : {}
                                ]}
                                placeholder="Ví dụ: Daily Routine"
                                value={title}
                                onChangeText={(text) => {
                                    setTitle(text);
                                    if (text.trim()) setErrors(prev => ({ ...prev, title: '' }));
                                }}
                                onBlur={() => handleBlur('title')}
                            />
                            {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}

                            <Text style={styles.label}>Transcript <Text style={{ color: 'red' }}>*</Text></Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    styles.textArea,
                                    errors.transcript ? styles.inputError : {}
                                ]}
                                placeholder="Nhập nội dung chính xác của bài nghe..."
                                multiline
                                value={transcript}
                                onChangeText={(text) => {
                                    setTranscript(text);
                                    if (text.trim()) setErrors(prev => ({ ...prev, transcript: '' }));
                                }}
                                onBlur={() => handleBlur('transcript')}
                            />
                            {errors.transcript ? <Text style={styles.errorText}>{errors.transcript}</Text> : null}

                            <Text style={styles.label}>Gợi ý (Hint)</Text>
                            <View style={styles.inputIconWrapper}>
                                <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#F59E0B" style={{ marginRight: 8 }} />
                                <TextInput
                                    style={styles.inputNoBorder}
                                    placeholder="Gợi ý ngữ pháp, từ vựng..."
                                    value={hintText} onChangeText={setHintText}
                                />
                            </View>

                            <Text style={styles.label}>File âm thanh <Text style={{ color: 'red' }}>*</Text></Text>

                            {!isEditing && (
                                <>
                                    <TouchableOpacity
                                        style={[
                                            styles.pickFileButton,
                                            errors.audio ? { borderColor: THEME.danger, backgroundColor: '#FEF2F2' } : {}
                                        ]}
                                        onPress={handlePickDocument}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                            <View style={[styles.iconBox, { backgroundColor: THEME.light }]}>
                                                <MaterialCommunityIcons name="music-note" size={24} color={THEME.primary} />
                                            </View>
                                            <View style={{ marginLeft: 12, flex: 1 }}>
                                                <Text style={styles.pickFileTitle} numberOfLines={1}>
                                                    {audioFile ? audioFile.name : "Chưa chọn file"}
                                                </Text>
                                                <Text style={styles.pickFileSub}>
                                                    {audioFile ? "Nhấn để thay đổi" : "Nhấn để tải lên file MP3"}
                                                </Text>
                                            </View>
                                        </View>
                                        {audioFile && (
                                            <Ionicons name="checkmark-circle" size={24} color={THEME.success} />
                                        )}
                                    </TouchableOpacity>
                                    {errors.audio ? <Text style={styles.errorText}>{errors.audio}</Text> : null}
                                </>
                            )}

                            {isEditing && (
                                <View style={styles.pickFileButton}>
                                    <MaterialCommunityIcons name="information-outline" size={24} color={THEME.subText} />
                                    <Text style={[styles.pickFileSub, { marginLeft: 10 }]}>
                                        Hiện tại chưa hỗ trợ cập nhật file âm thanh trực tiếp.
                                    </Text>
                                </View>
                            )}

                        </ScrollView>

                        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Lưu dữ liệu</Text>}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.bg },

    header: {
        paddingTop: Platform.OS === 'android' ? 40 : 60, paddingHorizontal: 20, paddingBottom: 20,
        backgroundColor: '#3B82F6', borderBottomRightRadius: 24, borderBottomLeftRadius: 24, elevation: 5
    },
    // Đã bỏ alignItems: center để text tự căn trái, flex direction vẫn giữ row nhưng chỉ có 1 view con nên không ảnh hưởng nhiều
    headerContent: { flexDirection: 'row', alignItems: 'center' },

    // backButton: { marginRight: 15 }, // Đã xóa nút back nên không cần style này nữa

    headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
    headerSubtitle: { fontSize: 14, color: '#B2BEC3', marginTop: 4 },

    body: { flex: 1, paddingHorizontal: 16 },
    listControlHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 20 },
    listTitle: { fontSize: 18, fontWeight: 'bold', color: THEME.primary, marginLeft: 10 },

    addButton: {
        flexDirection: 'row', backgroundColor: THEME.primary,
        paddingVertical: 6, paddingHorizontal: 12, borderRadius: 25, alignItems: 'center',
        elevation: 4, shadowColor: THEME.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 4
    },
    addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },

    warningContainer: {
        flexDirection: 'row',
        backgroundColor: THEME.warningBg,
        borderWidth: 1,
        borderColor: THEME.warningBorder,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    warningIconBox: {
        marginRight: 12,
        justifyContent: 'flex-start',
        marginTop: 2
    },
    warningContent: { flex: 1 },
    warningTitle: {
        color: THEME.warningText,
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4
    },
    warningText: {
        color: '#7F1D1D',
        fontSize: 14,
        lineHeight: 20
    },

    card: {
        backgroundColor: '#FFF', borderRadius: 20, padding: 16, marginBottom: 16,
        borderLeftWidth: 5, borderLeftColor: THEME.primary,
        elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    tagContainer: { backgroundColor: THEME.light, paddingVertical: 4, paddingHorizontal: 12, borderRadius: 10 },
    tagText: { color: THEME.dark, fontWeight: 'bold', fontSize: 12 },
    actionButtons: { flexDirection: 'row' },
    iconBtn: { padding: 4 },

    hintContainer: { flexDirection: 'row', marginBottom: 12, backgroundColor: '#FFFBEB', padding: 8, borderRadius: 8 },
    hintText: { fontSize: 13, color: '#B45309', fontStyle: 'italic', flex: 1 },

    contentContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 16, padding: 12 },
    titleWrapper: { flex: 1, marginRight: 10 },
    questionTitle: { fontSize: 16, fontWeight: 'bold', color: THEME.text, marginBottom: 4 },
    transcriptPreview: { fontSize: 13, color: THEME.subText },

    playButton: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: THEME.primary,
        justifyContent: 'center', alignItems: 'center',
        elevation: 4, shadowColor: THEME.primary, shadowOpacity: 0.4, shadowRadius: 5
    },
    playingButton: { backgroundColor: THEME.dark },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalContent: {
        backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25,
        padding: 20, height: '85%', elevation: 20
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: THEME.text },
    modalBody: { flex: 1 },

    label: { fontSize: 14, fontWeight: '700', color: THEME.text, marginBottom: 8, marginTop: 12 },

    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: THEME.text
    },
    inputError: {
        borderColor: THEME.danger,
        backgroundColor: '#FEF2F2'
    },
    errorText: {
        color: THEME.danger,
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4
    },

    textArea: { height: 100, textAlignVertical: 'top' },
    inputIconWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FCD34D', borderRadius: 12, paddingHorizontal: 12 },
    inputNoBorder: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#B45309' },

    pickFileButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 12,
        borderStyle: 'dashed'
    },
    iconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    pickFileTitle: { fontSize: 15, fontWeight: '600', color: THEME.text },
    pickFileSub: { fontSize: 12, color: THEME.subText },

    saveButton: { backgroundColor: THEME.primary, paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 20, marginBottom: 20 },
    saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default CreateListeningDictationScreen;