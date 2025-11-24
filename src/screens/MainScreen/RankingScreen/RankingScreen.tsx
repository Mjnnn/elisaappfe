import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, Image, Dimensions, Platform, StatusBar,
    ActivityIndicator, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native'; // <--- IMPORT QUAN TRỌNG
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

// --- SERVICES & TYPES ---
import userXPService from '../../../services/userXPService';
import { UserXPResponse } from '../../../types/response/UserXPResponse';

const { width } = Dimensions.get('window');
const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;

interface RankingUIItem extends UserXPResponse {
    position: number;
    displayName: string;
    displayAvatar: string;
    fullName?: string;
    avatarUrl?: string;
}

const RankingScreen = () => {
    const [rankingList, setRankingList] = useState<RankingUIItem[]>([]);
    const [currentUser, setCurrentUser] = useState<RankingUIItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const tabBarHeight = useBottomTabBarHeight();

    // State để ép Animation chạy lại mỗi lần focus
    const [animationKey, setAnimationKey] = useState(0);

    // --- 1. HÀM GỌI API ---
    const fetchRankingData = useCallback(async () => {
        try {
            const currentUserIdStr = await AsyncStorage.getItem("userId");
            const currentUserId = currentUserIdStr ? Number(currentUserIdStr) : null;

            const response = await userXPService.getRankingUserXP();

            if (response && response.data) {
                const data = response.data;

                const formattedData: RankingUIItem[] = data.map((item: any, index: number) => ({
                    ...item,
                    position: index + 1,
                    displayName: item.fullName || `Người dùng ${item.userId}`,
                    displayAvatar: item.avatarImage || `https://i.pravatar.cc/150?u=${item.userId}`,
                }));

                setRankingList(formattedData);

                if (currentUserId) {
                    const foundUser = formattedData.find(u => u.userId === currentUserId);
                    setCurrentUser(foundUser || null);
                }
            }
        } catch (error) {
            console.error("Lỗi lấy bảng xếp hạng:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // --- 2. SỬ DỤNG USE FOCUS EFFECT ---
    // Chạy mỗi khi màn hình được focus (người dùng ấn vào tab)
    useFocusEffect(
        useCallback(() => {
            setLoading(true); // Hiện loading để reset giao diện
            setAnimationKey(prev => prev + 1); // Tăng key để ép animation chạy lại
            fetchRankingData();
        }, [fetchRankingData])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchRankingData();
    };

    const topThree = rankingList.slice(0, 3);
    const restUsers = rankingList.slice(3);

    // --- COMPONENT: PODIUM (TOP 3) ---
    const renderPodium = () => {
        const first = topThree[0];
        const second = topThree[1];
        const third = topThree[2];

        const renderPlayer = (player: RankingUIItem | undefined, rank: number) => {
            if (!player) return <View style={[styles.podiumItem, { opacity: 0 }]} />;

            const isFirst = rank === 1;
            const size = isFirst ? 110 : 80;
            const borderColor = rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : '#CD7F32';

            return (
                <Animatable.View
                    // KEY QUAN TRỌNG: Thay đổi key sẽ buộc component unmount/mount lại -> chạy animation
                    key={`podium-${animationKey}-${rank}`}
                    animation="fadeInUp"
                    duration={800}
                    delay={rank * 200} // Delay để tạo hiệu ứng lên lần lượt
                    style={[styles.podiumItem, isFirst && { marginTop: -40 }]}
                >
                    {isFirst && (
                        <FontAwesome5 name="crown" size={24} color="#FFD700" style={{ marginBottom: -10, zIndex: 10 }} />
                    )}

                    <View style={[styles.avatarContainer, { width: size, height: size, borderColor: borderColor }]}>
                        <Image
                            source={{ uri: player.displayAvatar }}
                            style={styles.avatarImage}
                        />
                        {player.icon_url && (
                            <Image source={{ uri: player.icon_url }} style={styles.rankBadgeSmall} resizeMode="contain" />
                        )}

                        <View style={[styles.rankBadge, { backgroundColor: borderColor }]}>
                            <Text style={styles.rankText}>{rank}</Text>
                        </View>
                    </View>

                    <Text style={styles.podiumName} numberOfLines={1}>{player.displayName}</Text>
                    <Text style={styles.podiumXP}>{player.totalXP.toLocaleString()} XP</Text>
                    <Text style={styles.podiumTitle}>{player.title}</Text>
                </Animatable.View>
            );
        };

        return (
            <View style={styles.podiumContainer}>
                {renderPlayer(second, 2)}
                {renderPlayer(first, 1)}
                {renderPlayer(third, 3)}
            </View>
        );
    };

    // --- COMPONENT: LIST ITEM ---
    const renderItem = ({ item, index }: { item: RankingUIItem, index: number }) => {
        return (
            <Animatable.View
                // Thêm animation nhẹ cho list luôn nếu thích
                key={`list-${animationKey}-${item.userId}`}
                animation="fadeInUp"
                duration={600}
                delay={400 + (index * 100)} // Delay sau khi Podium hiện xong
            >
                <View style={styles.rankRow}>
                    <View style={styles.rankNumberContainer}>
                        <Text style={styles.rankNumberText}>{item.position}</Text>
                    </View>

                    <Image source={{ uri: item.displayAvatar }} style={styles.listAvatar} />

                    <View style={styles.userInfo}>
                        <Text style={styles.userName} numberOfLines={1}>{item.displayName}</Text>
                        <View style={styles.titleContainer}>
                            {item.icon_url && (
                                <Image source={{ uri: item.icon_url }} style={styles.miniRankIcon} resizeMode="contain" />
                            )}
                            <Text style={styles.userTitle}>{item.title}</Text>
                        </View>
                    </View>

                    <View style={styles.xpContainer}>
                        <Text style={styles.xpText}>{item.totalXP.toLocaleString()}</Text>
                        <Text style={styles.xpLabel}>XP</Text>
                    </View>
                </View>
            </Animatable.View>
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header Gradient */}
            <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                style={styles.headerGradient}
            >
                <Text style={styles.headerTitle}>Bảng Xếp Hạng</Text>
                <Text style={styles.headerSubtitle}>Top cao thủ tích cực nhất</Text>
            </LinearGradient>

            <View style={styles.bodyContainer}>
                {/* Phần Podium */}
                {rankingList.length > 0 && renderPodium()}

                {/* Phần List */}
                <View style={styles.listContainer}>
                    <FlatList
                        data={restUsers}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.userId.toString()}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                        ListEmptyComponent={
                            <Text style={{ textAlign: 'center', marginTop: 20, color: '#999' }}>
                                Chưa có dữ liệu xếp hạng.
                            </Text>
                        }
                    />
                </View>
            </View>

            {/* Footer: User hiện tại */}
            {currentUser && (
                <Animatable.View
                    animation="slideInUp"
                    duration={800}
                    key={`footer-${animationKey}`}
                    style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} // Animation cho footer luôn
                >
                    <LinearGradient colors={['#FFFFFF', '#F0F8FF']} style={styles.myRankContainer}>
                        <View style={[styles.rankNumberContainer, { backgroundColor: '#3B82F6' }]}>
                            <Text style={[styles.rankNumberText, { color: 'white' }]}>{currentUser.position}</Text>
                        </View>

                        <Image source={{ uri: currentUser.displayAvatar }} style={styles.listAvatar} />

                        <View style={styles.userInfo}>
                            <Text style={[styles.userName, { color: '#3B82F6' }]} numberOfLines={1}>
                                Bạn ({currentUser.displayName})
                            </Text>
                            <View style={styles.titleContainer}>
                                {currentUser.icon_url && (
                                    <Image source={{ uri: currentUser.icon_url }} style={styles.miniRankIcon} resizeMode="contain" />
                                )}
                                <Text style={styles.userTitle}>{currentUser.title}</Text>
                            </View>
                        </View>

                        <View style={styles.xpContainer}>
                            <Text style={[styles.xpText, { color: '#3B82F6' }]}>
                                {currentUser.totalXP.toLocaleString()}
                            </Text>
                            <Text style={styles.xpLabel}>XP</Text>
                        </View>
                    </LinearGradient>
                </Animatable.View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },

    // Header
    headerGradient: {
        paddingTop: Platform.OS === 'android'
            ? (StatusBar.currentHeight || 30) + 15
            : 50, paddingVertical: 20, paddingHorizontal: 20, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, paddingBottom: 60
    },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
    headerSubtitle: { fontSize: 14, color: '#E0E0E0', marginTop: 5 },

    bodyContainer: { flex: 1, marginTop: -20 },

    // Podium
    podiumContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', marginBottom: 20, paddingHorizontal: 10 },
    podiumItem: { alignItems: 'center', marginHorizontal: 10, width: width * 0.28 },
    avatarContainer: { borderRadius: 100, borderWidth: 3, padding: 2, position: 'relative', marginBottom: 8, backgroundColor: 'white', elevation: 5 },
    avatarImage: { width: '100%', height: '100%', borderRadius: 100 },
    rankBadge: { position: 'absolute', bottom: -10, width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', borderWidth: 2, borderColor: 'white' },
    rankBadgeSmall: { position: 'absolute', top: -15, right: -35, width: 70, height: 70 },
    rankText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    podiumName: { fontWeight: 'bold', fontSize: 14, color: '#333', marginBottom: 2 },
    podiumXP: { fontSize: 12, color: '#666', fontWeight: '600' },
    podiumTitle: { fontSize: 10, color: '#3B82F6', fontWeight: 'bold' },

    // List
    listContainer: { flex: 1, backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 20, paddingTop: 20, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1 },
    rankRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    rankNumberContainer: { width: 30, height: 30, justifyContent: 'center', alignItems: 'center', borderRadius: 15, backgroundColor: '#F3F4F6', marginRight: 15 },
    rankNumberText: { fontWeight: 'bold', color: '#666' },
    listAvatar: { width: 45, height: 45, borderRadius: 25, marginRight: 15 },
    userInfo: { flex: 1, paddingRight: 10 },
    userName: { fontWeight: 'bold', fontSize: 16, color: '#333' },
    titleContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    miniRankIcon: { width: 30, height: 30, marginRight: 5 },
    userTitle: { fontSize: 14, color: '#888' },
    xpContainer: { alignItems: 'flex-end' },
    xpText: { fontWeight: 'bold', fontSize: 16, color: '#FFD700' },
    xpLabel: { fontSize: 10, color: '#999' },

    // Footer (My Rank)
    myRankContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: '#E0E0E0', elevation: 20, paddingBottom: 10 },
});

export default RankingScreen;