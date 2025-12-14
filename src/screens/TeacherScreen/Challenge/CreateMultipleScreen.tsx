import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
    Platform,
    LayoutAnimation,
    UIManager,
    KeyboardAvoidingView,
    ActivityIndicator,
    Animated, // Import Animated
    Easing    // Import Easing
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// --- Import Service và Interface ---
import { MultipleChoiceQuestion } from '../../../types/response/ExerciseResponse';
import exerciseService from '../../../services/exerciseService';
import { EnglishMultipleChoiceRequest } from '../../../types/request/EnglishMultipleChoiceRequest';

// Kích hoạt LayoutAnimation
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Theme Colors ---
const COLORS = {
    bg: '#F3F4F6',
    mcPrimary: '#6C63FF',
    mcLight: '#ECEBFF',
    textMain: '#2D3436',
    textSub: '#636E72',
    white: '#FFFFFF',
    danger: '#FF6B6B',
    success: '#1DD1A1',
    errorBg: '#FFF0F0'
};

// --- COMPONENT INPUT ITEM ---
const InputItem = ({
    label,
    value,
    onChangeText,
    onBlur,
    placeholder,
    error,
    half = false,
    style = {},
    customStyleInput = {}
}: any) => (
    <View style={[
        half ? { flex: 1, marginBottom: 12 } : { marginBottom: 15 },
        style
    ]}>
        {label && <Text style={styles.label}>{label}</Text>}
        <TextInput
            style={[
                half ? styles.inputHalfRaw : styles.inputRaw,
                customStyleInput,
                error && styles.inputError
            ]}
            value={value}
            onChangeText={onChangeText}
            onBlur={onBlur}
            placeholder={placeholder}
            placeholderTextColor="#999"
            multiline={true}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
);

type MultipleScreenRouteProp = RouteProp<
    { MultipleParams: { lessonId: number; lessonTitle: string } },
    'MultipleParams'
>;

const CreateMultipleScreen = () => {
    const route = useRoute<MultipleScreenRouteProp>();
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { lessonId, lessonTitle } = route.params;

    // --- State Data ---
    const [mcList, setMcList] = useState<MultipleChoiceQuestion[]>([]);
    const [loading, setLoading] = useState(false);

    // --- State UI Modal ---
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    // --- State Form ---
    const [mcForm, setMcForm] = useState({ question: '', a: '', b: '', c: '', d: '', correct: '' });

    // --- State Validation Errors ---
    const [errors, setErrors] = useState<Record<string, string>>({});

    // --- Animation Value cho Warning ---
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // --- 1. Load Data ---
    useEffect(() => {
        const fetchExercises = async () => {
            setLoading(true);
            try {
                const response = await exerciseService.getExercisesByLesson(lessonId);
                const data = response.data;
                if (data) {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setMcList(data.listMultipleChoice || []);
                }
            } catch (error) {
                console.log("Lỗi lấy bài tập:", error);
                Alert.alert("Lỗi", "Không thể tải danh sách bài tập.");
            } finally {
                setLoading(false);
            }
        };
        fetchExercises();
    }, [lessonId]);

    // --- Effect Animation Warning ---
    useEffect(() => {
        // Tạo hiệu ứng nhịp thở (pulse) cho cảnh báo
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 0.6,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        );

        if (mcList.length < 8) {
            animation.start();
        } else {
            animation.stop();
            pulseAnim.setValue(1); // Reset về trạng thái bình thường
        }

        return () => animation.stop();
    }, [mcList.length]);

    // --- 2. Logic Validation ---
    const handleBlur = (field: string, value: string) => {
        let currentErrors = { ...errors };
        const trimmedValue = value.trim();

        if (!trimmedValue) {
            currentErrors[field] = 'Không được để trống trường này.';
            setErrors(currentErrors);
            return;
        } else {
            delete currentErrors[field];
        }

        const options = ['a', 'b', 'c', 'd'];
        if (options.includes(field)) {
            const otherValues = options
                .filter(key => key !== field)
                // @ts-ignore
                .map(key => mcForm[key].trim().toLowerCase());

            if (otherValues.includes(trimmedValue.toLowerCase())) {
                currentErrors[field] = 'Đáp án này bị trùng với lựa chọn khác!';
            }
        }
        if (field === 'correct') {
            const allOptions = [mcForm.a, mcForm.b, mcForm.c, mcForm.d].map(opt => opt.trim());
            if (!allOptions.includes(trimmedValue)) {
                currentErrors[field] = 'Đáp án đúng phải trùng khớp 100% với 1 trong 4 lựa chọn trên.';
            }
        }

        setErrors(currentErrors);
    };

    // --- 3. Handlers Modal ---
    const handleOpenAdd = () => {
        setIsEditing(false);
        setErrors({});
        setMcForm({ question: '', a: '', b: '', c: '', d: '', correct: '' });
        setModalVisible(true);
    };

    const handleOpenEdit = (item: MultipleChoiceQuestion) => {
        setIsEditing(true);
        setSelectedId(item.questionId);
        setErrors({});

        setMcForm({
            question: item.questionText,
            a: item.optionA, b: item.optionB, c: item.optionC, d: item.optionD,
            correct: item.correctAnswer
        });
        setModalVisible(true);
    };

    // --- 4. Xử lý Lưu (Save) ---
    const handleSave = async () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);

        if (Object.keys(errors).length > 0) {
            Alert.alert("Lỗi nhập liệu", "Vui lòng sửa các ô báo đỏ trước khi lưu.");
            return;
        }

        // Validation cuối cùng
        if (!mcForm.question || !mcForm.a || !mcForm.b || !mcForm.c || !mcForm.d || !mcForm.correct) {
            Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ tất cả các trường.");
            return;
        }
        const opts = [mcForm.a, mcForm.b, mcForm.c, mcForm.d].map(o => o.trim().toLowerCase());
        if (new Set(opts).size !== opts.length) {
            Alert.alert("Lỗi dữ liệu", "Các đáp án A, B, C, D không được trùng nhau.");
            return;
        }
        if (![mcForm.a, mcForm.b, mcForm.c, mcForm.d].map(o => o.trim()).includes(mcForm.correct.trim())) {
            Alert.alert("Lỗi dữ liệu", "Đáp án đúng không khớp với bất kỳ lựa chọn nào.");
            return;
        }

        try {
            const requestBody: EnglishMultipleChoiceRequest = {
                questionText: mcForm.question,
                optionA: mcForm.a, optionB: mcForm.b, optionC: mcForm.c, optionD: mcForm.d,
                correctAnswer: mcForm.correct, linkMedia: ''
            };

            if (isEditing && selectedId) {
                const res = await exerciseService.updateMultipleQuestion(selectedId, requestBody);
                const updatedItem = { ...res.data, linkMedia: res.data.linkMedia || "" };
                setMcList(mcList.map(i => i.questionId === selectedId ? updatedItem : i));
            } else {
                const res = await exerciseService.createMultipleQuestion(lessonId, requestBody);
                const newItem = { ...res.data, linkMedia: res.data.linkMedia || "" };
                setMcList([newItem, ...mcList]);
            }

            setModalVisible(false);
            Alert.alert("Thành công", isEditing ? "Cập nhật bài tập thành công!" : "Thêm mới bài tập thành công!");

        } catch (error) {
            console.log("Lỗi khi lưu:", error);
            Alert.alert("Thất bại", "Đã có lỗi xảy ra khi lưu dữ liệu.");
        }
    };

    // --- 5. Xử lý Xoá ---
    const handleDelete = (id: number) => {
        Alert.alert("Xác nhận xoá", "Bạn có chắc chắn muốn xoá câu này không?", [
            { text: "Huỷ", style: "cancel" },
            {
                text: "Xoá", style: 'destructive', onPress: async () => {
                    try {
                        await exerciseService.deleteMultipleQuestion(id);
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                        setMcList(mcList.filter(i => i.questionId !== id));
                        // Alert để trong callback để tránh block UI
                        setTimeout(() => Alert.alert("Thành công", "Đã xoá bài tập."), 100);
                    } catch (error) {
                        console.log("Lỗi khi xoá:", error);
                        Alert.alert("Lỗi", "Không thể xoá bài tập này.");
                    }
                }
            }
        ]);
    };

    // --- 6. Render Items ---
    const renderMcItem = (item: MultipleChoiceQuestion, index: number) => (
        <View key={item.questionId} style={styles.mcCard}>
            <View style={styles.cardHeader}>
                <View style={[styles.badgeContainer, { flex: 1, paddingRight: 10 }]}>
                    <View style={styles.badgeMc}><Text style={styles.badgeText}>Câu {index + 1}</Text></View>
                </View>
                <View style={styles.actionRow}>
                    <TouchableOpacity onPress={() => handleOpenEdit(item)}><Text style={styles.editIcon}>✏️</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.questionId)}><Text style={styles.delIcon}>✕</Text></TouchableOpacity>
                </View>
            </View>
            <Text style={styles.questionText}>{item.questionText}</Text>
            <View style={styles.optionsGrid}>
                {['A', 'B', 'C', 'D'].map((opt, idx) => {
                    const val = idx === 0 ? item.optionA : idx === 1 ? item.optionB : idx === 2 ? item.optionC : item.optionD;
                    const isCorrect = val === item.correctAnswer;
                    return (
                        <View key={opt} style={[styles.optionBox, isCorrect && styles.optionCorrect]}>
                            <Text style={[styles.optionText, isCorrect && { color: '#fff', fontWeight: 'bold' }]}>{opt}. {val}</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.screenHeader}>
                <Text style={styles.headerTitle}>Bài Tập</Text>
                <Text style={styles.headerSub}>Lesson: <Text style={{ fontWeight: 'bold', color: '#fff' }}>{lessonTitle}</Text></Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: COLORS.success }]}>🧩 Trắc Nghiệm Từ Vựng</Text>
                    <TouchableOpacity style={[styles.addBtnSmall, { backgroundColor: COLORS.success }]} onPress={handleOpenAdd}>
                        <Text style={styles.addBtnText}>+ Thêm câu</Text>
                    </TouchableOpacity>
                </View>

                {/* --- WARNING BANNER (NEW) --- */}
                {mcList.length < 8 && (
                    <Animated.View style={[styles.warningContainer, { opacity: pulseAnim }]}>
                        <View style={styles.warningIconContainer}>
                            <Text style={styles.warningIcon}>⚠️</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.warningTitle}>Chưa đủ điều kiện!</Text>
                            <Text style={styles.warningDesc}>
                                Cần tối thiểu <Text style={{ fontWeight: 'bold' }}>8 câu</Text> để học viên có thể bắt đầu thử thách.
                                (Hiện tại: {mcList.length}/8)
                            </Text>
                        </View>
                    </Animated.View>
                )}
                {/* --------------------------- */}

                {loading ? <ActivityIndicator color={COLORS.mcPrimary} style={{ marginTop: 20 }} /> : (
                    <View>
                        {mcList.length === 0 && <Text style={styles.emptyText}>Chưa có bài tập trắc nghiệm.</Text>}
                        {mcList.map((item, index) => renderMcItem(item, index))}
                    </View>
                )}

                <View style={{ height: 50 }} />
            </ScrollView>

            {/* MODAL FORM */}
            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={[styles.modalHeader, { backgroundColor: COLORS.mcPrimary }]}>
                            <Text style={styles.modalTitle}>{isEditing ? "Chỉnh sửa" : "Thêm mới"} Trắc nghiệm</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={styles.closeBtn}>✕</Text></TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={{ padding: 20 }}>
                            <InputItem
                                label="Câu hỏi:" value={mcForm.question}
                                onChangeText={(t: string) => setMcForm({ ...mcForm, question: t })}
                                onBlur={() => handleBlur('question', mcForm.question)}
                                placeholder="VD: Từ 'Hello' nghĩa là gì?"
                                error={errors.question}
                            />
                            <Text style={styles.label}>Các đáp án:</Text>
                            <View style={styles.rowInputs}>
                                <InputItem
                                    half value={mcForm.a} style={{ marginRight: 10 }}
                                    onChangeText={(t: string) => setMcForm({ ...mcForm, a: t })}
                                    onBlur={() => handleBlur('a', mcForm.a)}
                                    placeholder="A. Xin chào" error={errors.a}
                                />
                                <InputItem
                                    half value={mcForm.b}
                                    onChangeText={(t: string) => setMcForm({ ...mcForm, b: t })}
                                    onBlur={() => handleBlur('b', mcForm.b)}
                                    placeholder="B. Tạm biệt" error={errors.b}
                                />
                            </View>
                            <View style={styles.rowInputs}>
                                <InputItem
                                    half value={mcForm.c} style={{ marginRight: 10 }}
                                    onChangeText={(t: string) => setMcForm({ ...mcForm, c: t })}
                                    onBlur={() => handleBlur('c', mcForm.c)}
                                    placeholder="C. Cảm ơn" error={errors.c}
                                />
                                <InputItem
                                    half value={mcForm.d}
                                    onChangeText={(t: string) => setMcForm({ ...mcForm, d: t })}
                                    onBlur={() => handleBlur('d', mcForm.d)}
                                    placeholder="D. Xin lỗi" error={errors.d}
                                />
                            </View>
                            <InputItem
                                label="Đáp án đúng (Nhập y hệt đáp án):"
                                value={mcForm.correct}
                                customStyleInput={{ borderColor: COLORS.success }}
                                onChangeText={(t: string) => setMcForm({ ...mcForm, correct: t })}
                                onBlur={() => handleBlur('correct', mcForm.correct)}
                                placeholder="VD: Xin chào" error={errors.correct}
                            />

                            <TouchableOpacity
                                style={[styles.saveBtn, { backgroundColor: COLORS.mcPrimary }]}
                                onPress={handleSave}
                            >
                                <Text style={styles.saveBtnText}>Lưu Bài Tập</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    screenHeader: {
        paddingTop: Platform.OS === 'android' ? 40 : 60, paddingHorizontal: 20, paddingBottom: 20,
        backgroundColor: '#3B82F6', borderBottomRightRadius: 24, borderBottomLeftRadius: 24, elevation: 5
    },
    headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
    headerSub: { fontSize: 14, color: '#B2BEC3', marginTop: 4 },
    scrollContent: { padding: 16 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 8 },
    sectionTitle: { fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
    addBtnSmall: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, elevation: 2 },
    addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
    emptyText: { textAlign: 'center', color: COLORS.textSub, fontStyle: 'italic', marginBottom: 10, marginTop: 20 },
    mcCard: {
        backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 16,
        elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1,
        borderLeftWidth: 4, borderLeftColor: '#1DD1A1'
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        alignItems: 'flex-start'
    },
    badgeContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start'
    },
    actionRow: {
        flexDirection: 'row',
        flexShrink: 0
    },
    badgeMc: { backgroundColor: COLORS.mcLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    badgeText: { color: COLORS.mcPrimary, fontWeight: 'bold', fontSize: 11 },
    editIcon: { fontSize: 16, marginRight: 12 },
    delIcon: { fontSize: 16, color: COLORS.danger },
    questionText: { fontSize: 16, fontWeight: '700', color: COLORS.textMain, marginBottom: 12 },
    optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    optionBox: { width: '48%', backgroundColor: COLORS.bg, padding: 10, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E0E0E0' },
    optionCorrect: { backgroundColor: COLORS.success, borderColor: COLORS.success },
    optionText: { fontSize: 13, color: COLORS.textSub },

    // --- Warning Banner Styles ---
    warningContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.errorBg,
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#FFCACA',
        alignItems: 'center'
    },
    warningIconContainer: {
        marginRight: 10,
        justifyContent: 'center'
    },
    warningIcon: {
        fontSize: 20
    },
    warningTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.danger,
        marginBottom: 2
    },
    warningDesc: {
        fontSize: 12,
        color: COLORS.textMain
    },
    // ----------------------------

    // --- Styles Modal ---
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    closeBtn: { fontSize: 20, color: '#fff', fontWeight: 'bold' },
    label: { fontSize: 13, fontWeight: '700', color: COLORS.textSub, marginBottom: 6 },
    inputRaw: {
        backgroundColor: COLORS.bg, borderRadius: 12, padding: 12, fontSize: 15, color: COLORS.textMain,
        borderWidth: 1, borderColor: '#ddd'
    },
    inputHalfRaw: {
        backgroundColor: COLORS.bg, borderRadius: 12, padding: 12, fontSize: 14, color: COLORS.textMain,
        borderWidth: 1, borderColor: '#ddd'
    },
    inputError: {
        borderColor: COLORS.danger,
        backgroundColor: COLORS.errorBg,
        borderWidth: 1.5
    },
    errorText: {
        color: COLORS.danger,
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
        fontStyle: 'italic'
    },
    rowInputs: { flexDirection: 'row', justifyContent: 'space-between' },
    saveBtn: { marginTop: 20, padding: 15, borderRadius: 12, alignItems: 'center', elevation: 3 },
    saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default CreateMultipleScreen;