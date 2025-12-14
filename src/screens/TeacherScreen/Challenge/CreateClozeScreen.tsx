import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    TextInput, Modal, Alert, ActivityIndicator, Platform,
    ScrollView, KeyboardAvoidingView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- SERVICE & TYPES IMPORT ---
import exerciseService from '../../../services/exerciseService';
import {
    EnglishClozeExerciseResponse,
    EnglishClozeBlankResponse
} from '../../../types/response/ExerciseResponse';
import {
    EnglishClozeExerciseRequest,
    EnglishClozeBlankRequest
} from '../../../types/request/EnglishClozeExerciseRequest';

// --- THEME COLORS (Modified: White Background with Rose Accents) ---
const THEME = {
    primary: '#E11D48',    // Hồng đậm (Giữ lại cho các điểm nhấn)
    light: '#FFE4E6',      // Hồng phấn nhạt (Nền tag)
    dark: '#9F1239',       // Hồng tối (Text tag)
    bg: '#FFFFFF',         // <--- ĐÃ ĐỔI VỀ NỀN TRẮNG
    white: '#FFFFFF',
    text: '#881337',       // Text màu đỏ rượu
    subText: '#64748B',
    danger: '#EF4444',
    success: '#10B981',
    warningBg: '#FEF2F2',  // Nền cảnh báo (giữ nguyên màu nhẹ)
    warningBorder: '#FECACA',
    warningText: '#B91C1C',
    inputBorder: '#E2E8F0',
    inputBg: '#F8FAFC'     // Nền input (giữ màu xám rất nhạt để phân biệt với nền trắng)
};

const MIN_QUESTIONS_REQUIRED = 3;

const CreateClozeScreen = ({ route, navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { lessonId, lessonTitle } = route.params || { lessonId: 1, lessonTitle: "Cloze Exercise" };

    // --- STATE ---
    const [exercises, setExercises] = useState<EnglishClozeExerciseResponse[]>([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<number | null>(null);

    // Input Fields
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    // Quản lý danh sách Blanks
    const [blanksInput, setBlanksInput] = useState<EnglishClozeBlankRequest[]>([]);

    // Validation State
    const [errors, setErrors] = useState({
        title: '',
        content: '',
        blanks: ''
    });

    // --- 1. FETCH DATA FROM API ---
    useEffect(() => {
        fetchExercises();
    }, []);

    const fetchExercises = async () => {
        setLoading(true);
        try {
            const res = await exerciseService.getClozeForChallenge(lessonId);
            if (res && res.data) {
                setExercises(res.data);
            }
        } catch (error) {
            console.log("Lỗi lấy dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- 2. FORM LOGIC ---
    const resetForm = () => {
        setTitle('');
        setContent('');
        setBlanksInput([]);
        setErrors({ title: '', content: '', blanks: '' });
        setIsEditing(false);
        setCurrentId(null);
    };

    const handleBlur = (field: 'title' | 'content') => {
        let errorMessage = '';
        if (field === 'title' && !title.trim()) errorMessage = 'Tiêu đề không được để trống.';
        if (field === 'content' && !content.trim()) errorMessage = 'Nội dung đoạn văn không được để trống.';
        setErrors(prev => ({ ...prev, [field]: errorMessage }));
    };

    // --- LOGIC XỬ LÝ BLANKS ---
    const handleInsertBlank = () => {
        const newBlankIndex = blanksInput.length + 1;
        setContent(prev => prev + (prev.length > 0 && prev.slice(-1) !== ' ' ? ' ' : '') + "_____ ");

        const newBlank: EnglishClozeBlankRequest = {
            blankIndex: newBlankIndex,
            correctAnswer: '',
            hint: ''
        };
        setBlanksInput(prev => [...prev, newBlank]);
    };

    const updateBlankItem = (index: number, field: keyof EnglishClozeBlankRequest, value: any) => {
        const updatedBlanks = [...blanksInput];
        updatedBlanks[index] = { ...updatedBlanks[index], [field]: value };
        setBlanksInput(updatedBlanks);
    };

    const handleResetContent = () => {
        setContent('');
        setBlanksInput([]);
    };

    // --- MODAL HANDLERS ---
    const openAddModal = () => {
        resetForm();
        setModalVisible(true);
    };

    const openEditModal = (item: EnglishClozeExerciseResponse) => {
        resetForm();
        setTitle(item.title);
        setContent(item.content);

        const mappedBlanks: EnglishClozeBlankRequest[] = item.blanks.map(b => ({
            blankIndex: b.blankIndex,
            correctAnswer: b.correctAnswer,
            hint: b.hint || ''
        }));

        mappedBlanks.sort((a, b) => a.blankIndex - b.blankIndex);

        setBlanksInput(mappedBlanks);
        setCurrentId(item.id);
        setIsEditing(true);
        setModalVisible(true);
    };

    // --- 3. SAVE DATA TO BACKEND ---
    const handleSave = async () => {
        const titleError = !title.trim() ? 'Tiêu đề không được để trống.' : '';
        const contentError = !content.trim() ? 'Nội dung không được để trống.' : '';

        const blankPlaceholders = (content.match(/_____/g) || []).length;
        let blanksError = '';

        if (blankPlaceholders === 0) {
            blanksError = 'Đoạn văn phải có ít nhất 1 chỗ trống (_____).';
        } else if (blankPlaceholders !== blanksInput.length) {
            blanksError = `Số lượng _____ (${blankPlaceholders}) không khớp với số lượng đáp án (${blanksInput.length}).`;
        } else {
            const hasEmptyAnswer = blanksInput.some(b => !b.correctAnswer.trim());
            if (hasEmptyAnswer) blanksError = 'Vui lòng điền đầy đủ đáp án.';
        }

        setErrors({ title: titleError, content: contentError, blanks: blanksError });

        if (titleError || contentError || blanksError) return;

        setLoading(true);
        try {
            const requestData: EnglishClozeExerciseRequest = {
                title: title.trim(),
                content: content,
                blanks: blanksInput
            };

            if (isEditing && currentId) {
                const res = await exerciseService.updateClozeExerciseQuestion(currentId, requestData);

                if (res.status === 200 || res.data) {
                    const updatedItem = res.data;
                    setExercises(prev => prev.map(e => e.id === currentId ? updatedItem : e));
                    Alert.alert("Thành công", "Đã cập nhật bài tập.");
                    setModalVisible(false);
                }
            } else {
                const res = await exerciseService.createClozeExerciseQuestion(lessonId, requestData);

                if (res.status === 200 || res.data) {
                    const newItem = res.data;
                    setExercises(prev => [...prev, newItem]);
                    Alert.alert("Thành công", "Đã tạo bài tập mới.");
                    setModalVisible(false);
                }
            }
        } catch (error) {
            console.log("Lỗi lưu dữ liệu:", error);
            Alert.alert("Lỗi", "Không thể lưu dữ liệu. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    // --- 4. DELETE DATA FROM BACKEND ---
    const handleDelete = (id: number) => {
        Alert.alert("Xác nhận", "Bạn có chắc muốn xoá bài tập này?", [
            { text: "Huỷ", style: "cancel" },
            {
                text: "Xoá", style: "destructive",
                onPress: async () => {
                    try {
                        setLoading(true);
                        const res = await exerciseService.deleteClozeExerciseQuestion(id);

                        if (res.status === 200 || res.status === 204) {
                            setExercises(prev => prev.filter(e => e.id !== id));
                        } else {
                            Alert.alert("Lỗi", "Xoá không thành công.");
                        }
                    } catch (error) {
                        console.log("Lỗi xoá:", error);
                        Alert.alert("Lỗi", "Không thể xoá bài tập.");
                    } finally {
                        setLoading(false);
                    }
                }
            }
        ]);
    };

    // --- UI COMPONENTS ---

    const renderWarningBanner = () => {
        if (exercises.length >= MIN_QUESTIONS_REQUIRED) return null;
        return (
            <Animatable.View animation="fadeInDown" duration={600} style={styles.warningContainer}>
                <View style={styles.warningIconBox}>
                    <Ionicons name="warning" size={24} color="#F59E0B" />
                </View>
                <View style={styles.warningContent}>
                    <Text style={styles.warningTitle}>Chưa đủ điều kiện!</Text>
                    <Text style={styles.warningText}>
                        Cần tối thiểu {MIN_QUESTIONS_REQUIRED} bài tập điền từ. (Hiện tại: {exercises.length}/{MIN_QUESTIONS_REQUIRED})
                    </Text>
                </View>
            </Animatable.View>
        );
    };

    const renderItem = ({ item, index }: { item: EnglishClozeExerciseResponse, index: number }) => (
        <Animatable.View animation="fadeInUp" duration={500} delay={index * 100} style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.tagContainer}>
                    <Text style={styles.tagText}>Bài {index + 1}</Text>
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

            <Text style={styles.questionTitle}>{item.title}</Text>

            <View style={styles.previewContainer}>
                <Text style={styles.previewText} numberOfLines={3}>
                    {item.content.split('_____').map((part, i, arr) => {
                        const answer = item.blanks.find(b => b.blankIndex === i + 1)?.correctAnswer;
                        return (
                            <Text key={i}>
                                {part}
                                {i < arr.length - 1 && (
                                    <Text style={{ fontWeight: 'bold', color: THEME.primary }}> [ {answer || '...'} ] </Text>
                                )}
                            </Text>
                        );
                    })}
                </Text>
            </View>

            <View style={styles.metaContainer}>
                <View style={styles.metaItem}>
                    <Ionicons name="create-outline" size={14} color={THEME.subText} />
                    <Text style={styles.metaText}>{item.blanks.length} chỗ trống</Text>
                </View>
            </View>
        </Animatable.View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                style={[styles.header, { paddingTop: insets.top }]}
            >
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>Bài Tập</Text>
                        <Text style={styles.headerSubtitle}>
                            Lesson: <Text style={{ fontWeight: 'bold', color: '#fff' }}>{lessonTitle}</Text>
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Body */}
            <View style={styles.body}>
                <View style={styles.listControlHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialCommunityIcons name="clipboard-edit-outline" size={26} color={THEME.primary} />
                        <Text style={styles.listTitle}>Điền từ vào chỗ trống</Text>
                    </View>
                    <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
                        <Ionicons name="add" size={20} color="#FFF" />
                        <Text style={styles.addButtonText}>Thêm bài</Text>
                    </TouchableOpacity>
                </View>

                {loading && exercises.length === 0 ? (
                    <ActivityIndicator size="large" color={THEME.primary} style={{ marginTop: 20 }} />
                ) : (
                    <FlatList
                        ListHeaderComponent={renderWarningBanner}
                        data={exercises}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={{ alignItems: 'center', marginTop: 50 }}>
                                <Text style={{ color: '#9CA3AF' }}>Chưa có bài tập nào.</Text>
                            </View>
                        }
                    />
                )}
            </View>

            {/* Modal Add/Edit */}
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
                            <Text style={styles.modalTitle}>{isEditing ? "Chỉnh Sửa Bài Tập" : "Tạo Bài Tập Mới"}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                            <Text style={styles.label}>Tiêu đề bài đọc <Text style={{ color: 'red' }}>*</Text></Text>
                            <TextInput
                                style={[styles.input, errors.title ? styles.inputError : {}]}
                                placeholder="Ví dụ: My Best Friend"
                                value={title}
                                onChangeText={(t) => { setTitle(t); if (t) setErrors(p => ({ ...p, title: '' })) }}
                                onBlur={() => handleBlur('title')}
                            />
                            {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}

                            <View style={styles.contentLabelRow}>
                                <Text style={styles.label}>Nội dung đoạn văn <Text style={{ color: 'red' }}>*</Text></Text>
                                <TouchableOpacity onPress={handleResetContent}>
                                    <Text style={{ color: THEME.danger, fontSize: 12, fontWeight: 'bold' }}>Làm mới</Text>
                                </TouchableOpacity>
                            </View>

                            <TextInput
                                style={[styles.input, styles.textArea, errors.content ? styles.inputError : {}]}
                                placeholder="Nhập đoạn văn tại đây. Sử dụng nút 'Chèn chỗ trống' bên dưới để tạo ô điền từ."
                                multiline
                                value={content}
                                onChangeText={(t) => { setContent(t); if (t) setErrors(p => ({ ...p, content: '' })) }}
                                onBlur={() => handleBlur('content')}
                            />
                            {errors.content ? <Text style={styles.errorText}>{errors.content}</Text> : null}

                            <View style={styles.toolbar}>
                                <TouchableOpacity style={styles.insertBtn} onPress={handleInsertBlank}>
                                    <MaterialCommunityIcons name="playlist-plus" size={20} color="white" />
                                    <Text style={styles.insertBtnText}>Chèn chỗ trống (_____)</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={[styles.label, { marginTop: 20 }]}>Danh sách đáp án ({blanksInput.length})</Text>
                            {errors.blanks ? <Text style={[styles.errorText, { marginBottom: 10 }]}>{errors.blanks}</Text> : null}

                            {blanksInput.map((blank, index) => (
                                <Animatable.View key={index} animation="fadeIn" duration={300} style={styles.blankRow}>
                                    <View style={styles.blankIndexBadge}>
                                        <Text style={styles.blankIndexText}>{index + 1}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <TextInput
                                            style={styles.blankInput}
                                            placeholder="Đáp án đúng (VD: is)"
                                            value={blank.correctAnswer}
                                            onChangeText={(text) => updateBlankItem(index, 'correctAnswer', text)}
                                        />
                                        <TextInput
                                            style={[styles.blankInput, { marginTop: 8, fontStyle: 'italic' }]}
                                            placeholder="Gợi ý (VD: Động từ tobe)"
                                            value={blank.hint}
                                            onChangeText={(text) => updateBlankItem(index, 'hint', text)}
                                        />
                                    </View>
                                </Animatable.View>
                            ))}

                            {blanksInput.length === 0 && (
                                <View style={styles.emptyBlanks}>
                                    <Text style={styles.emptyBlanksText}>Chưa có chỗ trống nào. Hãy bấm nút "Chèn chỗ trống" ở trên.</Text>
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
        paddingBottom: 25, paddingHorizontal: 20,
        borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
        elevation: 5, shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5
    },
    headerContent: { flexDirection: 'row', alignItems: 'center' },
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
        flexDirection: 'row', backgroundColor: THEME.warningBg,
        borderWidth: 1, borderColor: THEME.warningBorder,
        borderRadius: 16, padding: 16, marginBottom: 16,
    },
    warningIconBox: { marginRight: 12, justifyContent: 'flex-start', marginTop: 2 },
    warningContent: { flex: 1 },
    warningTitle: { color: THEME.warningText, fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
    warningText: { color: '#7F1D1D', fontSize: 14, lineHeight: 20 },

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
    questionTitle: { fontSize: 16, fontWeight: 'bold', color: THEME.text, marginBottom: 8 },
    previewContainer: { backgroundColor: THEME.inputBg, padding: 10, borderRadius: 8, marginBottom: 10 },
    previewText: { color: THEME.subText, fontSize: 14, lineHeight: 20 },
    metaContainer: { flexDirection: 'row', justifyContent: 'flex-end' },
    metaItem: { flexDirection: 'row', alignItems: 'center' },
    metaText: { fontSize: 12, color: THEME.subText, marginLeft: 4 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalContent: {
        backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25,
        padding: 20, height: '90%', elevation: 20
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: THEME.text },
    modalBody: { flex: 1 },

    label: { fontSize: 14, fontWeight: '700', color: THEME.text, marginBottom: 8, marginTop: 12 },
    contentLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 8 },

    input: {
        backgroundColor: THEME.inputBg, borderWidth: 1, borderColor: THEME.inputBorder,
        borderRadius: 12, padding: 14, fontSize: 16, color: THEME.text
    },
    inputError: { borderColor: THEME.danger, backgroundColor: '#FEF2F2' },
    errorText: { color: THEME.danger, fontSize: 12, marginTop: 4, marginLeft: 4 },
    textArea: { height: 120, textAlignVertical: 'top' },

    toolbar: { flexDirection: 'row', marginTop: 10, justifyContent: 'flex-end' },
    insertBtn: {
        flexDirection: 'row', backgroundColor: THEME.primary,
        paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center'
    },
    insertBtnText: { color: 'white', fontWeight: 'bold', fontSize: 13, marginLeft: 6 },

    blankRow: {
        flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15,
        backgroundColor: '#F9FAFB', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6'
    },
    blankIndexBadge: {
        width: 24, height: 24, borderRadius: 12, backgroundColor: THEME.primary,
        justifyContent: 'center', alignItems: 'center', marginRight: 10, marginTop: 12
    },
    blankIndexText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    blankInput: {
        backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB',
        borderRadius: 8, padding: 10, fontSize: 14
    },
    emptyBlanks: { padding: 20, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, marginTop: 10 },
    emptyBlanksText: { color: '#9CA3AF', fontSize: 14, fontStyle: 'italic' },

    saveButton: { backgroundColor: THEME.primary, paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 20, marginBottom: 20 },
    saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default CreateClozeScreen;