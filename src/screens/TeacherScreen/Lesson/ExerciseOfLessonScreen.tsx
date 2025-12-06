import React, { useState, useEffect } from 'react';
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
    ActivityIndicator
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { AppTabsParamLessonList } from '../../../navigation/AppTabLesson';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';

// --- Import Service và Interface ---
import { MultipleChoiceQuestion, SentenceRewritingQuestion } from '../../../types/response/ExerciseResponse';
import exerciseService from '../../../services/exerciseService';
import { EnglishMultipleChoiceRequest } from '../../../types/request/EnglishMultipleChoiceRequest';
import { EnglishSentenceRewritingRequest } from '../../../types/request/EnglishSentenceRewritingRequest';
import { AuthStackParamList } from '../../../navigation/AuthStack';

// Kích hoạt LayoutAnimation
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Theme Colors ---
const COLORS = {
    bg: '#F3F4F6',
    mcPrimary: '#6C63FF',
    mcLight: '#ECEBFF',
    arrPrimary: '#FF9F43',
    arrLight: '#FFF2E2',
    textMain: '#2D3436',
    textSub: '#636E72',
    white: '#FFFFFF',
    danger: '#FF6B6B',
    success: '#1DD1A1',
    errorBg: '#FFF0F0'
};

// --- Helper: Hàm chuẩn hoá chuỗi để so sánh ---
const normalizeString = (str: string) => {
    if (!str) return '';
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .split('')
        .sort()
        .join('');
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
            multiline={true} // Cho phép nhập nhiều dòng nếu nội dung dài
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
);

type ExerciseRouteProp = RouteProp<AppTabsParamLessonList, 'Exercise'>;
// type Props = NativeStackScreenProps<AuthStackParamList, 'ExerciseOfLessonScreen'>;
type ExerciseScreenRouteProp = RouteProp<
    { ExerciseParams: { lessonId: number; lessonTitle: string } },
    'ExerciseParams'
>;


const ExerciseOfLessonScreen = () => {
    const route = useRoute<ExerciseScreenRouteProp>();
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { lessonId, lessonTitle } = route.params;

    // --- State Data ---
    const [mcList, setMcList] = useState<MultipleChoiceQuestion[]>([]);
    const [arrList, setArrList] = useState<SentenceRewritingQuestion[]>([]);
    const [loading, setLoading] = useState(false);

    // --- State UI Modal ---
    const [modalVisible, setModalVisible] = useState(false);
    const [formType, setFormType] = useState<'CHOICE' | 'ARRANGE'>('CHOICE');
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    // --- State Form ---
    const [mcForm, setMcForm] = useState({ question: '', a: '', b: '', c: '', d: '', correct: '' });
    const [arrForm, setArrForm] = useState({ original: '', rewritten: '', hint: '' });

    // --- State Validation Errors ---
    const [errors, setErrors] = useState<Record<string, string>>({});

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
                    setArrList(data.listSentenceRewriting || []);
                }
            } catch (error) {
                console.error("Lỗi lấy bài tập:", error);
                Alert.alert("Lỗi", "Không thể tải danh sách bài tập.");
            } finally {
                setLoading(false);
            }
        };
        fetchExercises();
    }, [lessonId]);

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

        if (formType === 'CHOICE') {
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
        }

        if (formType === 'ARRANGE') {
            const valOriginal = field === 'original' ? trimmedValue : arrForm.original;
            const valRewritten = field === 'rewritten' ? trimmedValue : arrForm.rewritten;

            if (valOriginal && valRewritten) {
                if (normalizeString(valOriginal) !== normalizeString(valRewritten)) {
                    currentErrors['rewritten'] = 'Nội dung không khớp (thừa/thiếu ký tự so với từ xáo trộn).';
                } else {
                    delete currentErrors['rewritten'];
                }
            }
        }

        setErrors(currentErrors);
    };

    // --- 3. Handlers Modal ---
    const handleOpenAdd = (type: 'CHOICE' | 'ARRANGE') => {
        setFormType(type);
        setIsEditing(false);
        setErrors({});
        if (type === 'CHOICE') setMcForm({ question: '', a: '', b: '', c: '', d: '', correct: '' });
        else setArrForm({ original: '', rewritten: '', hint: '' });
        setModalVisible(true);
    };

    const handleOpenEdit = (type: 'CHOICE' | 'ARRANGE', item: any) => {
        setFormType(type);
        setIsEditing(true);
        setSelectedId(item.questionId);
        setErrors({});

        if (type === 'CHOICE') {
            setMcForm({
                question: item.questionText,
                a: item.optionA, b: item.optionB, c: item.optionC, d: item.optionD,
                correct: item.correctAnswer
            });
        } else {
            setArrForm({
                original: item.originalSentence,
                rewritten: item.rewrittenSentence,
                hint: item.hint || ''
            });
        }
        setModalVisible(true);
    };

    // --- 4. Xử lý Lưu (Save) ---
    const handleSave = async () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);

        if (Object.keys(errors).length > 0) {
            Alert.alert("Lỗi nhập liệu", "Vui lòng sửa các ô báo đỏ trước khi lưu.");
            return;
        }

        if (formType === 'CHOICE') {
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
        } else {
            if (!arrForm.original || !arrForm.rewritten) {
                Alert.alert("Thiếu thông tin", "Vui lòng nhập từ xáo trộn và câu đúng.");
                return;
            }

            if (normalizeString(arrForm.original) !== normalizeString(arrForm.rewritten)) {
                Alert.alert("Lỗi Logic", "Nội dung câu hoàn chỉnh không khớp với các ký tự trong từ xáo trộn.");
                setErrors({ ...errors, rewritten: 'Nội dung không khớp.' });
                return;
            }
        }

        try {
            if (formType === 'CHOICE') {
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
            } else {
                const requestBody: EnglishSentenceRewritingRequest = {
                    originalSentence: arrForm.original,
                    rewrittenSentence: arrForm.rewritten,
                    hint: arrForm.hint, linkMedia: ''
                };

                if (isEditing && selectedId) {
                    const res = await exerciseService.updateSentenceRewritingQuestion(selectedId, requestBody);
                    const updatedItem = { ...res.data, hint: res.data.hint || "", linkMedia: res.data.linkMedia || "" };
                    setArrList(arrList.map(i => i.questionId === selectedId ? updatedItem : i));
                } else {
                    const res = await exerciseService.createSentenceRewritingQuestion(lessonId, requestBody);
                    const newItem = { ...res.data, hint: res.data.hint || "", linkMedia: res.data.linkMedia || "" };
                    setArrList([newItem, ...arrList]);
                }
            }
            setModalVisible(false);
            Alert.alert("Thành công", isEditing ? "Cập nhật bài tập thành công!" : "Thêm mới bài tập thành công!");

        } catch (error) {
            console.error("Lỗi khi lưu:", error);
            Alert.alert("Thất bại", "Đã có lỗi xảy ra khi lưu dữ liệu.");
        }
    };

    // --- 5. Xử lý Xoá ---
    const handleDelete = (type: 'CHOICE' | 'ARRANGE', id: number) => {
        Alert.alert("Xác nhận xoá", "Bạn có chắc chắn không?", [
            { text: "Huỷ", style: "cancel" },
            {
                text: "Xoá", style: 'destructive', onPress: async () => {
                    try {
                        if (type === 'CHOICE') {
                            await exerciseService.deleteMultipleQuestion(id);
                            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                            setMcList(mcList.filter(i => i.questionId !== id));
                        } else {
                            await exerciseService.deleteSentenceRewritingQuestion(id);
                            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                            setArrList(arrList.filter(i => i.questionId !== id));
                        }
                        Alert.alert("Thành công", "Đã xoá bài tập.");
                    } catch (error) {
                        console.error("Lỗi khi xoá:", error);
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
                {/* FIX: Thêm flex: 1 và paddingRight để text không đẩy icon */}
                <View style={[styles.badgeContainer, { flex: 1, paddingRight: 10 }]}>
                    <View style={styles.badgeMc}><Text style={styles.badgeText}>Câu {index + 1}</Text></View>
                </View>
                <View style={styles.actionRow}>
                    <TouchableOpacity onPress={() => handleOpenEdit('CHOICE', item)}><Text style={styles.editIcon}>✏️</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete('CHOICE', item.questionId)}><Text style={styles.delIcon}>✕</Text></TouchableOpacity>
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

    const renderArrItem = (item: SentenceRewritingQuestion, index: number) => {
        const chips = item.originalSentence ? item.originalSentence.split(',').map(s => s.trim()) : [];
        return (
            <View key={item.questionId} style={styles.arrCard}>
                <View style={styles.cardHeader}>
                    {/* FIX: Thêm flex: 1 và paddingRight để text Hint dài sẽ tự xuống dòng */}
                    <View style={[styles.badgeContainer, { flex: 1, paddingRight: 10 }]}>
                        <View style={styles.badgeArr}><Text style={styles.badgeTextArr}>Bài {index + 1}</Text></View>
                        {item.hint ? <Text style={styles.hintText}>💡 {item.hint}</Text> : null}
                    </View>

                    {/* FIX: flexShrink: 0 để đảm bảo cụm nút không bị co lại */}
                    <View style={styles.actionRow}>
                        <TouchableOpacity onPress={() => handleOpenEdit('ARRANGE', item)}><Text style={styles.editIcon}>✏️</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete('ARRANGE', item.questionId)}><Text style={styles.delIcon}>✕</Text></TouchableOpacity>
                    </View>
                </View>
                <View style={styles.chipsContainer}>
                    {chips.map((chip, idx) => (
                        <View key={idx} style={styles.chip}><Text style={styles.chipText}>{chip}</Text></View>
                    ))}
                </View>
                <View style={{ alignItems: 'center', marginVertical: 4 }}><Text style={{ color: COLORS.arrPrimary, fontSize: 18 }}>↓</Text></View>
                <View style={styles.correctSentenceBox}><Text style={styles.correctSentenceText}>✅ {item.rewrittenSentence}</Text></View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.screenHeader}>
                <Text style={styles.headerTitle}>Bài Tập</Text>
                <Text style={styles.headerSub}>Lesson: <Text style={{ fontWeight: 'bold', color: '#fff' }}>{lessonTitle}</Text></Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Trắc nghiệm */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: COLORS.mcPrimary }]}>🧩 Trắc Nghiệm Từ Vựng</Text>
                    <TouchableOpacity style={[styles.addBtnSmall, { backgroundColor: COLORS.mcPrimary }]} onPress={() => handleOpenAdd('CHOICE')}>
                        <Text style={styles.addBtnText}>+ Thêm câu</Text>
                    </TouchableOpacity>
                </View>
                {loading ? <ActivityIndicator color={COLORS.mcPrimary} /> : (
                    <View>
                        {mcList.length === 0 && <Text style={styles.emptyText}>Chưa có bài tập trắc nghiệm.</Text>}
                        {mcList.map((item, index) => renderMcItem(item, index))}
                    </View>
                )}
                <View style={styles.divider} />

                {/* Ghép câu */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: COLORS.arrPrimary }]}>🔠 Sắp Xếp Câu</Text>
                    <TouchableOpacity style={[styles.addBtnSmall, { backgroundColor: COLORS.arrPrimary }]} onPress={() => handleOpenAdd('ARRANGE')}>
                        <Text style={styles.addBtnText}>+ Thêm câu</Text>
                    </TouchableOpacity>
                </View>
                {loading ? <ActivityIndicator color={COLORS.arrPrimary} /> : (
                    <View>
                        {arrList.length === 0 && <Text style={styles.emptyText}>Chưa có bài tập ghép câu.</Text>}
                        {arrList.map((item, index) => renderArrItem(item, index))}
                    </View>
                )}
                <View style={{ height: 50 }} />
            </ScrollView>

            {/* MODAL FORM */}
            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={[styles.modalHeader, { backgroundColor: formType === 'CHOICE' ? COLORS.mcPrimary : COLORS.arrPrimary }]}>
                            <Text style={styles.modalTitle}>{isEditing ? "Chỉnh sửa" : "Thêm mới"} {formType === 'CHOICE' ? 'Trắc nghiệm' : 'Ghép câu'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={styles.closeBtn}>✕</Text></TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={{ padding: 20 }}>
                            {formType === 'CHOICE' ? (
                                <>
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
                                </>
                            ) : (
                                <>
                                    <InputItem
                                        label="Từ xáo trộn (ngăn cách bằng dấu phẩy):"
                                        value={arrForm.original}
                                        customStyleInput={{ backgroundColor: COLORS.arrLight }}
                                        onChangeText={(t: string) => setArrForm({ ...arrForm, original: t })}
                                        onBlur={() => handleBlur('original', arrForm.original)}
                                        placeholder="VD: name, is, My, Tom"
                                        error={errors.original}
                                    />
                                    <InputItem
                                        label="Câu đúng hoàn chỉnh:"
                                        value={arrForm.rewritten}
                                        customStyleInput={{ backgroundColor: '#E8F5E9' }}
                                        onChangeText={(t: string) => setArrForm({ ...arrForm, rewritten: t })}
                                        onBlur={() => handleBlur('rewritten', arrForm.rewritten)}
                                        placeholder="VD: My name is Tom"
                                        error={errors.rewritten}
                                    />
                                    <InputItem
                                        label="Gợi ý (Hint):"
                                        value={arrForm.hint}
                                        onChangeText={(t: string) => setArrForm({ ...arrForm, hint: t })}
                                        placeholder="VD: Giới thiệu tên..."
                                    />
                                </>
                            )}
                            <TouchableOpacity
                                style={[styles.saveBtn, { backgroundColor: formType === 'CHOICE' ? COLORS.mcPrimary : COLORS.arrPrimary }]}
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
    divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 24 },
    emptyText: { textAlign: 'center', color: COLORS.textSub, fontStyle: 'italic', marginBottom: 10 },
    mcCard: {
        backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 16,
        elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1,
        borderLeftWidth: 4, borderLeftColor: COLORS.mcPrimary
    },
    arrCard: {
        backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 16,
        elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1,
        borderLeftWidth: 4, borderLeftColor: COLORS.arrPrimary
    },

    // --- KHU VỰC STYLE ĐÃ SỬA ---
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        alignItems: 'flex-start' // FIX: Căn hàng top để nút không chạy lung tung khi hint dài
    },
    badgeContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start'
        // Style flex: 1 đã được add inline trong Component để linh hoạt
    },
    actionRow: {
        flexDirection: 'row',
        flexShrink: 0 // FIX: Không cho co lại
    },
    // ----------------------------

    badgeMc: { backgroundColor: COLORS.mcLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    badgeArr: { backgroundColor: COLORS.arrLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    badgeText: { color: COLORS.mcPrimary, fontWeight: 'bold', fontSize: 11 },
    badgeTextArr: { color: COLORS.arrPrimary, fontWeight: 'bold', fontSize: 11 },

    editIcon: { fontSize: 16, marginRight: 12 },
    delIcon: { fontSize: 16, color: COLORS.danger },
    questionText: { fontSize: 16, fontWeight: '700', color: COLORS.textMain, marginBottom: 12 },
    optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    optionBox: { width: '48%', backgroundColor: COLORS.bg, padding: 10, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E0E0E0' },
    optionCorrect: { backgroundColor: COLORS.success, borderColor: COLORS.success },
    optionText: { fontSize: 13, color: COLORS.textSub },
    hintText: { fontSize: 12, color: COLORS.textSub, fontStyle: 'italic', marginTop: 4 },
    chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, justifyContent: 'center' },
    chip: { backgroundColor: COLORS.arrPrimary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, margin: 4 },
    chipText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    correctSentenceBox: { marginTop: 4, padding: 10, backgroundColor: '#E8F5E9', borderRadius: 8, borderWidth: 1, borderColor: '#C8E6C9', alignItems: 'center' },
    correctSentenceText: { color: '#2E7D32', fontWeight: '600', fontSize: 15 },
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

export default ExerciseOfLessonScreen;