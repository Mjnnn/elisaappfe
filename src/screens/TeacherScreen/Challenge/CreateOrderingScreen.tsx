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
    EnglishOrderingExerciseResponse,
    EnglishParagraphSegmentResponse
} from '../../../types/response/ExerciseResponse';
import {
    EnglishOrderingExerciseRequest,
    EnglishParagraphSegmentRequest
} from '../../../types/request/EnglishOrderingExerciseRequest';

// --- THEME COLORS (Cyan Theme) ---
const THEME = {
    primary: '#0891B2',    // Cyan đậm (Cyan-600)
    light: '#CFFAFE',      // Cyan rất nhạt
    dark: '#155E75',       // Cyan tối
    bg: '#FFFFFF',         // Nền trắng
    white: '#FFFFFF',
    text: '#164E63',       // Text màu xanh lơ đậm
    subText: '#64748B',
    danger: '#EF4444',
    success: '#10B981',
    warningBg: '#FEF2F2',
    warningBorder: '#FECACA',
    warningText: '#B91C1C',
    inputBorder: '#E2E8F0',
    inputBg: '#F8FAFC'
};

const MIN_QUESTIONS_REQUIRED = 3;

const CreateOrderingScreen = ({ route, navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { lessonId, lessonTitle } = route.params || { lessonId: 1, lessonTitle: "Ordering Exercise" };

    // --- STATE ---
    const [exercises, setExercises] = useState<EnglishOrderingExerciseResponse[]>([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<number | null>(null);

    // Input Fields
    const [title, setTitle] = useState('');
    const [hint, setHint] = useState('');

    // Danh sách đoạn văn input
    const [paragraphsInput, setParagraphsInput] = useState<string[]>(['', '']);

    // State để quản lý lỗi chi tiết cho từng đoạn văn (Inline Validation)
    const [paragraphErrors, setParagraphErrors] = useState<string[]>(['', '']);

    // Validation State (Global & Title)
    const [errors, setErrors] = useState({
        title: '',
        paragraphs: '' // Lỗi chung cho phần paragraphs
    });

    // --- 1. FETCH DATA ---
    useEffect(() => {
        fetchExercises();
    }, []);

    const fetchExercises = async () => {
        setLoading(true);
        try {
            const res = await exerciseService.getOrderingForChallenge(lessonId);
            if (res && res.data) {
                setExercises(res.data);
            }
        } catch (error) {
            console.log("Lỗi lấy dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- 2. FORM HANDLERS ---
    const resetForm = () => {
        setTitle('');
        setHint('');
        setParagraphsInput(['', '']);
        setParagraphErrors(['', '']); // Reset lỗi đoạn văn
        setErrors({ title: '', paragraphs: '' });
        setIsEditing(false);
        setCurrentId(null);
    };

    const handleAddParagraphInput = () => {
        setParagraphsInput([...paragraphsInput, '']);
        setParagraphErrors([...paragraphErrors, '']); // Thêm slot lỗi tương ứng
    };

    const handleRemoveParagraphInput = (index: number) => {
        const newParagraphs = [...paragraphsInput];
        newParagraphs.splice(index, 1);
        setParagraphsInput(newParagraphs);

        const newErrors = [...paragraphErrors];
        newErrors.splice(index, 1);
        setParagraphErrors(newErrors);
    };

    const handleChangeParagraphText = (text: string, index: number) => {
        const newParagraphs = [...paragraphsInput];
        newParagraphs[index] = text;
        setParagraphsInput(newParagraphs);

        // Xoá lỗi khi người dùng bắt đầu nhập lại
        if (text.trim() !== '') {
            const newErrors = [...paragraphErrors];
            newErrors[index] = '';
            setParagraphErrors(newErrors);
        }
    };

    // Logic check onBlur cho Title
    const handleTitleBlur = () => {
        if (!title.trim()) {
            setErrors(prev => ({ ...prev, title: 'Tiêu đề không được để trống.' }));
        }
    };

    // Logic check onBlur cho từng Paragraph
    const handleParagraphBlur = (index: number) => {
        if (!paragraphsInput[index].trim()) {
            const newErrors = [...paragraphErrors];
            newErrors[index] = 'Nội dung đoạn này không được để trống.';
            setParagraphErrors(newErrors);
        }
    };

    // --- MODAL OPENERS ---
    const openAddModal = () => {
        resetForm();
        setModalVisible(true);
    };

    const openEditModal = (item: EnglishOrderingExerciseResponse) => {
        resetForm();
        setTitle(item.title);
        setHint(item.hint || '');

        const sortedParagraphs = [...item.paragraphs].sort((a, b) => a.correctOrder - b.correctOrder);
        setParagraphsInput(sortedParagraphs.map(p => p.content));
        // Reset mảng lỗi đoạn văn tương ứng với số lượng đoạn văn hiện có
        setParagraphErrors(new Array(sortedParagraphs.length).fill(''));

        setCurrentId(item.id);
        setIsEditing(true);
        setModalVisible(true);
    };

    // --- 3. SAVE LOGIC ---
    const handleSave = async () => {
        let isValid = true;

        // Check Title
        if (!title.trim()) {
            setErrors(prev => ({ ...prev, title: 'Tiêu đề không được để trống.' }));
            isValid = false;
        }

        // Check từng đoạn văn (Empty check)
        const newParagraphErrors = paragraphsInput.map(p => !p.trim() ? 'Nội dung đoạn này không được để trống.' : '');
        setParagraphErrors(newParagraphErrors);

        // Nếu có bất kỳ đoạn nào bị lỗi trống
        if (newParagraphErrors.some(e => e !== '')) {
            isValid = false;
        }

        // Check số lượng đoạn tối thiểu
        const cleanParagraphs = paragraphsInput.filter(p => p.trim() !== '');
        if (cleanParagraphs.length < 2) {
            setErrors(prev => ({ ...prev, paragraphs: 'Cần ít nhất 2 đoạn văn để sắp xếp.' }));
            isValid = false;
        }

        if (!isValid) return;

        setLoading(true);
        try {
            const mappedParagraphs: EnglishParagraphSegmentRequest[] = cleanParagraphs.map((content, index) => ({
                content: content.trim(),
                correctOrder: index + 1
            }));

            const requestData: EnglishOrderingExerciseRequest = {
                title: title.trim(),
                hint: hint.trim(),
                paragraphs: mappedParagraphs
            };

            if (isEditing && currentId) {
                const res = await exerciseService.updateOrderingExerciseQuestion(currentId, requestData);
                if (res.status === 200 || res.data) {
                    const updatedItem = res.data;
                    setExercises(prev => prev.map(e => e.id === currentId ? updatedItem : e));
                    Alert.alert("Thành công", "Đã cập nhật bài tập.");
                    setModalVisible(false);
                }
            } else {
                const res = await exerciseService.createOrderingExerciseQuestion(lessonId, requestData);
                if (res.status === 200 || res.data) {
                    const newItem = res.data;
                    setExercises(prev => [...prev, newItem]);
                    Alert.alert("Thành công", "Đã tạo bài tập mới.");
                    setModalVisible(false);
                }
            }
        } catch (error) {
            console.log("Lỗi lưu:", error);
            Alert.alert("Lỗi", "Không thể lưu dữ liệu.");
        } finally {
            setLoading(false);
        }
    };

    // --- 4. DELETE LOGIC ---
    const handleDelete = (id: number) => {
        Alert.alert("Xác nhận", "Bạn có chắc muốn xoá bài tập này?", [
            { text: "Huỷ", style: "cancel" },
            {
                text: "Xoá", style: "destructive",
                onPress: async () => {
                    try {
                        setLoading(true);
                        const res = await exerciseService.deleteOrderingExerciseQuestion(id);
                        if (res.status === 200 || res.status === 204) {
                            setExercises(prev => prev.filter(e => e.id !== id));
                        }
                    } catch (error) {
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
                        Cần tối thiểu {MIN_QUESTIONS_REQUIRED} bài tập sắp xếp. (Hiện tại: {exercises.length}/{MIN_QUESTIONS_REQUIRED})
                    </Text>
                </View>
            </Animatable.View>
        );
    };

    const renderItem = ({ item, index }: { item: EnglishOrderingExerciseResponse, index: number }) => {
        const sortedParagraphs = [...item.paragraphs].sort((a, b) => a.correctOrder - b.correctOrder);

        return (
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

                {item.hint ? (
                    <View style={styles.hintContainer}>
                        <MaterialCommunityIcons name="lightbulb-on-outline" size={16} color="#F59E0B" style={{ marginRight: 6 }} />
                        <Text style={styles.hintText} numberOfLines={1}>{item.hint}</Text>
                    </View>
                ) : null}

                <View style={styles.previewContainer}>
                    {sortedParagraphs.slice(0, 3).map((p, i) => (
                        <View key={p.id} style={styles.previewRow}>
                            <View style={styles.orderBadgeSmall}>
                                <Text style={styles.orderBadgeTextSmall}>{p.correctOrder}</Text>
                            </View>
                            <Text style={styles.previewText} numberOfLines={1}>{p.content}</Text>
                        </View>
                    ))}
                    {sortedParagraphs.length > 3 && (
                        <Text style={styles.moreText}>... và {sortedParagraphs.length - 3} đoạn nữa</Text>
                    )}
                </View>
            </Animatable.View>
        );
    };

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
                        {/* [MODIFIED] Changed Icon here to 'format-list-numbered' */}
                        <MaterialCommunityIcons name="format-list-numbered" size={26} color={THEME.primary} />
                        <Text style={styles.listTitle}>Sắp xếp đoạn văn</Text>
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

            {/* Modal */}
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
                            {/* Title */}
                            <Text style={styles.label}>Tiêu đề bài viết <Text style={{ color: 'red' }}>*</Text></Text>
                            <TextInput
                                style={[styles.input, errors.title ? styles.inputError : {}]}
                                placeholder="Ví dụ: How to make a cake"
                                value={title}
                                onChangeText={(t) => {
                                    setTitle(t);
                                    if (t) setErrors(p => ({ ...p, title: '' }));
                                }}
                                onBlur={handleTitleBlur} // Trigger validation on blur
                            />
                            {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}

                            {/* Hint */}
                            <Text style={styles.label}>Gợi ý (Hint)</Text>
                            <View style={styles.inputIconWrapper}>
                                <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#F59E0B" style={{ marginRight: 8 }} />
                                <TextInput
                                    style={styles.inputNoBorder}
                                    placeholder="Gợi ý về trình tự thời gian, từ nối..."
                                    value={hint} onChangeText={setHint}
                                />
                            </View>

                            {/* Paragraphs Input */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
                                <Text style={[styles.label, { marginTop: 0 }]}>Các đoạn văn (Theo đúng thứ tự)</Text>
                                <TouchableOpacity onPress={handleAddParagraphInput}>
                                    <Text style={{ color: THEME.primary, fontWeight: 'bold' }}>+ Thêm đoạn</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={{ fontSize: 12, color: THEME.subText, marginBottom: 10 }}>Nhập nội dung các đoạn văn theo trình tự đúng (1, 2, 3...).</Text>

                            {/* Global paragraph errors */}
                            {errors.paragraphs ? <Text style={[styles.errorText, { marginBottom: 10 }]}>{errors.paragraphs}</Text> : null}

                            {paragraphsInput.map((text, index) => (
                                <View key={index}>
                                    <Animatable.View
                                        animation="fadeIn"
                                        duration={300}
                                        style={[
                                            styles.paragraphRow,
                                            // Thêm style lỗi nếu paragraphErrors[index] có giá trị
                                            paragraphErrors[index] ? styles.inputError : {}
                                        ]}
                                    >
                                        <View style={styles.orderBadge}>
                                            <Text style={styles.orderBadgeText}>{index + 1}</Text>
                                        </View>

                                        <TextInput
                                            style={styles.paragraphInput}
                                            placeholder={`Nội dung đoạn thứ ${index + 1}...`}
                                            multiline
                                            value={text}
                                            onChangeText={(val) => handleChangeParagraphText(val, index)}
                                            onBlur={() => handleParagraphBlur(index)} // Trigger validation on blur
                                        />

                                        {paragraphsInput.length > 2 && (
                                            <TouchableOpacity onPress={() => handleRemoveParagraphInput(index)} style={{ padding: 5 }}>
                                                <Ionicons name="trash-outline" size={20} color={THEME.danger} />
                                            </TouchableOpacity>
                                        )}
                                    </Animatable.View>

                                    {/* Hiển thị text lỗi ngay dưới đoạn văn */}
                                    {paragraphErrors[index] ? (
                                        <Text style={[styles.errorText, { marginTop: -8, marginBottom: 8, marginLeft: 10 }]}>
                                            {paragraphErrors[index]}
                                        </Text>
                                    ) : null}
                                </View>
                            ))}

                            <TouchableOpacity style={styles.addMoreBtn} onPress={handleAddParagraphInput}>
                                <Ionicons name="add-circle-outline" size={20} color={THEME.text} />
                                <Text style={styles.addMoreText}>Thêm đoạn văn tiếp theo</Text>
                            </TouchableOpacity>

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
    headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFF' },
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

    // Warning
    warningContainer: {
        flexDirection: 'row', backgroundColor: THEME.warningBg,
        borderWidth: 1, borderColor: THEME.warningBorder,
        borderRadius: 16, padding: 16, marginBottom: 16,
    },
    warningIconBox: { marginRight: 12, justifyContent: 'flex-start', marginTop: 2 },
    warningContent: { flex: 1 },
    warningTitle: { color: THEME.warningText, fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
    warningText: { color: '#7F1D1D', fontSize: 14, lineHeight: 20 },

    // Card
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

    hintContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: '#FFFBEB', padding: 8, borderRadius: 8 },
    hintText: { fontSize: 13, color: '#B45309', fontStyle: 'italic', flex: 1 },

    previewContainer: { backgroundColor: THEME.inputBg, padding: 12, borderRadius: 12 },
    previewRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    orderBadgeSmall: { width: 20, height: 20, borderRadius: 10, backgroundColor: THEME.primary, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
    orderBadgeTextSmall: { color: 'white', fontSize: 10, fontWeight: 'bold' },
    previewText: { fontSize: 13, color: THEME.text, flex: 1 },
    moreText: { fontSize: 12, color: THEME.subText, fontStyle: 'italic', marginTop: 4 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalContent: {
        backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25,
        padding: 20, height: '90%', elevation: 20
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: THEME.text },
    modalBody: { flex: 1 },

    label: { fontSize: 14, fontWeight: '700', color: THEME.text, marginBottom: 8, marginTop: 12 },

    input: {
        backgroundColor: THEME.inputBg, borderWidth: 1, borderColor: THEME.inputBorder,
        borderRadius: 12, padding: 14, fontSize: 16, color: THEME.text
    },
    inputError: { borderColor: THEME.danger, backgroundColor: '#FEF2F2' },
    errorText: { color: THEME.danger, fontSize: 12, marginTop: 4, marginLeft: 4 },
    inputIconWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FCD34D', borderRadius: 12, paddingHorizontal: 12 },
    inputNoBorder: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#B45309' },

    // Paragraph Input Row
    paragraphRow: {
        flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12,
        backgroundColor: THEME.inputBg, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: THEME.inputBorder
    },
    orderBadge: {
        width: 28, height: 28, borderRadius: 14, backgroundColor: THEME.primary,
        justifyContent: 'center', alignItems: 'center', marginRight: 10, marginTop: 10
    },
    orderBadgeText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    paragraphInput: {
        flex: 1, backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB',
        borderRadius: 8, padding: 10, fontSize: 14, minHeight: 60, textAlignVertical: 'top', marginRight: 8
    },

    addMoreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, borderStyle: 'dashed', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, marginTop: 5 },
    addMoreText: { color: THEME.text, marginLeft: 8, fontWeight: '600', fontSize: 13 },

    saveButton: { backgroundColor: THEME.primary, paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 20, marginBottom: 20 },
    saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default CreateOrderingScreen;