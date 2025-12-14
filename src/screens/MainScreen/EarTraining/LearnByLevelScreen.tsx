import React, { useState, useEffect, useMemo } from 'react';
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
    Alert
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';

// --- IMPORT SERVICE & INTERFACE ---
// Hãy sửa đường dẫn này trỏ đúng về file service bạn vừa tạo
import videoService from '../../../services/videoService';
import { VideoSummaryResponse } from '../../../types/response/VideoResponse';

// --- 1. Cấu hình & Helper ---
const { width } = Dimensions.get('window');

const LEVEL_THEMES: Record<string, { primary: string; secondary: string; name: string }> = {
    A1: { primary: '#FF6B6B', secondary: '#FFEBEE', name: 'Beginner' },
    A2: { primary: '#FF9F43', secondary: '#FFF3E0', name: 'Elementary' },
    B1: { primary: '#FDCB6E', secondary: '#FFF8E1', name: 'Intermediate' },
    B2: { primary: '#2ECC71', secondary: '#E8F5E9', name: 'Upper-Inter' },
    C1: { primary: '#0984E3', secondary: '#E3F2FD', name: 'Advanced' },
    C2: { primary: '#6C5CE7', secondary: '#EDE7F6', name: 'Proficiency' },
};

// --- 2. Component Header ---
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

// --- 3. Component Video Card ---
// Sử dụng VideoSummaryResponse thay cho VideoData cũ
const VideoCard = ({ item, index, theme, onPress }: { item: VideoSummaryResponse; index: number; theme: any; onPress: () => void }) => {
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

                <View style={styles.actionButton}>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
                </View>
            </TouchableOpacity>
        </Animatable.View>
    );
};

// --- 4. Component Chính: CommonLevelScreen ---
const LearnByLevelScreen = ({ route, navigation }: any) => {
    const { levelId } = route.params || { levelId: 'A1' };
    const theme = LEVEL_THEMES[levelId] || LEVEL_THEMES.A1;

    // Sử dụng Interface từ API
    const [videos, setVideos] = useState<VideoSummaryResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState<string>('All');

    // State cho tìm kiếm
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // --- LOGIC GỌI API ---
    useEffect(() => {
        const fetchVideos = async () => {
            setLoading(true);
            try {
                // Gọi service lấy dữ liệu thật
                const response = await videoService.getVideoByLevel(levelId);

                // Axios trả về dữ liệu trong field `data`
                if (response && response.data) {
                    setVideos(response.data);
                }
            } catch (error) {
                console.log("Lỗi khi tải danh sách video:", error);
                Alert.alert("Thông báo", "Không thể tải dữ liệu bài giảng. Vui lòng kiểm tra kết nối.");
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, [levelId]);

    const topics = useMemo(() => {
        const uniqueTypes = Array.from(new Set(videos.map(v => v.type)));
        return ['All', ...uniqueTypes];
    }, [videos]);

    // Logic lọc video: Kết hợp cả Type và Search Query
    const filteredVideos = useMemo(() => {
        return videos.filter(v => {
            const matchType = selectedType === 'All' || v.type === selectedType;
            // Kiểm tra an toàn để tránh crash nếu title null
            const title = v.title ? v.title.toLowerCase() : '';
            const matchSearch = title.includes(searchQuery.toLowerCase());
            return matchType && matchSearch;
        });
    }, [videos, selectedType, searchQuery]);

    const handlePressVideo = (video: VideoSummaryResponse) => {
        console.log("Play video ID:", video.youtubeId);
        // Navigate sang màn hình player (nếu đã có)
        navigation.navigate('VideoLearningScreen', { videoId: video.id });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={theme.primary} />

            <DetailHeader levelId={levelId} onBack={() => navigation.goBack()} />

            <View style={styles.bodyContainer}>

                {/* === THANH TÌM KIẾM === */}
                <Animatable.View animation="fadeInDown" duration={600} style={styles.searchContainer}>
                    <View style={[
                        styles.searchWrapper,
                        isSearchFocused && { borderColor: theme.primary, borderWidth: 1.5, elevation: 4 }
                    ]}>
                        <MaterialCommunityIcons
                            name="magnify"
                            size={24}
                            color={isSearchFocused ? theme.primary : "#999"}
                            style={{ marginRight: 10 }}
                        />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Tìm kiếm bài giảng..."
                            placeholderTextColor="#999"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
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
                        <Text style={{ marginTop: 10, color: '#888' }}>Đang tải bài giảng từ hệ thống...</Text>
                    </View>
                ) : (
                    <>
                        {/* Filter Tags */}
                        <View style={styles.filterContainer}>
                            <FlatList
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                data={topics}
                                keyExtractor={item => item}
                                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 10 }}
                                renderItem={({ item }) => {
                                    const isActive = item === selectedType;
                                    return (
                                        <TouchableOpacity
                                            onPress={() => setSelectedType(item)}
                                            style={[
                                                styles.filterChip,
                                                isActive
                                                    ? { backgroundColor: theme.primary, borderColor: theme.primary }
                                                    : { backgroundColor: '#fff', borderColor: '#ddd' }
                                            ]}
                                        >
                                            <Text style={[
                                                styles.filterText,
                                                isActive ? { color: '#fff', fontWeight: 'bold' } : { color: '#666' }
                                            ]}>
                                                {item === 'All' ? 'Tất cả' : item}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        </View>

                        {/* Video List */}
                        <FlatList
                            data={filteredVideos}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item, index }) => (
                                <VideoCard
                                    item={item}
                                    index={index}
                                    theme={theme}
                                    onPress={() => handlePressVideo(item)}
                                />
                            )}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <MaterialCommunityIcons name={searchQuery ? "file-search-outline" : "folder-search-outline"} size={60} color="#ccc" />
                                    <Text style={{ color: '#888', marginTop: 10, textAlign: 'center' }}>
                                        {searchQuery
                                            ? `Không tìm thấy video nào khớp với\n"${searchQuery}"`
                                            : "Không có video nào thuộc chủ đề này."}
                                    </Text>
                                </View>
                            }
                        />
                    </>
                )}
            </View>
        </View>
    );
};

export default LearnByLevelScreen;

// --- 5. Styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    headerContainer: {
        paddingTop: 50,
        paddingBottom: 30, // Đã điều chỉnh để thoáng hơn
        paddingHorizontal: 20,
        borderBottomRightRadius: 25,
        borderBottomLeftRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        position: 'relative',
        overflow: 'hidden',
        zIndex: 10,
    },
    backButton: {
        marginRight: 15,
        padding: 5,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
    },
    headerDecor: {
        position: 'absolute',
        right: 20,
        bottom: -10,
        transform: [{ rotate: '-15deg' }],
    },
    bodyContainer: {
        flex: 1,
        marginTop: 0, // Đã sửa về 0 để tránh đè header
    },

    // --- SEARCH STYLES ---
    searchContainer: {
        paddingHorizontal: 20,
        marginTop: 20, // Khoảng cách chuẩn với Header
        marginBottom: 15,
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 15,
        paddingHorizontal: 15,
        height: 50,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        height: '100%',
    },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
        paddingHorizontal: 40,
    },
    filterContainer: {
        height: 50,
        marginBottom: 5,
    },
    filterChip: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterText: {
        fontSize: 14,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    cardContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 15,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        alignItems: 'center',
    },
    thumbnailWrapper: {
        position: 'relative',
        marginRight: 12,
    },
    thumbnail: {
        width: 100,
        height: 75,
        borderRadius: 12,
        backgroundColor: '#eee',
    },
    playOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 12,
    },
    cardContent: {
        flex: 1,
        justifyContent: 'space-between',
        height: 75,
        paddingVertical: 2,
    },
    topicTag: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        marginBottom: 4,
    },
    topicText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    videoTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        lineHeight: 20,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    durationText: {
        fontSize: 12,
        color: '#888',
    },
    actionButton: {
        paddingLeft: 5,
    },
});
