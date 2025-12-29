import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    Modal,
    TextInput,
    ActivityIndicator,
    Alert,
    Platform,
    LayoutAnimation,
    UIManager,
    KeyboardAvoidingView,
    ScrollView,
    StatusBar
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { EnglishVocabularyTheoryResponse } from '../../../types/response/VocabularyResponse';
import vocabularyService from '../../../services/vocabularyService';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const COLORS = {
    primary: '#6C63FF',
    secondary: '#FF6584',
    background: '#F7F9FC',
    cardBg: '#FFFFFF',
    textMain: '#2E3A59',
    textSub: '#8F9BB3',
    inputBg: '#EDF1F7',
    success: '#00E096',
    danger: '#FF3B30',
    warning: '#FFCC00'
};

const VOCAB_TYPES = ['Noun', 'Verb', 'Adjective', 'Adverb', 'Preposition', 'Interjection'];

type VocabularyScreenRouteProp = RouteProp<
    { VocabularyParams: { lessonId: number; lessonTitle: string } },
    'VocabularyParams'
>;

const VocabularyOfLessonScreen = () => {
    const [vocabList, setVocabList] = useState<EnglishVocabularyTheoryResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [isLastPage, setIsLastPage] = useState(false);

    const route = useRoute<VocabularyScreenRouteProp>();
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { lessonId, lessonTitle } = route.params;

    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetchingIPA, setIsFetchingIPA] = useState(false);

    const [formWord, setFormWord] = useState({
        word: '',
        meaning: '',
        ipa: '',
        example: '',
        type: 'Noun',
        image: null as string | null,
    });

    const [errors, setErrors] = useState({
        word: '',
        meaning: '',
        ipa: '',
        example: ''
    });

    const fetchVocabulary = useCallback(async (pageNum: number, isRefresh = false) => {
        if (loading) return;
        setLoading(true);
        try {
            const response = await vocabularyService.getVocabularyTheoriesByLesson(lessonId, pageNum, 10);
            const responseData = response.data;
            const newItems = responseData.content;
            const isLast = responseData.last;
            const currentPage = responseData.number;

            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

            if (isRefresh) {
                setVocabList(newItems);
            } else {
                setVocabList(prev => [...prev, ...newItems]);
            }
            setIsLastPage(isLast);
            setPage(currentPage);
        } catch (error) {
            console.log("Error fetching vocabulary:", error);
        } finally {
            setLoading(false);
        }
    }, [loading, lessonId]);

    useEffect(() => {
        fetchVocabulary(0, true);
    }, []);

    // ✨ LOGIC CẬP NHẬT: Cho phép chạy cả khi đang Edit
    const fetchIPAAuto = async (word: string) => {
        if (!word.trim()) return;

        setIsFetchingIPA(true);
        try {
            const response = await vocabularyService.getIPAVocabulary(word.trim());
            if (response.data && response.data.ipa) {
                setFormWord(prev => ({ ...prev, ipa: response.data.ipa }));
                setErrors(prev => ({ ...prev, ipa: '' }));
            }
        } catch (error) {
            console.log("Lỗi lấy IPA tự động:", error);
        } finally {
            setIsFetchingIPA(false);
        }
    };

    const resetForm = () => {
        setFormWord({ word: '', meaning: '', ipa: '', example: '', type: 'Noun', image: null });
        setErrors({ word: '', meaning: '', ipa: '', example: '' });
        setIsEditing(false);
        setSelectedId(null);
        setIsSubmitting(false);
        setIsFetchingIPA(false);
    };

    const openAddModal = () => {
        resetForm();
        setIsEditing(false);
        setModalVisible(true);
    };

    const openEditModal = (item: EnglishVocabularyTheoryResponse) => {
        setIsEditing(true);
        setSelectedId(item.vocabId);
        setFormWord({
            word: item.word,
            meaning: item.meaning,
            ipa: item.ipa || '',
            example: item.example || '',
            type: item.type,
            image: item.image || null
        });
        setErrors({ word: '', meaning: '', ipa: '', example: '' });
        setModalVisible(true);
    };

    const handleBlur = (field: 'word' | 'meaning' | 'example' | 'ipa', value: string) => {
        if (!value.trim()) {
            setErrors(prev => ({ ...prev, [field]: 'Trường này không được để trống' }));
        } else {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }

        if (field === 'word' && value.trim()) {
            fetchIPAAuto(value); // Sẽ tự cập nhật IPA dù là Add hay Edit
        }
    };

    const handleSave = async () => {
        const wordError = !formWord.word.trim() ? 'Trường này không được để trống' : '';
        const meaningError = !formWord.meaning.trim() ? 'Trường này không được để trống' : '';
        const ipaError = !formWord.ipa.trim() ? 'Trường này không được để trống' : '';

        if (wordError || meaningError || ipaError) {
            setErrors({ ...errors, word: wordError, meaning: meaningError, ipa: ipaError });
            Alert.alert("Thiếu thông tin", "Vui lòng kiểm tra lại các trường báo lỗi.");
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('word', formWord.word);
            formData.append('meaning', formWord.meaning);
            formData.append('ipa', formWord.ipa);
            formData.append('type', formWord.type);
            formData.append('example', formWord.example);

            if (formWord.image && !formWord.image.startsWith('http')) {
                const localUri = formWord.image;
                const filename = localUri.split('/').pop() || `photo_${Date.now()}.jpg`;
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image/jpeg`;
                // @ts-ignore
                formData.append('file', { uri: localUri, name: filename, type: type });
            }

            if (isEditing && selectedId !== null) {
                const response = await vocabularyService.updateVocabulary(selectedId, formData);
                const updatedItem = response.data;
                LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
                const updatedList = vocabList.map(item => {
                    if (item.vocabId === selectedId) return updatedItem;
                    return item;
                });
                setVocabList(updatedList);
                Alert.alert("Cập nhật", "Đã sửa từ vựng thành công!");
            } else {
                const response = await vocabularyService.createVocabularyByLesson(lessonId, formData);
                const newItem = response.data;
                LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
                setVocabList([newItem, ...vocabList]);
                Alert.alert("Thành công", "Đã thêm từ vựng mới!");
            }
            setModalVisible(false);
            resetForm();
        } catch (error) {
            console.log("Lỗi khi lưu từ vựng:", error);
            Alert.alert("Lỗi", "Không thể lưu từ vựng. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            "Xác nhận xoá",
            "Bạn có chắc chắn muốn xoá từ vựng này không? Hành động này không thể hoàn tác.",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xoá ngay",
                    style: "destructive",
                    onPress: async () => {
                        if (selectedId !== null) {
                            setIsSubmitting(true);
                            try {
                                await vocabularyService.deleteVocabulary(selectedId);
                                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                const newList = vocabList.filter(item => item.vocabId !== selectedId);
                                setVocabList(newList);
                                setModalVisible(false);
                                resetForm();
                                Alert.alert("Thành công", "Đã xoá từ vựng khỏi danh sách.");
                            } catch (error) {
                                Alert.alert("Thất bại", "Đã có lỗi xảy ra khi xoá.");
                            } finally {
                                setIsSubmitting(false);
                            }
                        }
                    }
                }
            ]
        );
    };

    const pickImageFromLibrary = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });
            if (!result.canceled) {
                setFormWord({ ...formWord, image: result.assets[0].uri });
            }
        } catch (error) { console.log("Lỗi chọn ảnh:", error); }
    };

    const takePhotoFromCamera = async () => {
        try {
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (permissionResult.granted === false) {
                Alert.alert("Cần cấp quyền", "Bạn cần cấp quyền truy cập camera.");
                return;
            }
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });
            if (!result.canceled) {
                setFormWord({ ...formWord, image: result.assets[0].uri });
            }
        } catch (error) { console.log("Lỗi chụp ảnh:", error); }
    };

    const handlePickImage = () => {
        Alert.alert("Tải ảnh minh họa", "Bạn muốn chọn ảnh từ đâu?", [
            { text: "Hủy", style: "cancel" },
            { text: "📷 Chụp ảnh mới", onPress: takePhotoFromCamera },
            { text: "🖼️ Thư viện ảnh", onPress: pickImageFromLibrary }
        ]);
    };

    const renderItem = ({ item }: { item: EnglishVocabularyTheoryResponse }) => {
        const parts = item.example ? item.example.split(" -> ") : [];
        const englishPhrase = parts[0];
        const vietnamesePhrase = parts[1];

        return (
            <TouchableOpacity activeOpacity={0.7} onPress={() => openEditModal(item)} style={styles.cardContainer}>
                <View style={styles.card}>
                    <View style={styles.cardContent}>
                        <View style={styles.textContainer}>
                            <View style={styles.wordRow}>
                                <Text style={styles.wordText}>{item.word}</Text>
                                <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
                                    <Text style={styles.typeText}>{item.type}</Text>
                                </View>
                            </View>
                            {item.ipa ? <Text style={styles.ipaTextCard}>/{item.ipa}/</Text> : null}
                            <Text style={styles.meaningText}>{item.meaning}</Text>
                            {item.example ? (
                                <View style={styles.exampleBox}>
                                    <Text style={styles.exampleTextEn}>“{englishPhrase}”</Text>
                                    {vietnamesePhrase && <Text style={styles.exampleTextVi}>➥ {vietnamesePhrase}</Text>}
                                </View>
                            ) : null}
                        </View>
                        {item.image && <Image source={{ uri: item.image }} style={styles.vocabImage} />}
                    </View>
                    <View style={styles.editHint}><Text style={{ fontSize: 10, color: COLORS.textSub }}>● ● ●</Text></View>
                </View>
            </TouchableOpacity>
        );
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Noun': return '#E0F7FA';
            case 'Verb': return '#FFEBEE';
            case 'Adjective': return '#E8F5E9';
            case 'Adverb': return '#FFF3E0';
            default: return '#F3E5F5';
        }
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/7486/7486744.png' }} style={styles.emptyImage} />
            <Text style={styles.emptyTitle}>Chưa có từ vựng nào</Text>
            <TouchableOpacity style={styles.addButtonLarge} onPress={openAddModal}>
                <Text style={styles.addButtonText}>+ Thêm từ vựng đầu tiên</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Từ Vựng</Text>
                <Text style={styles.headerSub}>Chủ đề: <Text style={{ fontWeight: 'bold', color: 'white' }}>{lessonTitle}</Text></Text>
            </View>

            <FlatList
                data={vocabList}
                renderItem={renderItem}
                keyExtractor={(item) => item.vocabId.toString()}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={!loading ? renderEmptyState : null}
                onEndReached={() => { if (!isLastPage && !loading) fetchVocabulary(page + 1); }}
                onEndReachedThreshold={0.5}
                ListFooterComponent={loading ? <ActivityIndicator size="small" color={COLORS.primary} /> : null}
            />

            {vocabList.length > 0 && (
                <TouchableOpacity style={styles.fab} onPress={openAddModal}>
                    <Text style={styles.fabIcon}>+</Text>
                </TouchableOpacity>
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => { if (!isSubmitting) setModalVisible(false); }}
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>{isEditing ? "Cập nhật từ vựng" : "Thêm từ vựng mới"}</Text>
                                <Text style={styles.modalSubTitle}>{isEditing ? "Chỉnh sửa thông tin chi tiết" : "Điền thông tin vào bên dưới"}</Text>
                            </View>
                            <TouchableOpacity onPress={() => !isSubmitting && setModalVisible(false)} style={styles.closeBtnCircle}>
                                <Text style={styles.closeButton}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.label}>Từ vựng (Word) <Text style={{ color: COLORS.danger }}>*</Text></Text>
                            <TextInput
                                style={[styles.input, errors.word ? styles.inputError : null]}
                                placeholder="e.g. Galaxy"
                                value={formWord.word}
                                editable={!isSubmitting}
                                onBlur={() => handleBlur('word', formWord.word)}
                                onChangeText={(t) => { setFormWord({ ...formWord, word: t }); if (t.trim()) setErrors({ ...errors, word: '' }); }}
                            />
                            {errors.word ? <Text style={styles.errorText}>{errors.word}</Text> : null}

                            <Text style={styles.label}>Định nghĩa (Meaning) <Text style={{ color: COLORS.danger }}>*</Text></Text>
                            <TextInput
                                style={[styles.input, errors.meaning ? styles.inputError : null]}
                                placeholder="e.g. Dải ngân hà"
                                value={formWord.meaning}
                                editable={!isSubmitting}
                                onBlur={() => handleBlur('meaning', formWord.meaning)}
                                onChangeText={(t) => { setFormWord({ ...formWord, meaning: t }); if (t.trim()) setErrors({ ...errors, meaning: '' }); }}
                            />
                            {errors.meaning ? <Text style={styles.errorText}>{errors.meaning}</Text> : null}

                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.label}>Phiên âm (IPA) <Text style={{ color: COLORS.danger }}>*</Text></Text>
                                {isFetchingIPA && <ActivityIndicator size="small" color={COLORS.secondary} style={{ marginLeft: 10, marginBottom: 8 }} />}
                            </View>
                            <TextInput
                                style={[styles.input, errors.ipa ? styles.inputError : null]}
                                placeholder={isFetchingIPA ? "Đang lấy phiên âm từ AI..." : "e.g. /ˈɡæləksi/"}
                                value={formWord.ipa}
                                editable={!isSubmitting}
                                onBlur={() => handleBlur('ipa', formWord.ipa)}
                                onChangeText={(t) => {
                                    setFormWord({ ...formWord, ipa: t });
                                    if (t.trim()) setErrors({ ...errors, ipa: '' });
                                }}
                            />
                            {errors.ipa ? <Text style={styles.errorText}>{errors.ipa}</Text> : null}

                            <Text style={styles.label}>Loại từ</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeContainer}>
                                {VOCAB_TYPES.map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        disabled={isSubmitting}
                                        style={[styles.typeChip, formWord.type === type && styles.typeChipSelected]}
                                        onPress={() => setFormWord({ ...formWord, type })}
                                    >
                                        <Text style={[styles.typeChipText, formWord.type === type && styles.typeChipTextSelected]}>{type}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Text style={styles.label}>Ví dụ & Ảnh minh họa</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Câu tiếng Anh -> Nghĩa tiếng Việt"
                                multiline
                                editable={!isSubmitting}
                                value={formWord.example}
                                onChangeText={(t) => setFormWord({ ...formWord, example: t })}
                            />

                            <TouchableOpacity style={styles.uploadButton} onPress={!isSubmitting ? handlePickImage : undefined}>
                                {formWord.image ? (
                                    <Image source={{ uri: formWord.image }} style={styles.uploadedImagePreview} />
                                ) : (
                                    <View style={{ alignItems: 'center' }}>
                                        <Text style={styles.uploadIcon}>📷</Text>
                                        <Text style={styles.uploadText}>Chạm để tải ảnh</Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            <View style={styles.actionRow}>
                                {isEditing && (
                                    <TouchableOpacity
                                        style={[styles.deleteButton, isSubmitting && { opacity: 0.5 }]}
                                        onPress={!isSubmitting ? handleDelete : undefined}
                                        disabled={isSubmitting}
                                    >
                                        <Text style={styles.deleteIcon}>🗑️</Text>
                                    </TouchableOpacity>
                                )}

                                <TouchableOpacity
                                    style={[styles.submitButton, !isEditing && { flex: 1 }, isSubmitting && { backgroundColor: '#A5A6F6' }]}
                                    onPress={handleSave}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>{isEditing ? "Lưu thay đổi" : "Tạo từ mới"}</Text>}
                                </TouchableOpacity>
                            </View>
                            <View style={{ height: 20 }} />
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        paddingTop: Platform.OS === 'android' ? 40 : 60,
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: '#3B82F6',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 3
    },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white', letterSpacing: 0.5 },
    headerSub: { fontSize: 14, color: '#E0F2F1', marginTop: 5 },
    listContent: { padding: 16, paddingBottom: 100 },
    cardContainer: { marginBottom: 16 },
    card: { backgroundColor: COLORS.cardBg, borderRadius: 20, padding: 18, shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 6, borderWidth: 1, borderColor: '#F0F0F0' },
    cardContent: { flexDirection: 'row', justifyContent: 'space-between' },
    textContainer: { flex: 1, marginRight: 12 },
    wordRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    wordText: { fontSize: 20, fontWeight: '800', color: COLORS.textMain, marginRight: 10 },
    ipaTextCard: { fontSize: 14, color: COLORS.secondary, marginBottom: 6, fontWeight: '500' },
    typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    typeText: { fontSize: 12, fontWeight: 'bold', color: COLORS.textMain },
    meaningText: { fontSize: 17, color: '#444', marginBottom: 8, fontWeight: '500' },
    exampleBox: { backgroundColor: '#F9FAFB', padding: 8, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: COLORS.secondary },
    exampleTextEn: { fontSize: 14, fontStyle: 'italic', color: COLORS.textMain, marginBottom: 2 },
    exampleTextVi: { fontSize: 13, color: COLORS.textSub },
    vocabImage: { width: 85, height: 85, borderRadius: 16, backgroundColor: '#eee' },
    editHint: { position: 'absolute', top: 10, right: 10, opacity: 0.5 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
    emptyImage: { width: 180, height: 180, marginBottom: 20, opacity: 0.9 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textMain, marginBottom: 20 },
    addButtonLarge: { backgroundColor: COLORS.primary, paddingVertical: 14, paddingHorizontal: 30, borderRadius: 30, elevation: 10 },
    addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    fab: { position: 'absolute', bottom: 30, right: 25, backgroundColor: '#3B82F6', width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', elevation: 10 },
    fabIcon: { fontSize: 36, color: '#fff', marginTop: -4 },
    modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(46, 58, 89, 0.6)' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40, maxHeight: '85%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    modalTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textMain },
    modalSubTitle: { fontSize: 13, color: COLORS.textSub, marginTop: 4 },
    closeBtnCircle: { backgroundColor: '#F0F2F5', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    closeButton: { fontSize: 18, color: COLORS.textMain, fontWeight: 'bold' },
    label: { fontSize: 13, fontWeight: '700', color: COLORS.textSub, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    input: { backgroundColor: COLORS.inputBg, borderRadius: 16, padding: 16, fontSize: 16, marginBottom: 20, color: COLORS.textMain, borderWidth: 1, borderColor: 'transparent' },
    inputError: { borderColor: COLORS.danger, borderWidth: 1, marginBottom: 8 },
    errorText: { color: COLORS.danger, fontSize: 12, marginTop: -4, marginBottom: 16, marginLeft: 4, fontWeight: '500' },
    textArea: { height: 100, textAlignVertical: 'top' },
    typeContainer: { flexDirection: 'row', marginBottom: 24, maxHeight: 50 },
    typeChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, backgroundColor: COLORS.inputBg, marginRight: 10, borderWidth: 1, borderColor: 'transparent' },
    typeChipSelected: { backgroundColor: COLORS.primary, shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 5, elevation: 3 },
    typeChipText: { color: COLORS.textSub, fontWeight: '600' },
    typeChipTextSelected: { color: '#fff' },
    uploadButton: { height: 140, borderWidth: 2, borderColor: '#E0E6ED', borderStyle: 'dashed', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 28, backgroundColor: '#FAFAFA' },
    uploadIcon: { fontSize: 36, marginBottom: 8, opacity: 0.7 },
    uploadText: { color: COLORS.textSub, fontWeight: '500' },
    uploadedImagePreview: { width: '100%', height: '100%', borderRadius: 18 },
    actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    submitButton: { flex: 1, backgroundColor: COLORS.primary, padding: 18, borderRadius: 20, alignItems: 'center', shadowColor: COLORS.primary, shadowOpacity: 0.3, elevation: 8, marginLeft: 12 },
    submitButtonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
    deleteButton: { backgroundColor: '#FFF0F0', width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FFE5E5' },
    deleteIcon: { fontSize: 22 },
});

export default VocabularyOfLessonScreen;