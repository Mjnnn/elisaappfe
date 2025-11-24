import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, Image, TouchableOpacity,
    ScrollView, Alert, StatusBar, Dimensions, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { format, parseISO } from 'date-fns'; // Lưu ý: Cần import parseISO để xử lý chuỗi ngày an toàn

// --- IMPORT SERVICE ---
import userService from '../../../services/userService'; // Đảm bảo đường dẫn đúng

const { width } = Dimensions.get('window');

// --- 1. TYPE DEFINITION (State UI) ---
interface UserProfile {
    userId: number;
    fullname: string;
    email: string;
    avatarUrl: string | null;
    dateOfBirth: string | null;
    gender: string;
    joinDate: string | null;
}

// --- 2. COMPONENT CON: SETTING ITEM ---
const SettingItem = ({ icon, title, subtitle, color = '#333', onPress, isDestructive = false, delay = 0 }: any) => (
    <Animatable.View animation="fadeInUp" delay={delay} duration={500}>
        <TouchableOpacity
            style={styles.settingItem}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.iconBox, { backgroundColor: isDestructive ? '#FEE2E2' : '#F0F9FF' }]}>
                <Ionicons name={icon} size={22} color={isDestructive ? '#EF4444' : '#3B82F6'} />
            </View>
            <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, isDestructive && { color: '#EF4444' }]}>{title}</Text>
                {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
        </TouchableOpacity>
    </Animatable.View>
);

// --- 3. COMPONENT CON: INFO BADGE ---
const InfoBadge = ({ icon, label, value, color }: any) => (
    <View style={styles.infoBadge}>
        <View style={[styles.badgeIcon, { backgroundColor: color + '20' }]}>
            <MaterialCommunityIcons name={icon} size={20} color={color} />
        </View>
        <View>
            <Text style={styles.badgeLabel}>{label}</Text>
            <Text style={styles.badgeValue} numberOfLines={1}>{value}</Text>
        </View>
    </View>
);

// --- 4. COMPONENT CHÍNH ---
const AccountScreen = () => {
    const navigation = useNavigation<any>();
    const [userInfo, setUserInfo] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // --- HÀM GỌI API LẤY THÔNG TIN USER ---
    const fetchUserData = async () => {
        setLoading(true);
        try {
            // 1. Lấy UserId từ Storage
            const userIdString = await AsyncStorage.getItem("userId");
            if (!userIdString) {
                setLoading(false);
                return; // Hoặc điều hướng về Login
            }

            // 2. Gọi API UserService
            const response = await userService.getUserById(Number(userIdString));
            const data = response.data;

            // 3. Map dữ liệu từ API vào State
            // Lưu ý: Cần kiểm tra kỹ tên trường trả về từ API (Backend)
            setUserInfo({
                userId: data.userId || data.userId, // fallback case
                fullname: data.fullName || "Người dùng Elisa",
                email: data.email || "Chưa cập nhật",
                avatarUrl: data.avatarImage || null, // Map trường avatar_image
                dateOfBirth: data.dateOfBirth,     // Map trường date_of_birth
                gender: data.gender || "Other",
                joinDate: data.joinDate             // Map trường join_date
            });

        } catch (error) {
            console.error("Lỗi lấy thông tin user:", error);
            Alert.alert("Lỗi", "Không thể tải thông tin cá nhân.");
        } finally {
            setLoading(false);
        }
    };

    // Gọi lại mỗi khi màn hình được focus (để cập nhật nếu vừa sửa xong)
    useFocusEffect(
        useCallback(() => {
            fetchUserData();
        }, [])
    );

    // --- Logic Xử Lý Ngày Tháng ---
    const formatDateDisplay = (dateString: string | null | undefined) => {
        if (!dateString) return "--/--/----";
        try {
            // Nếu chuỗi là ISO (2003-05-20T...), dùng parseISO rồi format
            return format(new Date(dateString), 'dd/MM/yyyy');
        } catch (e) {
            return dateString; // Trả về nguyên gốc nếu lỗi format
        }
    };

    // --- Logic Đăng Xuất ---
    const handleLogout = () => {
        Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn thoát?", [
            { text: "Ở lại", style: "cancel" },
            {
                text: "Đăng xuất", style: "destructive",
                onPress: async () => {
                    try {
                        await AsyncStorage.clear();
                        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        ]);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>

                {/* === HEADER GRADIENT & AVATAR === */}
                <View style={styles.headerContainer}>
                    <LinearGradient
                        colors={['#2563EB', '#60A5FA']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={styles.headerGradient}
                    />
                    <Animatable.View animation="bounceIn" duration={1500} style={styles.avatarWrapper}>
                        <Image
                            // Nếu không có avatarUrl thì dùng ảnh placeholder
                            source={{ uri: userInfo?.avatarUrl || 'https://i.pravatar.cc/300?img=68' }}
                            style={styles.avatarImage}
                        />
                        <TouchableOpacity style={styles.cameraBtn}>
                            <Ionicons name="camera" size={18} color="white" />
                        </TouchableOpacity>
                    </Animatable.View>
                </View>

                {/* === BODY INFO === */}
                <View style={styles.bodyContainer}>
                    {/* Tên & Email */}
                    <Animatable.View animation="fadeInUp" delay={300} style={styles.nameSection}>
                        <Text style={styles.fullName}>{userInfo?.fullname}</Text>
                        <Text style={styles.email}>{userInfo?.email}</Text>

                        <View style={styles.joinDateBadge}>
                            <Ionicons name="time-outline" size={14} color="#64748B" />
                            <Text style={styles.joinDateText}>
                                Tham gia: {formatDateDisplay(userInfo?.joinDate)}
                            </Text>
                        </View>
                    </Animatable.View>

                    {/* Thẻ thông tin chi tiết (Ngày sinh, Giới tính) */}
                    <Animatable.View animation="fadeInUp" delay={500} style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <InfoBadge
                                icon="cake-variant"
                                label="Ngày sinh"
                                value={formatDateDisplay(userInfo?.dateOfBirth)}
                                color="#EC4899"
                            />
                            <View style={styles.verticalDivider} />
                            <InfoBadge
                                icon={
                                    userInfo?.gender?.toLowerCase() === 'male' || userInfo?.gender?.toLowerCase() === 'nam'
                                        ? 'gender-male'
                                        : 'gender-female'
                                }
                                label="Giới tính"
                                value={
                                    userInfo?.gender?.toLowerCase() === 'male' ? 'Nam'
                                        : userInfo?.gender?.toLowerCase() === 'female' ? 'Nữ'
                                            : 'Khác'
                                }
                                color={
                                    userInfo?.gender?.toLowerCase() === 'male' ? '#3B82F6' : '#F43F5E'
                                }
                            />
                        </View>
                    </Animatable.View>

                    {/* === MENU SETTINGS === */}
                    <Text style={styles.sectionTitle}>Cài đặt & Tiện ích</Text>

                    <View style={styles.settingsGroup}>
                        <SettingItem
                            icon="create-outline"
                            title="Chỉnh sửa thông tin"
                            onPress={() => Alert.alert("Thông báo", "Chức năng đang phát triển")}
                            delay={600}
                        />
                        <View style={styles.divider} />
                        <SettingItem
                            icon="key-outline"
                            title="Đổi mật khẩu"
                            onPress={() => Alert.alert("Thông báo", "Chức năng đang phát triển")}
                            delay={700}
                        />
                    </View>

                    <Text style={styles.sectionTitle}>Hỗ trợ</Text>
                    <View style={styles.settingsGroup}>
                        <SettingItem
                            icon="help-circle-outline"
                            title="Trợ giúp & Hỗ trợ"
                            onPress={() => Alert.alert("Hỗ trợ", "Liên hệ admin@elisa.com")}
                            delay={800}
                        />
                        <View style={styles.divider} />
                        <SettingItem
                            icon="information-circle-outline"
                            title="Về ứng dụng Elisa"
                            subtitle="Phiên bản 1.2.0"
                            onPress={() => Alert.alert("Elisa App", "Phiên bản 1.2.0 - Build 2025")}
                            delay={900}
                        />
                    </View>

                    <View style={[styles.settingsGroup, { marginTop: 20 }]}>
                        <SettingItem
                            icon="log-out-outline"
                            title="Đăng xuất"
                            isDestructive={true}
                            onPress={handleLogout}
                            delay={1000}
                        />
                    </View>

                    <Text style={styles.versionText}>Elisa App - Made with ❤️</Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },

    // Header
    headerContainer: { alignItems: 'center', marginBottom: 60 },
    headerGradient: {
        width: '100%', height: 180,
        borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
    },
    avatarWrapper: {
        position: 'absolute', top: 110, // Đè lên ranh giới header
        alignItems: 'center', justifyContent: 'center',
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 5
    },
    avatarImage: {
        width: 120, height: 120, borderRadius: 60,
        borderWidth: 4, borderColor: '#FFFFFF',
        backgroundColor: '#E2E8F0'
    },
    cameraBtn: {
        position: 'absolute', bottom: 0, right: 5,
        backgroundColor: '#3B82F6', padding: 8, borderRadius: 20,
        borderWidth: 2, borderColor: 'white', elevation: 2
    },

    // Body Content
    bodyContainer: { paddingHorizontal: 20 },

    // Name Section
    nameSection: { alignItems: 'center', marginBottom: 25 },
    fullName: { fontSize: 24, fontWeight: 'bold', color: '#1E293B', marginBottom: 4, textAlign: 'center' },
    email: { fontSize: 14, color: '#64748B', marginBottom: 10 },
    joinDateBadge: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#E2E8F0', paddingVertical: 4, paddingHorizontal: 12,
        borderRadius: 20,
    },
    joinDateText: { fontSize: 12, color: '#475569', marginLeft: 5, fontWeight: '500' },

    // Info Card
    infoCard: {
        backgroundColor: 'white', borderRadius: 20, padding: 20,
        flexDirection: 'row', justifyContent: 'space-between',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
        marginBottom: 25
    },
    infoRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
    infoBadge: { flexDirection: 'row', alignItems: 'center', width: '45%' },
    badgeIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    badgeLabel: { fontSize: 12, color: '#94A3B8' },
    badgeValue: { fontSize: 15, fontWeight: '600', color: '#334155' },
    verticalDivider: { width: 1, height: '100%', backgroundColor: '#F1F5F9' },

    // Settings Section
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 10, marginTop: 5, marginLeft: 5 },
    settingsGroup: {
        backgroundColor: 'white', borderRadius: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 5, elevation: 2,
        marginBottom: 15, overflow: 'hidden'
    },
    settingItem: {
        flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'white'
    },
    iconBox: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    settingContent: { flex: 1 },
    settingTitle: { fontSize: 15, fontWeight: '600', color: '#334155' },
    settingSubtitle: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 68 },

    versionText: { textAlign: 'center', color: '#CBD5E1', fontSize: 12, marginTop: 20, marginBottom: 10 },
});

export default AccountScreen;