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
import { SentenceRewritingQuestion } from '../../../types/response/ExerciseResponse';
import exerciseService from '../../../services/exerciseService';
import { EnglishSentenceRewritingRequest } from '../../../types/request/EnglishSentenceRewritingRequest';

// Kích hoạt LayoutAnimation
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Theme Colors ---
const COLORS = {
    bg: '#F3F4F6',
    arrPrimary: '#FF9F43', // Màu chủ đạo của Sentence Rewriting
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
            multiline={true}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
);

type SentenceRewritingScreenRouteProp = RouteProp<
    { SentenceRewritingParams: { lessonId: number; lessonTitle: string } },
    'SentenceRewritingParams'
>;

const CreateSentenceRewritingScreen = () => {
    const route = useRoute<SentenceRewritingScreenRouteProp>();
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { lessonId, lessonTitle } = route.params;

    // --- State Data ---
    const [arrList, setArrList] = useState<SentenceRewritingQuestion[]>([]);
    const [loading, setLoading] = useState(false);

    // --- State UI Modal ---
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    // --- State Form ---
    const [arrForm, setArrForm] = useState({ original: '', rewritten: '', hint: '' });

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
                    setArrList(data.listSentenceRewriting || []);
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
        // Yêu cầu > 5 câu, tức là <= 5 câu thì hiện warning
        const shouldWarn = arrList.length <= 5;

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

        if (shouldWarn) {
            animation.start();
        } else {
            animation.stop();
            pulseAnim.setValue(1);
        }

        return () => animation.stop();
    }, [arrList.length]);

    // --- 2. Logic Validation ---
    const handleBlur = (field: string, value: string) => {
        let currentErrors = { ...errors };
        const trimmedValue = value.trim();

        if (!trimmedValue) {
            if (field !== 'hint') { // Hint có thể để trống
                currentErrors[field] = 'Không được để trống trường này.';
            }
        } else {
            delete currentErrors[field];
        }

        // Logic check ghép câu: Từ xáo trộn và câu đúng phải khớp nhau về ký tự
        const valOriginal = field === 'original' ? trimmedValue : arrForm.original;
        const valRewritten = field === 'rewritten' ? trimmedValue : arrForm.rewritten;

        if (valOriginal && valRewritten) {
            if (normalizeString(valOriginal) !== normalizeString(valRewritten)) {
                currentErrors['rewritten'] = 'Nội dung không khớp (thừa/thiếu ký tự so với từ xáo trộn).';
            } else {
                delete currentErrors['rewritten'];
            }
        }

        setErrors(currentErrors);
    };

    // --- 3. Handlers Modal ---
    const handleOpenAdd = () => {
        setIsEditing(false);
        setErrors({});
        setArrForm({ original: '', rewritten: '', hint: '' });
        setModalVisible(true);
    };

    const handleOpenEdit = (item: SentenceRewritingQuestion) => {
        setIsEditing(true);
        setSelectedId(item.questionId);
        setErrors({});

        setArrForm({
            original: item.originalSentence,
            rewritten: item.rewrittenSentence,
            hint: item.hint || ''
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

        if (!arrForm.original || !arrForm.rewritten) {
            Alert.alert("Thiếu thông tin", "Vui lòng nhập từ xáo trộn và câu đúng.");
            return;
        }

        if (normalizeString(arrForm.original) !== normalizeString(arrForm.rewritten)) {
            Alert.alert("Lỗi Logic", "Nội dung câu hoàn chỉnh không khớp với các ký tự trong từ xáo trộn.");
            setErrors({ ...errors, rewritten: 'Nội dung không khớp.' });
            return;
        }

        try {
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
            setModalVisible(false);
            Alert.alert("Thành công", isEditing ? "Cập nhật bài tập thành công!" : "Thêm mới bài tập thành công!");

        } catch (error) {
            console.log("Lỗi khi lưu:", error);
            Alert.alert("Thất bại", "Đã có lỗi xảy ra khi lưu dữ liệu.");
        }
    };

    // --- 5. Xử lý Xoá ---
    const handleDelete = (id: number) => {
        Alert.alert("Xác nhận xoá", "Bạn có chắc chắn không?", [
            { text: "Huỷ", style: "cancel" },
            {
                text: "Xoá", style: 'destructive', onPress: async () => {
                    try {
                        await exerciseService.deleteSentenceRewritingQuestion(id);
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                        setArrList(arrList.filter(i => i.questionId !== id));
                        // Alert để trong timeout tránh block UI
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
    const renderArrItem = (item: SentenceRewritingQuestion, index: number) => {
        const chips = item.originalSentence ? item.originalSentence.split(',').map(s => s.trim()) : [];
        return (
            <View key={item.questionId} style={styles.arrCard}>
                <View style={styles.cardHeader}>
                    <View style={[styles.badgeContainer, { flex: 1, paddingRight: 10 }]}>
                        <View style={styles.badgeArr}><Text style={styles.badgeTextArr}>Bài {index + 1}</Text></View>
                        {item.hint ? <Text style={styles.hintText}>💡 {item.hint}</Text> : null}
                    </View>

                    <View style={styles.actionRow}>
                        <TouchableOpacity onPress={() => handleOpenEdit(item)}><Text style={styles.editIcon}>✏️</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(item.questionId)}><Text style={styles.delIcon}>✕</Text></TouchableOpacity>
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
                {/* Header Section */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: COLORS.arrPrimary }]}>🔠 Sắp Xếp Câu</Text>
                    <TouchableOpacity style={[styles.addBtnSmall, { backgroundColor: COLORS.arrPrimary }]} onPress={handleOpenAdd}>
                        <Text style={styles.addBtnText}>+ Thêm câu</Text>
                    </TouchableOpacity>
                </View>

                {/* --- WARNING BANNER (NEW) --- */}
                {arrList.length < 5 && (
                    <Animated.View style={[styles.warningContainer, { opacity: pulseAnim }]}>
                        <View style={styles.warningIconContainer}>
                            <Text style={styles.warningIcon}>⚠️</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.warningTitle}>Chưa đủ điều kiện!</Text>
                            <Text style={styles.warningDesc}>
                                Cần tối thiểu <Text style={{ fontWeight: 'bold' }}>5 câu</Text> để học viên có thể bắt đầu thử thách.
                                (Hiện tại: {arrList.length}/5)
                            </Text>
                        </View>
                    </Animated.View>
                )}
                {/* --------------------------- */}

                {loading ? <ActivityIndicator color={COLORS.arrPrimary} style={{ marginTop: 20 }} /> : (
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
                        <View style={[styles.modalHeader, { backgroundColor: COLORS.arrPrimary }]}>
                            <Text style={styles.modalTitle}>{isEditing ? "Chỉnh sửa" : "Thêm mới"} Ghép câu</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={styles.closeBtn}>✕</Text></TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={{ padding: 20 }}>
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

                            <TouchableOpacity
                                style={[styles.saveBtn, { backgroundColor: COLORS.arrPrimary }]}
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

    // --- Arr Card Styles ---
    arrCard: {
        backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 16,
        elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1,
        borderLeftWidth: 4, borderLeftColor: COLORS.arrPrimary
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
    badgeArr: { backgroundColor: COLORS.arrLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    badgeTextArr: { color: COLORS.arrPrimary, fontWeight: 'bold', fontSize: 11 },
    hintText: { fontSize: 12, color: COLORS.textSub, fontStyle: 'italic', marginTop: 4 },
    editIcon: { fontSize: 16, marginRight: 12 },
    delIcon: { fontSize: 16, color: COLORS.danger },

    // --- Chips & Content ---
    chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, justifyContent: 'center' },
    chip: { backgroundColor: COLORS.arrPrimary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, margin: 4 },
    chipText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    correctSentenceBox: { marginTop: 4, padding: 10, backgroundColor: '#E8F5E9', borderRadius: 8, borderWidth: 1, borderColor: '#C8E6C9', alignItems: 'center' },
    correctSentenceText: { color: '#2E7D32', fontWeight: '600', fontSize: 15 },

    // --- Warning Banner Styles (NEW) ---
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
    // -----------------------------------

    // --- Modal Styles ---
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
    saveBtn: { marginTop: 20, padding: 15, borderRadius: 12, alignItems: 'center', elevation: 3 },
    saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default CreateSentenceRewritingScreen;