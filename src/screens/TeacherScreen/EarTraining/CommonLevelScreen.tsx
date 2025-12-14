import React, { useState, useEffect, useMemo, useRef } from 'react'; // Đã thêm useRef
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Dimensions,
    TextInput,
    Keyboard,
    Alert,
    Modal,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    RefreshControl
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';

import videoService from '../../../services/videoService';
import { VideoSummaryResponse } from '../../../types/response/VideoResponse';

const { width } = Dimensions.get('window');

// ... (Giữ nguyên LEVEL_THEMES, VIDEO_TYPES, DetailHeader, VideoCard, CustomInput như cũ)
const LEVEL_THEMES: Record<string, { primary: string; secondary: string; name: string }> = {
    A1: { primary: '#FF6B6B', secondary: '#FFEBEE', name: 'Beginner' },
    A2: { primary: '#FF9F43', secondary: '#FFF3E0', name: 'Elementary' },
    B1: { primary: '#FDCB6E', secondary: '#FFF8E1', name: 'Intermediate' },
    B2: { primary: '#2ECC71', secondary: '#E8F5E9', name: 'Upper-Inter' },
    C1: { primary: '#0984E3', secondary: '#E3F2FD', name: 'Advanced' },
    C2: { primary: '#6C5CE7', secondary: '#EDE7F6', name: 'Proficiency' },
};

const VIDEO_TYPES = ['Daily Life', 'Communication', 'Travel', 'Grammar', 'Vocabulary', 'Business', 'News'];

const DetailHeader = ({ levelId, onBack }: { levelId: string; onBack: () => void }) => {
    const theme = LEVEL_THEMES[levelId] || LEVEL_THEMES.A1;
    return (
        <View style={[styles.headerContainer, { backgroundColor: theme.primary }]}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
            </TouchableOpacity>
            <View>
                <Text style={styles.headerTitle}>Level {levelId}</Text>
                <Text style={styles.headerSubtitle}>{theme.name} Listening</Text>
            </View>
            <MaterialCommunityIcons name="school" size={40} color="rgba(255,255,255,0.2)" style={styles.headerDecor} />
        </View>
    );
};

const VideoCard = ({
    item, index, theme, onPress, onEdit, onDelete
}: {
    item: VideoSummaryResponse; index: number; theme: any;
    onPress: () => void; onEdit: () => void; onDelete: () => void;
}) => {
    return (
        <Animatable.View animation="fadeInUp" duration={800} delay={index * 100}>
            <TouchableOpacity style={styles.cardContainer} onPress={onPress} activeOpacity={0.9}>
                <View style={styles.thumbnailWrapper}>
                    <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
                    <View style={styles.playOverlay}>
                        <MaterialCommunityIcons name="play-circle" size={30} color="#fff" />
                    </View>
                </View>
                <View style={styles.cardContent}>
                    <View style={[styles.topicTag, { backgroundColor: theme.secondary }]}>
                        <Text style={[styles.topicText, { color: theme.primary }]}>{item.type}</Text>
                    </View>
                    <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
                    <View style={styles.cardFooter}>
                        <MaterialCommunityIcons name="youtube" size={16} color="#FF0000" />
                        <Text style={styles.durationText}> YouTube • {item.level}</Text>
                    </View>
                </View>
                <View style={styles.actionGroup}>
                    <TouchableOpacity style={[styles.iconBtn, { backgroundColor: '#E3F2FD' }]} onPress={onEdit}>
                        <MaterialCommunityIcons name="pencil" size={18} color="#2196F3" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.iconBtn, { backgroundColor: '#FFEBEE', marginTop: 8 }]} onPress={onDelete}>
                        <MaterialCommunityIcons name="trash-can-outline" size={18} color="#F44336" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Animatable.View>
    );
};

const CustomInput = ({
    label, value, onChangeText, placeholder, theme, error, onBlur, icon,
    editable = true
}: any) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
        <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: error ? '#FF4444' : (isFocused ? theme.primary : '#666') }]}>{label}</Text>
            <Animatable.View
                animation={error ? "shake" : undefined} duration={500}
                style={[
                    styles.inputContainer,
                    isFocused && { borderColor: theme.primary, backgroundColor: '#fff' },
                    !editable && { backgroundColor: '#F0F0F0', borderColor: '#DDD' },
                    error && { borderColor: '#FF4444', backgroundColor: '#FFF0F0' }
                ]}
            >
                <MaterialCommunityIcons
                    name={icon} size={20}
                    color={!editable ? '#999' : (error ? '#FF4444' : (isFocused ? theme.primary : '#999'))}
                    style={{ marginRight: 10 }}
                />
                <TextInput
                    style={[styles.textInput, !editable && { color: '#888' }]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#ccc"
                    editable={editable}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => { setIsFocused(false); if (onBlur) onBlur(); }}
                />
                {!editable && <MaterialCommunityIcons name="lock" size={18} color="#999" style={{ marginLeft: 5 }} />}
            </Animatable.View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );
};

// --- MẢNG TEXT TRẠNG THÁI LOADING ---
const PROCESSING_STEPS = [
    "Đang kết nối đến YouTube...",
    "Đang tải video về server...",
    "AI đang phân tích âm thanh...",
    "Đang trích xuất phụ đề...",
    "Đang tạo bài học...",
    "Gần xong rồi..."
];

const CommonLevelScreen = ({ route, navigation }: any) => {
    const { levelId } = route.params || { levelId: 'A1' };
    const theme = LEVEL_THEMES[levelId] || LEVEL_THEMES.A1;

    const [videos, setVideos] = useState<VideoSummaryResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // --- STATE MỚI CHO LOADING HIỆU ỨNG ---
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [processingStep, setProcessingStep] = useState(0);

    const [selectedType, setSelectedType] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [newVideo, setNewVideo] = useState({ title: '', url: '', type: '' });
    const [formErrors, setFormErrors] = useState({ title: '', url: '', type: '' });
    const [editingId, setEditingId] = useState<number | null>(null);

    // --- EFFECT ĐỂ THAY ĐỔI TEXT LOADING ---
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isSubmitting) {
            setProcessingStep(0);
            interval = setInterval(() => {
                setProcessingStep((prev) => (prev + 1) % PROCESSING_STEPS.length);
            }, 2500); // Đổi chữ mỗi 2.5 giây
        }
        return () => clearInterval(interval);
    }, [isSubmitting]);

    const fetchVideos = async () => {
        try {
            const response = await videoService.getVideoByLevel(levelId);
            if (response && response.data) setVideos(response.data);
        } catch (error) { console.log("Error fetch:", error); }
    };

    useEffect(() => {
        setLoading(true);
        fetchVideos().finally(() => setLoading(false));
    }, [levelId]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchVideos();
        setRefreshing(false);
    };

    const topics = useMemo(() => ['All', ...Array.from(new Set(videos.map(v => v.type)))], [videos]);

    const filteredVideos = useMemo(() => {
        return videos.filter(v => {
            const matchType = selectedType === 'All' || v.type === selectedType;
            const title = v.title ? v.title.toLowerCase() : '';
            return matchType && title.includes(searchQuery.toLowerCase());
        });
    }, [videos, selectedType, searchQuery]);

    const handleOpenAdd = () => {
        setEditingId(null);
        setNewVideo({ title: '', url: '', type: '' });
        setFormErrors({ title: '', url: '', type: '' });
        setModalVisible(true);
    };

    const handleEdit = (item: VideoSummaryResponse) => {
        setEditingId(item.id);
        setNewVideo({
            title: item.title,
            url: `https://www.youtube.com/watch?v=${item.youtubeId}`,
            type: item.type
        });
        setFormErrors({ title: '', url: '', type: '' });
        setModalVisible(true);
    };

    const handleDelete = (item: VideoSummaryResponse) => {
        Alert.alert("Xác nhận", `Bạn có chắc muốn xóa video "${item.title}"?`, [
            { text: "Hủy", style: "cancel" },
            {
                text: "Xóa", style: "destructive",
                onPress: async () => {
                    try {
                        await videoService.deleteVideo(item.id);
                        Alert.alert("Thành công", "Đã xóa video.");
                        onRefresh();
                    } catch (e) { Alert.alert("Lỗi", "Không thể xóa video này."); }
                }
            }
        ]);
    };

    const validateField = (field: string, value: string) => {
        let error = '';
        if (!value || value.trim() === '') error = 'Không được để trống';
        else if (field === 'url' && !value.includes('youtube.com') && !value.includes('youtu.be')) error = 'Link YouTube không hợp lệ';
        setFormErrors(prev => ({ ...prev, [field]: error }));
        return error === '';
    };

    // --- CẬP NHẬT HANDLE SUBMIT ---
    const handleSubmit = async () => {
        const validTitle = validateField('title', newVideo.title);
        const validUrl = validateField('url', newVideo.url);
        const validType = validateField('type', newVideo.type);

        if (validTitle && validUrl && validType) {
            // Đóng modal nhập liệu trước để hiển thị modal loading
            setModalVisible(false);

            // Bắt đầu hiệu ứng loading
            setIsSubmitting(true);

            try {
                const requestData = new FormData();
                requestData.append('title', newVideo.title);
                requestData.append('url', newVideo.url);
                requestData.append('level', levelId.toString());
                requestData.append('type', newVideo.type);

                if (editingId) {
                    await videoService.updateVideo(editingId, requestData);
                } else {
                    await videoService.createVideo(requestData);
                }

                // Đợi một chút để người dùng nhìn thấy thông báo "Hoàn tất" nếu mạng quá nhanh
                // (Tùy chọn, có thể bỏ dòng này)
                await new Promise(resolve => setTimeout(resolve, 500));

                Alert.alert("Thành công", editingId ? "Đã cập nhật video!" : "Đã thêm video mới!");
                onRefresh();

            } catch (error) {
                console.log(error);
                // Nếu lỗi, hiện lại modal nhập liệu để sửa
                setModalVisible(true);
                Alert.alert("Lỗi", "Có lỗi xảy ra. Vui lòng kiểm tra lại link hoặc thử lại sau.");
            } finally {
                // Tắt hiệu ứng loading
                setIsSubmitting(false);
            }
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
            <DetailHeader levelId={levelId} onBack={() => navigation.goBack()} />

            <View style={styles.bodyContainer}>
                {/* ... (Phần hiển thị danh sách video giữ nguyên) */}
                <Animatable.View animation="fadeInDown" duration={600} style={styles.searchContainer}>
                    <View style={[styles.searchWrapper, isSearchFocused && { borderColor: theme.primary, borderWidth: 1.5, elevation: 4 }]}>
                        <MaterialCommunityIcons name="magnify" size={24} color={isSearchFocused ? theme.primary : "#999"} style={{ marginRight: 10 }} />
                        <TextInput
                            style={styles.searchInput} placeholder="Tìm kiếm bài giảng..." placeholderTextColor="#999"
                            value={searchQuery} onChangeText={setSearchQuery}
                            onFocus={() => setIsSearchFocused(true)} onBlur={() => setIsSearchFocused(false)}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => { setSearchQuery(''); Keyboard.dismiss() }}>
                                <MaterialCommunityIcons name="close-circle" size={20} color="#ccc" />
                            </TouchableOpacity>
                        )}
                    </View>
                </Animatable.View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.primary} />
                        <Text style={{ marginTop: 10, color: '#888' }}>Đang tải dữ liệu...</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.filterContainer}>
                            <FlatList
                                horizontal showsHorizontalScrollIndicator={false} data={topics} keyExtractor={item => item}
                                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 10 }}
                                renderItem={({ item }) => {
                                    const isActive = item === selectedType;
                                    return (
                                        <TouchableOpacity onPress={() => setSelectedType(item)}
                                            style={[styles.filterChip, isActive ? { backgroundColor: theme.primary, borderColor: theme.primary } : { backgroundColor: '#fff', borderColor: '#ddd' }]}
                                        >
                                            <Text style={[styles.filterText, isActive ? { color: '#fff', fontWeight: 'bold' } : { color: '#666' }]}>{item === 'All' ? 'Tất cả' : item}</Text>
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        </View>

                        <FlatList
                            data={filteredVideos}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} tintColor={theme.primary} />
                            }
                            renderItem={({ item, index }) => (
                                <VideoCard
                                    item={item} index={index} theme={theme}
                                    onPress={() => console.log("Play")}
                                    onEdit={() => handleEdit(item)}
                                    onDelete={() => handleDelete(item)}
                                />
                            )}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <MaterialCommunityIcons name={searchQuery ? "file-search-outline" : "folder-search-outline"} size={60} color="#ccc" />
                                    <Text style={{ color: '#888', marginTop: 10 }}>{searchQuery ? "Không tìm thấy kết quả." : "Danh sách trống."}</Text>
                                </View>
                            }
                        />
                    </>
                )}
            </View>

            <Animatable.View animation="zoomIn" delay={1000} style={styles.fabContainer}>
                <TouchableOpacity style={[styles.fabButton, { backgroundColor: theme.primary }]} onPress={handleOpenAdd} activeOpacity={0.8}>
                    <Animatable.View animation="pulse" iterationCount="infinite" direction="alternate">
                        <MaterialCommunityIcons name="plus" size={32} color="#fff" />
                    </Animatable.View>
                </TouchableOpacity>
            </Animatable.View>

            {/* MODAL INPUT VIDEO (Giữ nguyên) */}
            <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <Animatable.View animation="slideInUp" duration={500} style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{editingId ? 'Cập Nhật Video' : 'Thêm Video Mới'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                            <Text style={{ textAlign: 'center', marginBottom: 20, color: '#666' }}>
                                {editingId ? 'Chỉnh sửa thông tin' : 'Thêm vào danh sách'} <Text style={{ fontWeight: 'bold', color: theme.primary }}>Level {levelId}</Text>
                            </Text>

                            <CustomInput
                                label="Tiêu đề video" icon="format-title" value={newVideo.title}
                                onChangeText={(text: string) => setNewVideo({ ...newVideo, title: text })}
                                onBlur={() => validateField('title', newVideo.title)}
                                error={formErrors.title} placeholder="VD: Daily Morning..." theme={theme}
                            />

                            <CustomInput
                                label="Đường dẫn YouTube" icon="link-variant" value={newVideo.url}
                                editable={!editingId}
                                onChangeText={(text: string) => setNewVideo({ ...newVideo, url: text })}
                                onBlur={() => validateField('url', newVideo.url)}
                                error={formErrors.url} placeholder="https://youtube.com/..." theme={theme}
                            />

                            <View style={styles.inputGroup}>
                                <Text style={[styles.inputLabel, { color: formErrors.type ? '#FF4444' : '#666' }]}>Thể loại</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                                    {VIDEO_TYPES.map((type) => {
                                        const isSelected = newVideo.type === type;
                                        return (
                                            <TouchableOpacity key={type}
                                                onPress={() => { setNewVideo({ ...newVideo, type: type }); setFormErrors({ ...formErrors, type: '' }) }}
                                                style={[styles.typeOption, isSelected && { backgroundColor: theme.primary, borderColor: theme.primary }, formErrors.type && !isSelected && { borderColor: '#FF4444' }]}
                                            >
                                                <Text style={[styles.typeOptionText, isSelected && { color: '#fff' }]}>{type}</Text>
                                                {isSelected && <MaterialCommunityIcons name="check-circle" size={16} color="#fff" style={{ marginLeft: 5 }} />}
                                            </TouchableOpacity>
                                        )
                                    })}
                                </ScrollView>
                                {formErrors.type ? <Text style={styles.errorText}>{formErrors.type}</Text> : null}
                            </View>

                            <TouchableOpacity style={[styles.submitButton, { backgroundColor: theme.primary }]} onPress={handleSubmit}>
                                <Text style={styles.submitButtonText}>{editingId ? 'Lưu Thay Đổi' : 'Xác nhận thêm'}</Text>
                                <MaterialCommunityIcons name={editingId ? "content-save" : "arrow-right"} size={20} color="#fff" />
                            </TouchableOpacity>
                        </ScrollView>
                    </Animatable.View>
                </KeyboardAvoidingView>
            </Modal>

            {/* --- NEW: LOADING OVERLAY (SINH ĐỘNG) --- */}
            <Modal visible={isSubmitting} transparent animationType="fade">
                <View style={styles.processingOverlay}>
                    <Animatable.View
                        animation="zoomIn"
                        duration={400}
                        style={styles.processingContainer}
                    >
                        {/* Icon Cloud/Youtube bay nhảy */}
                        <Animatable.View
                            animation="bounce"
                            iterationCount="infinite"
                            duration={2000}
                            style={{ marginBottom: 20 }}
                        >
                            <MaterialCommunityIcons name="cloud-upload" size={60} color={theme.primary} />
                            <View style={{ position: 'absolute', bottom: -5, right: -5, backgroundColor: '#fff', borderRadius: 10 }}>
                                <MaterialCommunityIcons name="youtube" size={30} color="#FF0000" />
                            </View>
                        </Animatable.View>

                        <ActivityIndicator size="large" color={theme.primary} style={{ marginBottom: 15 }} />

                        <Text style={styles.processingTitle}>Đang xử lý</Text>

                        {/* Text thay đổi liên tục */}
                        <Animatable.Text
                            key={processingStep} // Key thay đổi để trigger animation mới
                            animation="fadeInUp"
                            duration={500}
                            style={styles.processingText}
                        >
                            {PROCESSING_STEPS[processingStep]}
                        </Animatable.Text>
                    </Animatable.View>
                </View>
            </Modal>
        </View>
    );
};

export default CommonLevelScreen;

// --- STYLES (ĐÃ BỔ SUNG PHẦN LOADING) ---
const styles = StyleSheet.create({
    // ... (Giữ nguyên styles cũ)
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    headerContainer: { paddingTop: 50, paddingBottom: 30, paddingHorizontal: 20, borderBottomRightRadius: 25, borderBottomLeftRadius: 25, flexDirection: 'row', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, overflow: 'hidden', zIndex: 10 },
    backButton: { marginRight: 15, padding: 5 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)' },
    headerDecor: { position: 'absolute', right: 20, bottom: -10, transform: [{ rotate: '-15deg' }] },
    bodyContainer: { flex: 1 },
    searchContainer: { paddingHorizontal: 20, marginTop: 20, marginBottom: 15 },
    searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 15, paddingHorizontal: 15, height: 50, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, borderWidth: 1, borderColor: 'transparent' },
    searchInput: { flex: 1, fontSize: 16, color: '#333', height: '100%' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { alignItems: 'center', marginTop: 50, paddingHorizontal: 40 },
    filterContainer: { height: 50, marginBottom: 5 },
    filterChip: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginRight: 10, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    filterText: { fontSize: 14 },
    listContent: { paddingHorizontal: 20, paddingBottom: 80 },
    cardContainer: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, marginBottom: 15, padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, alignItems: 'center' },
    thumbnailWrapper: { position: 'relative', marginRight: 12 },
    thumbnail: { width: 100, height: 75, borderRadius: 12, backgroundColor: '#eee' },
    playOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12 },
    cardContent: { flex: 1, justifyContent: 'space-between', height: 75, paddingVertical: 2, marginRight: 5 },
    topicTag: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginBottom: 4 },
    topicText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    videoTitle: { fontSize: 15, fontWeight: '600', color: '#333', lineHeight: 20 },
    cardFooter: { flexDirection: 'row', alignItems: 'center' },
    durationText: { fontSize: 12, color: '#888' },
    actionGroup: { flexDirection: 'column', marginLeft: 5, justifyContent: 'center', alignItems: 'center' },
    iconBtn: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    fabContainer: { position: 'absolute', bottom: 30, right: 20, zIndex: 20 },
    fabButton: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, maxHeight: '85%', elevation: 10 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 15 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    inputGroup: { marginBottom: 20 },
    inputLabel: { fontSize: 14, marginBottom: 8, fontWeight: '600', marginLeft: 4 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F7FA', borderWidth: 1.5, borderColor: '#EEE', borderRadius: 12, paddingHorizontal: 15, height: 50 },
    textInput: { flex: 1, color: '#333', fontSize: 16 },
    errorText: { color: '#FF4444', fontSize: 12, marginTop: 5, marginLeft: 5 },
    typeOption: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#DDD', marginRight: 10, backgroundColor: '#FFF' },
    typeOptionText: { fontSize: 14, fontWeight: '500' },
    submitButton: { flexDirection: 'row', height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 10, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2 },
    submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginRight: 10 },

    // --- STYLES MỚI CHO LOADING ---
    processingOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)', // Tối màu nền hơn để nổi bật loading
        justifyContent: 'center',
        alignItems: 'center',
    },
    processingContainer: {
        width: width * 0.8,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    processingTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    processingText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        height: 20, // Cố định chiều cao để không bị nhảy layout khi đổi text
        fontStyle: 'italic'
    }
});