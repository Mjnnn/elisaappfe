import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
    Platform,
    LayoutAnimation,
    UIManager,
    KeyboardAvoidingView,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { AppTabsParamLessonList } from '../../../navigation/AppTabLesson';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';

// --- Import Service và Interface thực tế ---
import { EnglishGrammarResponse } from '../../../types/response/GrammarResponse';
import grammarService from '../../../services/grammarService';
import { AuthStackParamList } from '../../../navigation/AuthStack';

// Kích hoạt LayoutAnimation
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Theme Màu Sắc (Style "Notebook") ---
const COLORS = {
    primary: '#3B82F6', // Teal
    secondary: '#FF7043', // Deep Orange
    background: '#F0F4F8',
    cardBg: '#FFFFFF',
    textMain: '#263238',
    textSub: '#546E7A',
    inputBg: '#ECEFF1',
    structureBg: '#E0F2F1',
    structureText: '#00695C',
    danger: '#EF5350',
};

type GrammarRouteProp = RouteProp<AppTabsParamLessonList, 'Grammar'>;
// type Props = NativeStackScreenProps<AuthStackParamList, 'GrammarOfLessonScreen'>;

type GrammarScreenRouteProp = RouteProp<
    { GrammarParams: { lessonId: number; lessonTitle: string } },
    'GrammarParams'
>;

const GrammarOfLessonScreen = () => {
    const route = useRoute<GrammarScreenRouteProp>();
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { lessonId, lessonTitle } = route.params;

    // --- State ---
    const [grammarList, setGrammarList] = useState<EnglishGrammarResponse[]>([]);
    const [loading, setLoading] = useState(false);

    // Modal & Form State
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [form, setForm] = useState({
        title: '',
        content: '',
        usage: '',
        example: ''
    });

    const [errors, setErrors] = useState({
        title: '',
        content: ''
    });

    // --- 1. Fetch Data từ API ---
    const fetchGrammar = useCallback(async () => {
        setLoading(true);
        try {
            const response = await grammarService.getGrammarTheoriesByLesson(lessonId);
            const data = response.data;
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setGrammarList(data);
        } catch (error) {
            console.log("Lỗi lấy danh sách ngữ pháp:", error);
            Alert.alert("Lỗi kết nối", "Không thể tải danh sách ngữ pháp của bài học này.");
        } finally {
            setLoading(false);
        }
    }, [lessonId]);

    useEffect(() => {
        fetchGrammar();
    }, [fetchGrammar]);

    // --- 2. Form Handlers ---
    const resetForm = () => {
        setForm({ title: '', content: '', usage: '', example: '' });
        setErrors({ title: '', content: '' });
        setIsEditing(false);
        setSelectedId(null);
    };

    const openAddModal = () => {
        resetForm();
        setModalVisible(true);
    };

    const openEditModal = (item: EnglishGrammarResponse) => {
        setIsEditing(true);
        setSelectedId(item.grammarId);
        setForm({
            title: item.grammarTitle,
            content: item.grammarContent,
            usage: item.grammarUsage,
            example: item.grammarExample
        });
        setErrors({ title: '', content: '' });
        setModalVisible(true);
    };

    // --- MỚI THÊM: Hàm xử lý khi người dùng rời khỏi ô nhập liệu (onBlur) ---
    const handleBlur = (field: 'title' | 'content') => {
        const newErrors = { ...errors };

        if (field === 'title') {
            if (!form.title.trim()) {
                newErrors.title = 'Tên ngữ pháp không được để trống';
            } else {
                newErrors.title = '';
            }
        }

        if (field === 'content') {
            if (!form.content.trim()) {
                newErrors.content = 'Cấu trúc không được để trống';
            } else {
                newErrors.content = '';
            }
        }

        setErrors(newErrors);
    };

    // --- Cập nhật lại logic onChangeText để xóa lỗi ngay khi nhập ---
    const handleChangeText = (field: keyof typeof form, value: string) => {
        setForm({ ...form, [field]: value });

        // Nếu đang có lỗi ở trường này thì xóa lỗi đi khi người dùng bắt đầu nhập lại
        if (field === 'title' && errors.title) {
            setErrors(prev => ({ ...prev, title: '' }));
        }
        if (field === 'content' && errors.content) {
            setErrors(prev => ({ ...prev, content: '' }));
        }
    };

    const validate = () => {
        let isValid = true;
        const newErrors = { title: '', content: '' };

        if (!form.title.trim()) {
            newErrors.title = 'Vui lòng nhập tên ngữ pháp';
            isValid = false;
        }
        if (!form.content.trim()) {
            newErrors.content = 'Vui lòng nhập công thức/cấu trúc';
            isValid = false;
        }
        setErrors(newErrors);
        return isValid;
    };

    // --- 3. CRUD Logic: Tích hợp API Create/Update ---
    const handleSave = async () => {
        if (!validate()) return;
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('grammarTitle', form.title);
            formData.append('grammarContent', form.content);
            formData.append('grammarUsage', form.usage);
            formData.append('grammarExample', form.example);
            console.log("Form Data to submit:", formData);

            if (isEditing && selectedId !== null) {
                // --- UPDATE ---
                console.log("Updating grammar ID:", selectedId);
                const response = await grammarService.updateGrammar(selectedId, formData);

                const updatedItem = response.data;
                LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);

                const updatedList = grammarList.map(item =>
                    item.grammarId === selectedId ? updatedItem : item
                );
                setGrammarList(updatedList);
                Alert.alert("Thành công", "Đã cập nhật ngữ pháp!");

            } else {
                // --- CREATE ---
                console.log("Creating new grammar for lesson:", lessonId);
                const response = await grammarService.createGrammarOfLessonL(lessonId, formData);

                const newItem = response.data;
                LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);

                setGrammarList([newItem, ...grammarList]);
                Alert.alert("Thành công", "Đã thêm ngữ pháp mới!");
            }

            setModalVisible(false);
            resetForm();

        } catch (error) {
            console.log("Lỗi khi lưu ngữ pháp:", error);
            Alert.alert("Lỗi", "Không thể lưu ngữ pháp. Vui lòng kiểm tra lại kết nối.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- 4. CRUD Logic: Tích hợp API Delete ---
    const handleDelete = (id: number) => {
        Alert.alert(
            "Xác nhận xoá",
            "Bạn có chắc muốn xoá ngữ pháp này? Hành động này không thể hoàn tác.",
            [
                { text: "Huỷ", style: "cancel" },
                {
                    text: "Xoá",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await grammarService.deleteGrammar(id);
                            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                            setGrammarList(grammarList.filter(item => item.grammarId !== id));
                            Alert.alert("Thành công", "Đã xoá ngữ pháp.");
                        } catch (error) {
                            console.log("Lỗi xoá ngữ pháp:", error);
                            Alert.alert("Lỗi", "Không thể xoá ngữ pháp. Vui lòng thử lại.");
                        }
                    }
                }
            ]
        );
    };

    // --- 5. Render Components ---

    const renderCard = ({ item }: { item: EnglishGrammarResponse }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.titleContainer}>
                    <Text style={styles.cardTitle}>{item.grammarTitle}</Text>
                </View>
                <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => openEditModal(item)} style={styles.iconBtn}>
                        <Text style={styles.actionText}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.grammarId)} style={styles.iconBtn}>
                        <Text style={styles.actionText}>🗑️</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.sectionStructure}>
                <Text style={styles.sectionLabel}>⚡ Cấu trúc:</Text>
                <View style={styles.structureBox}>
                    <Text style={styles.structureText}>{item.grammarContent}</Text>
                </View>
            </View>

            {item.grammarUsage ? (
                <View style={styles.sectionRow}>
                    <Text style={styles.iconLabel}>💡</Text>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.sectionLabel}>Cách dùng:</Text>
                        <Text style={styles.bodyText}>{item.grammarUsage}</Text>
                    </View>
                </View>
            ) : null}

            {item.grammarExample ? (
                <View style={[styles.sectionRow, { marginTop: 12 }]}>
                    <Text style={styles.iconLabel}>🗣️</Text>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.sectionLabel}>Ví dụ:</Text>
                        <Text style={styles.exampleText}>"{item.grammarExample}"</Text>
                    </View>
                </View>
            ) : null}
        </View>
    );

    return (
        <View style={styles.container} >
            <View style={styles.screenHeader}>
                <Text style={styles.headerTitle}>Ngữ pháp</Text>
                <Text style={styles.headerSub}>Chủ đề:  <Text style={{ fontWeight: 'bold', color: 'white' }}>{lessonTitle}</Text> </Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={grammarList}
                    renderItem={renderCard}
                    keyExtractor={(item) => item.grammarId.toString()}
                    contentContainerStyle={styles.listContent}
                    onRefresh={fetchGrammar}
                    refreshing={loading}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Chưa có ngữ pháp nào 📘</Text>
                            <Text style={styles.emptySub}>Hãy bấm nút + để thêm mới</Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity style={styles.fab} onPress={openAddModal}>
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => { if (!isSubmitting) setModalVisible(false); }}
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{isEditing ? "Cập nhật Ngữ pháp" : "Thêm Ngữ pháp mới"}</Text>
                            <TouchableOpacity onPress={() => !isSubmitting && setModalVisible(false)}>
                                <Text style={styles.closeBtn}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Input: Tên Ngữ pháp */}
                            <Text style={styles.label}>Tên ngữ pháp <Text style={{ color: COLORS.danger }}>*</Text></Text>
                            <TextInput
                                style={[styles.input, errors.title ? { borderColor: COLORS.danger, borderWidth: 1 } : null]}
                                placeholder="VD: Thì hiện tại đơn"
                                value={form.title}
                                editable={!isSubmitting}
                                // THAY ĐỔI: Sử dụng handleChangeText và thêm onBlur
                                onChangeText={(text) => handleChangeText('title', text)}
                                onBlur={() => handleBlur('title')}
                            />
                            {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}

                            {/* Input: Cấu trúc */}
                            <Text style={styles.label}>Cấu trúc / Công thức <Text style={{ color: COLORS.danger }}>*</Text></Text>
                            <View style={[styles.inputContainer, { backgroundColor: COLORS.structureBg }]}>
                                <TextInput
                                    style={[styles.input, styles.textArea,
                                    { backgroundColor: 'transparent', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
                                    errors.content ? { borderColor: COLORS.danger, borderWidth: 1, borderRadius: 12 } : null
                                    ]}
                                    placeholder="VD: S + V(s/es) + O"
                                    placeholderTextColor="#80CBC4"
                                    multiline
                                    editable={!isSubmitting}
                                    value={form.content}
                                    // THAY ĐỔI: Sử dụng handleChangeText và thêm onBlur
                                    onChangeText={(text) => handleChangeText('content', text)}
                                    onBlur={() => handleBlur('content')}
                                />
                            </View>
                            {errors.content ? <Text style={styles.errorText}>{errors.content}</Text> : null}

                            {/* Input: Cách dùng */}
                            <Text style={styles.label}>Cách dùng</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="VD: Diễn tả một sự thật hiển nhiên..."
                                multiline
                                editable={!isSubmitting}
                                value={form.usage}
                                onChangeText={(text) => handleChangeText('usage', text)}
                            />

                            {/* Input: Ví dụ */}
                            <Text style={styles.label}>Ví dụ minh họa</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="VD: The sun rises in the East."
                                multiline
                                editable={!isSubmitting}
                                value={form.example}
                                onChangeText={(text) => handleChangeText('example', text)}
                            />

                            <View style={{ height: 20 }} />

                            <TouchableOpacity
                                style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
                                onPress={handleSave}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>{isEditing ? "Lưu thay đổi" : "Lưu ngữ pháp"}</Text>}
                            </TouchableOpacity>
                            <View style={{ height: 30 }} />
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    screenHeader: {
        paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20,
        backgroundColor: COLORS.primary,
        borderBottomRightRadius: 30, borderBottomLeftRadius: 30,
        elevation: 5, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3
    },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    headerSub: { fontSize: 14, color: '#E0F2F1', marginTop: 5 },
    listContent: { padding: 16, paddingBottom: 100 },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { fontSize: 18, color: COLORS.textSub, fontWeight: '600' },
    emptySub: { fontSize: 14, color: '#B0BEC5', marginTop: 8 },
    card: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 16,
        padding: 0,
        marginBottom: 20,
        elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 2 },
        borderLeftWidth: 5, borderLeftColor: COLORS.secondary
    },
    cardHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0'
    },
    titleContainer: { flex: 1 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
    cardActions: { flexDirection: 'row' },
    iconBtn: { marginLeft: 12, padding: 4 },
    actionText: { fontSize: 18 },
    sectionStructure: { padding: 16, backgroundColor: '#FAFAFA' },
    structureBox: {
        marginTop: 8, padding: 12, backgroundColor: COLORS.structureBg,
        borderRadius: 8, borderWidth: 1, borderColor: '#B2DFDB', borderStyle: 'dashed'
    },
    structureText: {
        fontSize: 16, fontWeight: 'bold', color: COLORS.textMain,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        lineHeight: 24
    },
    sectionRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8 },
    iconLabel: { fontSize: 18, marginRight: 10, marginTop: 2 },
    sectionLabel: { fontSize: 12, color: COLORS.textSub, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 },
    bodyText: { fontSize: 15, color: COLORS.textMain, lineHeight: 22 },
    exampleText: { fontSize: 15, color: COLORS.textMain, fontStyle: 'italic', lineHeight: 22, borderLeftWidth: 2, borderLeftColor: '#CFD8DC', paddingLeft: 8 },
    fab: {
        position: 'absolute', bottom: 30, right: 25,
        backgroundColor: '#3B82F6',
        width: 60, height: 60, borderRadius: 30,
        alignItems: 'center', justifyContent: 'center',
        elevation: 6, shadowColor: COLORS.secondary, shadowOpacity: 0.4, shadowOffset: { width: 0, height: 4 }
    },
    fabIcon: { fontSize: 32, color: '#fff', marginTop: -4 },
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: {
        backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: 24, height: '85%'
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textMain },
    closeBtn: { fontSize: 24, color: COLORS.textSub },
    label: { fontSize: 14, fontWeight: '700', color: COLORS.textSub, marginBottom: 8, marginTop: 12 },
    inputContainer: { borderRadius: 12 },
    input: {
        backgroundColor: COLORS.inputBg, borderRadius: 12, padding: 12,
        fontSize: 16, color: COLORS.textMain,
    },
    textArea: { height: 100, textAlignVertical: 'top' },
    errorText: { color: COLORS.danger, fontSize: 12, marginTop: 4 },
    submitBtn: {
        backgroundColor: '#6C63FF', padding: 16, borderRadius: 12, alignItems: 'center',
        marginTop: 10, elevation: 2
    },
    submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default GrammarOfLessonScreen;