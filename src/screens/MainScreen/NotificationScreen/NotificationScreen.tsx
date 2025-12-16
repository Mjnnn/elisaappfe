import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, Image, TouchableOpacity,
    Dimensions, RefreshControl, StatusBar, Alert, Platform // <--- 1. Thêm Platform
} from 'react-native';
// Bỏ SafeAreaView ở đây hoặc không dùng nó làm thẻ bao ngoài
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- IMPORT SERVICE ---
import notificationService from '../../../services/notificationService';
import { NotificationResponse } from '../../../types/response/NotificationResponse';

const { width } = Dimensions.get('window');

// --- COMPONENT CON: Notification Item ---
const NotificationCard = ({ item, index, onPress }: { item: NotificationResponse, index: number, onPress: (id: number) => void }) => {
    const isUnread = Number(item.isRead) === 0;
    const isLevelUp = item.type === 'level';

    let iconBgColor = '#F3F4F6';
    let iconName: any = 'notifications';
    let iconColor = '#6B7280';

    if (item.type === 'welcome') {
        iconBgColor = '#E0F2FE'; iconColor = '#0EA5E9'; iconName = 'party-popper';
    } else if (item.type === 'level') {
        iconBgColor = '#FEF3C7'; iconColor = '#D97706'; iconName = 'trophy-award';
    } else if (item.type === 'reminder') {
        iconBgColor = '#FEE2E2'; iconColor = '#EF4444'; iconName = 'bell-ring';
    }

    let timeAgo = '';
    try {
        timeAgo = formatDistanceToNow(new Date(item.sendTime), { addSuffix: true, locale: vi });
    } catch (e) {
        timeAgo = 'Vừa xong';
    }

    const CardContent = () => (
        <View style={[styles.cardContainer, isUnread && styles.unreadContainer]}>
            <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
                {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.iconImage} resizeMode="contain" />
                ) : (
                    <MaterialCommunityIcons name={iconName} size={24} color={iconColor} />
                )}
            </View>

            <View style={styles.textContainer}>
                <View style={styles.headerRow}>
                    <Text style={[styles.title, isUnread && styles.unreadText]} numberOfLines={1}>
                        {item.title}
                    </Text>
                    {isUnread && <View style={styles.redDot} />}
                </View>

                <Text style={[styles.content, !isUnread && styles.readContent]} numberOfLines={2}>
                    {item.content}
                </Text>

                <Text style={styles.timeText}>{timeAgo}</Text>
            </View>
        </View>
    );

    return (
        <Animatable.View
            animation="fadeInUp"
            duration={500}
            delay={index * 100}
            useNativeDriver
        >
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => onPress(item.notificationId)}
                style={{ marginHorizontal: 15, marginVertical: 6 }}
            >
                {isLevelUp && isUnread ? (
                    <LinearGradient
                        colors={['#FFFBEB', '#FFF']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={styles.gradientBorder}
                    >
                        <CardContent />
                    </LinearGradient>
                ) : (
                    <CardContent />
                )}
            </TouchableOpacity>
        </Animatable.View>
    );
};

// --- COMPONENT CHÍNH ---
const NotificationScreen = () => {
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        try {
            const userIdString = await AsyncStorage.getItem("userId");
            if (!userIdString) return;

            const response = await notificationService.getNotificationByUserId(Number(userIdString));

            if (response && response.data) {
                const sortedData = response.data.sort((a, b) =>
                    new Date(b.sendTime).getTime() - new Date(a.sendTime).getTime()
                );
                setNotifications(sortedData);
            }
        } catch (error) {
            console.log("Lỗi lấy thông báo:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const handleMarkAllRead = async () => {
        try {
            const userIdString = await AsyncStorage.getItem("userId");
            if (!userIdString) return;

            await notificationService.updateNotification(Number(userIdString));

            setNotifications(prev => prev.map(item => ({
                ...item,
                isRead: true
            })));

        } catch (error) {
            console.log("Lỗi đánh dấu đã đọc:", error);
            Alert.alert("Lỗi", "Không thể cập nhật trạng thái.");
        }
    };

    const handlePressItem = (id: number) => {
        // Logic xử lý khi ấn vào item (nếu có)
    };

    const renderEmpty = () => (
        !loading && (
            <View style={styles.emptyContainer}>
                <Image
                    source={{ uri: 'https://img.icons8.com/clouds/200/mailbox-closed-flag-down.png' }}
                    style={{ width: 150, height: 150, marginBottom: 20 }}
                />
                <Text style={styles.emptyText}>Bạn chưa có thông báo nào</Text>
                <Text style={styles.emptySubText}>Hãy quay lại sau nhé!</Text>
            </View>
        )
    );

    return (
        // 2. Thay SafeAreaView bằng View thường để tràn lên Status Bar
        <View style={styles.container}>

            {/* 3. Cấu hình StatusBar trong suốt */}
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

            {/* Header Gradient */}
            <LinearGradient
                colors={['#2DD4BF', '#0F766E']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>Thông báo</Text>
                        <Text style={styles.headerSubtitle}>
                            Bạn có {notifications.filter(n => Number(n.isRead) === 0).length} tin chưa đọc
                        </Text>
                    </View>
                    {notifications.length > 0 && (
                        <TouchableOpacity style={styles.readAllBtn} onPress={handleMarkAllRead}>
                            <Ionicons name="checkmark-done-circle" size={20} color="white" />
                            <Text style={styles.readAllText}>Đọc tất cả</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>

            <View style={styles.body}>
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.notificationId.toString()}
                    renderItem={({ item, index }) => (
                        <NotificationCard item={item} index={index} onPress={handlePressItem} />
                    )}
                    contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
                    }
                    ListEmptyComponent={renderEmpty}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },

    // Header Styles
    header: {
        // 4. Padding Top động: Android cộng thêm StatusBar, iOS để 60px để tránh tai thỏ
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 30) + 20 : 60,
        paddingBottom: 25,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 5,
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    headerTitle: { fontSize: 26, fontWeight: 'bold', color: 'white' },
    headerSubtitle: { fontSize: 14, color: '#DBEAFE', marginTop: 5 },
    readAllBtn: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignItems: 'center'
    },
    readAllText: { color: 'white', fontSize: 12, fontWeight: '600', marginLeft: 4 },

    // Body
    body: { flex: 1, marginTop: -10 },

    // Card Styles
    gradientBorder: {
        borderRadius: 16,
        padding: 1.5,
        elevation: 2,
    },
    cardContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
        borderWidth: 1,
        borderColor: 'transparent'
    },
    unreadContainer: {
        backgroundColor: '#FFFFFF',
        borderColor: '#EBF5FF',
        borderWidth: 1,
        shadowOpacity: 0.1,
        elevation: 4,
    },
    iconContainer: {
        width: 50, height: 50,
        borderRadius: 25,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 15,
    },
    iconImage: { width: 50, height: 50 },

    // Text Content
    textContainer: { flex: 1 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    title: { fontSize: 16, fontWeight: '600', color: '#374151', flex: 1 },
    unreadText: { color: '#111827', fontWeight: 'bold' },
    content: { fontSize: 14, color: '#4B5563', lineHeight: 20, marginBottom: 6 },
    readContent: { color: '#9CA3AF' },
    timeText: { fontSize: 12, color: '#9CA3AF', fontStyle: 'italic' },

    // Indicators
    redDot: {
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: '#EF4444',
        marginLeft: 8
    },

    // Empty State
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { fontSize: 18, fontWeight: 'bold', color: '#374151' },
    emptySubText: { fontSize: 14, color: '#9CA3AF', marginTop: 5 },
});

export default NotificationScreen;