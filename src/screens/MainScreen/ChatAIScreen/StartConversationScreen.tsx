import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    Dimensions, StatusBar, ActivityIndicator, ImageBackground
} from 'react-native';
// [UPDATE 1] Import expo-image
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

import conversationTopicsService from '../../../services/conversationTopicsService';
import { EnglishConversationTopicsResponse } from '../../../types/response/EnglishConversationTopicsResponse';

const { width, height } = Dimensions.get('window');

const THEME = {
    primary: '#6366F1',
    secondary: '#8B5CF6',
    white: '#FFFFFF',
    textDark: '#1E293B',
    textGray: '#64748B',
    accent: '#F43F5E'
};

// [UPDATE 2] Hàm tối ưu Cloudinary
const getOptimizedImageUrl = (url: string) => {
    if (!url || !url.includes('cloudinary.com')) return url;
    return url.replace('/upload/', '/upload/q_auto,f_auto,w_800/');
};

const StartConversationScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const insets = useSafeAreaInsets();

    const { topicId, levelCode } = route.params || { topicId: 1, levelCode: 'A1' };

    const [topic, setTopic] = useState<EnglishConversationTopicsResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopicDetail = async () => {
            try {
                const res = await conversationTopicsService.getTopicById(topicId)
                const foundTopic = res.data;

                // [UPDATE 3] Prefetch ngay khi có data để tăng tốc hiển thị
                if (foundTopic?.image) {
                    Image.prefetch(getOptimizedImageUrl(foundTopic.image));
                }

                setTopic(foundTopic || null);
            } catch (error) {
                console.error("Lỗi lấy chi tiết chủ đề:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTopicDetail();
    }, [topicId]);

    const handleStartChat = () => {
        console.log('Bắt đầu hội thoại với chủ đề:', topic?.titleEnglish);
        (navigation as any).navigate('ChatbotScreen', {
            topic: topic ? topic.titleEnglish : 'Conversation',
            levelCode: levelCode
        });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={THEME.primary} />
            </View>
        );
    }

    if (!topic) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Không tìm thấy chủ đề.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={{ color: THEME.primary, marginTop: 20 }}>Quay lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // URL ảnh đã tối ưu
    const optimizedImage = getOptimizedImageUrl(topic.image);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Background Image: Vẫn dùng ImageBackground của React Native vì nó hỗ trợ children tốt, 
                nhưng dùng URL tối ưu */}
            <ImageBackground
                source={{ uri: optimizedImage }}
                style={styles.backgroundImage}
                blurRadius={15}
            >
                <LinearGradient
                    colors={['rgba(99, 102, 241, 0.6)', 'rgba(30, 41, 59, 0.95)']}
                    style={styles.gradientOverlay}
                />
            </ImageBackground>

            {/* HEADER */}
            <View style={[styles.header, { marginTop: insets.top }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chuẩn bị hội thoại</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* MAIN CONTENT */}
            <View style={styles.contentContainer}>
                <Animatable.View
                    animation="pulse"
                    easing="ease-out"
                    iterationCount="infinite"
                    duration={3000}
                    style={styles.imageWrapper}
                >
                    <View style={styles.imageCircle}>
                        {/* [UPDATE 4] Dùng Expo Image cho ảnh chính */}
                        <Image
                            source={{ uri: optimizedImage }}
                            style={styles.mainImage}
                            contentFit="contain" // Expo dùng contentFit thay vì resizeMode
                            transition={500} // Hiệu ứng hiện ảnh mượt
                            cachePolicy="memory-disk" // Cache mạnh
                        />
                    </View>
                </Animatable.View>

                <Animatable.View animation="fadeInUp" delay={300} style={styles.titleWrapper}>
                    <Text style={styles.topicTitleEng}>{topic.titleEnglish}</Text>
                    <Text style={styles.topicTitleVi}>{topic.titleTopics}</Text>
                </Animatable.View>
            </View>

            {/* INFO CARD */}
            <Animatable.View
                animation="slideInUp"
                duration={500}
                style={[styles.infoCard, { paddingBottom: insets.bottom + 20 }]}
            >
                <View style={styles.indicator} />

                <View style={styles.infoList}>
                    {/* Level */}
                    <View style={styles.infoRow}>
                        <View style={[styles.iconBox, { backgroundColor: '#E0E7FF' }]}>
                            <MaterialCommunityIcons name="target" size={22} color={THEME.primary} />
                        </View>
                        <View style={styles.infoTextCol}>
                            <Text style={styles.infoLabel}>Cấp độ mục tiêu</Text>
                            <Text style={styles.infoValue}>{levelCode} - {getLevelLabel(levelCode)}</Text>
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.infoRow}>
                        <View style={[styles.iconBox, { backgroundColor: '#FCE7F3' }]}>
                            <MaterialCommunityIcons name="text-box-outline" size={22} color={THEME.accent} />
                        </View>
                        <View style={styles.infoTextCol}>
                            <Text style={styles.infoLabel}>Nội dung</Text>
                            <Text style={styles.infoDesc} numberOfLines={3}>{topic.description}</Text>
                        </View>
                    </View>

                    {/* AI Role */}
                    <View style={styles.infoRow}>
                        <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
                            <MaterialCommunityIcons name="robot-happy-outline" size={22} color="#10B981" />
                        </View>
                        <View style={styles.infoTextCol}>
                            <Text style={styles.infoLabel}>Trợ lý Elisa</Text>
                            <Text style={styles.infoDesc}>Sẽ đóng vai người bản xứ để trò chuyện cùng bạn.</Text>
                        </View>
                    </View>
                </View>

                <Animatable.View animation="pulse" iterationCount="infinite" duration={1500} style={{ width: '100%' }}>
                    <TouchableOpacity style={styles.startButton} onPress={handleStartChat}>
                        <LinearGradient
                            colors={[THEME.primary, THEME.secondary]}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={styles.gradientButton}
                        >
                            <Text style={styles.buttonText}>Bắt đầu hội thoại</Text>
                            <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 8 }} />
                        </LinearGradient>
                    </TouchableOpacity>
                </Animatable.View>
            </Animatable.View>
        </View>
    );
};

const getLevelLabel = (code: string) => {
    switch (code) {
        case 'A1': return 'Sơ cấp (Beginner)';
        case 'A2': return 'Cơ bản (Elementary)';
        case 'B1': return 'Trung cấp (Intermediate)';
        case 'B2': return 'Trên trung cấp';
        case 'C1': return 'Cao cấp (Advanced)';
        case 'C2': return 'Thành thạo (Proficient)';
        default: return code;
    }
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.primary },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' },

    backgroundImage: {
        position: 'absolute', width: width, height: height,
        top: 0, left: 0,
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
    },

    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, marginBottom: 10
    },
    backButton: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center'
    },
    headerTitle: {
        fontSize: 18, fontWeight: '600', color: 'white'
    },

    contentContainer: {
        flex: 1, alignItems: 'center', paddingTop: 20
    },
    imageWrapper: {
        marginBottom: 20,
        shadowColor: THEME.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 15
    },
    imageCircle: {
        width: width * 0.8,
        height: width * 0.6,
        // borderRadius: (width * 0.6) / 2,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center', alignItems: 'center',
        padding: 5
    },
    mainImage: {
        width: '95%', height: '95%'
    },
    titleWrapper: { alignItems: 'center', paddingHorizontal: 20 },
    topicTitleEng: {
        fontSize: 28, fontWeight: '800', color: 'white', textAlign: 'center', marginBottom: 8,
        textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4
    },
    topicTitleVi: {
        fontSize: 18, color: 'rgba(255,255,255,0.9)', fontWeight: '500', textAlign: 'center'
    },

    infoCard: {
        backgroundColor: 'white',
        borderTopLeftRadius: 35, borderTopRightRadius: 35,
        paddingHorizontal: 24, paddingTop: 15,
        minHeight: height * 0.42,
        alignItems: 'center'
    },
    indicator: {
        width: 50, height: 5, backgroundColor: '#E2E8F0', borderRadius: 3, marginBottom: 25
    },
    infoList: { width: '100%', marginBottom: 20 },
    infoRow: {
        flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20
    },
    iconBox: {
        width: 44, height: 44, borderRadius: 14,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 16
    },
    infoTextCol: { flex: 1, justifyContent: 'center', minHeight: 44 },
    infoLabel: {
        fontSize: 14, fontWeight: '700', color: THEME.textDark, marginBottom: 4
    },
    infoValue: {
        fontSize: 15, fontWeight: '600', color: THEME.primary
    },
    infoDesc: {
        fontSize: 14, color: THEME.textGray, lineHeight: 20
    },

    startButton: {
        width: '100%',
        borderRadius: 20,
        shadowColor: THEME.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5
    },
    gradientButton: {
        paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        borderRadius: 20
    },
    buttonText: {
        color: 'white', fontSize: 18, fontWeight: 'bold'
    }
});

export default StartConversationScreen;