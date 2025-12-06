import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, Image, TouchableOpacity,
    ScrollView, Alert, StatusBar, Dimensions, ActivityIndicator, Platform,
    Animated, Modal, Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { format } from 'date-fns';
import * as ImagePicker from 'expo-image-picker';
import { CommonActions } from '@react-navigation/native';

// --- IMPORT SERVICE (Giả lập hoặc giữ nguyên import của bạn) ---
import userService from '../../../services/userService';
import userXPService from '../../../services/userXPService';

const { width, height } = Dimensions.get('window');

// --- TYPE DEFINITION ---
interface UserProfile {
    userId: number;
    fullname: string;
    email: string;
    avatarUrl: string | null;
    dateOfBirth: string | null;
    gender: string;
    joinDate: string | null;
    rankTitle?: string;
    rankIcon?: string;
    totalXP?: number;
}

// --- COMPONENT CON: SETTING ITEM ---
const SettingItem = ({ icon, title, subtitle, color = '#333', onPress, isDestructive = false, delay = 0 }: any) => (
    <Animatable.View animation="fadeInUp" delay={delay} duration={500}>
        <TouchableOpacity style={styles.settingItem} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.iconBox, { backgroundColor: isDestructive ? '#FEE2E2' : '#F0F9FF' }]}>
                <Ionicons name={icon} size={20} color={isDestructive ? '#EF4444' : '#3B82F6'} />
            </View>
            <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, isDestructive && { color: '#EF4444' }]}>{title}</Text>
                {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
        </TouchableOpacity>
    </Animatable.View>
);

// --- COMPONENT CON: STAT BADGE ---
const StatBadge = ({ icon, label, value, color, delay }: any) => (
    <Animatable.View animation="zoomIn" delay={delay} style={styles.statBadgeContainer}>
        <View style={[styles.statIconBubble, { backgroundColor: color + '15' }]}>
            <MaterialCommunityIcons name={icon} size={24} color={color} />
        </View>
        <View>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>{value}</Text>
        </View>
    </Animatable.View>
);


// --- COMPONENT CHÍNH ---
const AccountScreen = () => {
    const navigation = useNavigation<any>();
    const [userInfo, setUserInfo] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // State cho Modal trợ giúp & Modal Về Elisa
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [showAboutModal, setShowAboutModal] = useState(false); // <--- MỚI THÊM

    // Animation cho thanh XP
    const xpProgressAnim = useRef(new Animated.Value(0)).current;

    // --- FETCH DATA ---
    const fetchUserData = async () => {
        if (!userInfo) setLoading(true);

        try {
            const userIdString = await AsyncStorage.getItem("userId");
            if (!userIdString) { setLoading(false); return; }
            const userId = Number(userIdString);

            // Giả lập gọi API nếu service chưa chạy, bạn cứ giữ nguyên logic của bạn
            const [userResponse, xpResponse] = await Promise.all([
                userService.getUserById(userId),
                userXPService.getUserXPByUserId(userId)
            ]);

            const userData = userResponse.data;
            const xpData = xpResponse.data;

            setUserInfo({
                userId: userData.userId,
                fullname: userData.fullName || "Người dùng Elisa",
                email: userData.email || "Chưa cập nhật",
                avatarUrl: userData.avatarImage || null,
                dateOfBirth: userData.dateOfBirth,
                gender: userData.gender || "Other",
                joinDate: userData.joinDate,
                rankTitle: xpData.title || "Tân Thủ",
                rankIcon: xpData.icon_url || undefined,
                totalXP: xpData.totalXP || 0
            });

        } catch (error) {
            console.error("Lỗi lấy thông tin user:", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => { fetchUserData(); }, [])
    );

    useEffect(() => {
        if (userInfo) {
            xpProgressAnim.setValue(0);
            Animated.timing(xpProgressAnim, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: false,
            }).start();
        }
    }, [userInfo]);

    const widthInterpolate = xpProgressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    const formatDateDisplay = (dateString: string | null | undefined) => {
        if (!dateString) return "--/--/----";
        try { return format(new Date(dateString), 'dd/MM/yyyy'); } catch (e) { return dateString; }
    };

    // --- LOGIC HELPER ---
    const handleEmailSupport = () => {
        const email = 'elisa@gmail.com';
        Linking.openURL(`mailto:${email}`)
            .catch(() => Alert.alert("Thông báo", "Không thể mở ứng dụng mail. Vui lòng gửi tới: " + email));
    };

    // --- LOGIC UPLOAD ẢNH ---
    const uploadAvatarToServer = async (uri: string) => {
        if (!userInfo) return;
        try {
            setLoading(true);
            const formData = new FormData();
            const fileData = {
                uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
                name: `avatar_user_${userInfo.userId}.jpg`,
                type: 'image/jpeg',
            };
            formData.append('file', fileData as any);
            const response = await userService.updateAvatar(userInfo.userId, formData);
            const newAvatarUrl = response.data?.avatarUrl || uri;
            setUserInfo(prev => prev ? ({ ...prev, avatarUrl: newAvatarUrl }) : null);
            Alert.alert("Thành công", "Ảnh đại diện đã được cập nhật!");
        } catch (error) {
            console.error("Lỗi upload ảnh:", error);
            Alert.alert("Lỗi", "Không thể tải ảnh lên server.");
        } finally {
            setLoading(false);
        }
    };

    const verifyPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh.');
            return false;
        }
        return true;
    };
    const verifyCameraPermissions = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập máy ảnh.');
            return false;
        }
        return true;
    };
    const pickImage = async () => {
        const hasPermission = await verifyPermissions();
        if (!hasPermission) return;
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, aspect: [1, 1], quality: 0.8,
        });
        if (!result.canceled) uploadAvatarToServer(result.assets[0].uri);
    };
    const takePhoto = async () => {
        const hasPermission = await verifyCameraPermissions();
        if (!hasPermission) return;
        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true, aspect: [1, 1], quality: 0.8,
        });
        if (!result.canceled) uploadAvatarToServer(result.assets[0].uri);
    };
    const handleEditAvatar = () => {
        Alert.alert("Cập nhật ảnh đại diện", "Chọn nguồn ảnh",
            [{ text: "Hủy", style: "cancel" }, { text: "Chụp ảnh mới", onPress: takePhoto }, { text: "Chọn từ thư viện", onPress: pickImage }],
            { cancelable: true }
        );
    };

    const handleLogout = () => {
        Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn thoát?", [
            { text: "Ở lại", style: "cancel" },
            {
                text: "Đăng xuất", style: "destructive", onPress: async () => {
                    await AsyncStorage.clear();
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: 'Login' }], // Đảm bảo tên 'Login' đúng y hệt trong App.tsx
                        })
                    );
                }
            }
        ]);
    };

    if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#3B82F6" /></View>;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                {/* === HERO HEADER SECTION === */}
                <View style={styles.heroContainer}>
                    <LinearGradient
                        colors={['#3B82F6', '#2563EB']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={styles.heroGradient}
                    >
                        <MaterialCommunityIcons name="trophy-outline" size={180} color="white" style={{ position: 'absolute', right: -40, top: 20, opacity: 0.1 }} />

                        <Animatable.Text animation="bounceInDown" delay={200} style={styles.rankTitleHuge}>
                            {userInfo?.rankTitle?.toUpperCase()}
                        </Animatable.Text>

                        {/* Avatar Wrapper */}
                        <Animatable.View animation="zoomIn" delay={400} style={styles.avatarHeroWrapper}>
                            <View style={styles.avatarGlowRing}>
                                <Image
                                    source={{ uri: userInfo?.avatarUrl || 'https://i.pravatar.cc/300?img=68' }}
                                    style={styles.avatarHeroImage}
                                />
                            </View>
                            {userInfo?.rankIcon && (
                                <Animatable.Image
                                    animation="pulse" easing="ease-out" iterationCount="infinite" duration={2000}
                                    source={{ uri: userInfo.rankIcon }}
                                    style={styles.rankHeroIcon}
                                    resizeMode="contain"
                                />
                            )}
                            <TouchableOpacity style={styles.cameraHeroBtn} onPress={handleEditAvatar}>
                                <Ionicons name="camera" size={16} color="#FFF" />
                            </TouchableOpacity>
                        </Animatable.View>

                        <Animatable.View animation="fadeInUp" delay={600} style={{ alignItems: 'center', marginTop: 5 }}>
                            <Text style={styles.heroFullName}>{userInfo?.fullname}</Text>
                            <Text style={styles.heroEmail}>{userInfo?.email}</Text>
                        </Animatable.View>

                        {/* === XP PROGRESS BAR === */}
                        <Animatable.View style={styles.xpProgressContainer}>
                            <Animated.View style={[styles.xpProgressBarFill, { width: widthInterpolate }]}>
                                <LinearGradient colors={['#FFD700', '#FFA500']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={{ flex: 1 }} />
                            </Animated.View>
                            <View style={styles.xpTextOverlay}>
                                <Text style={styles.xpProgressText}>TỔNG TÍCH LŨY: {userInfo?.totalXP?.toLocaleString()} XP</Text>
                            </View>
                            <Animatable.View animation="flash" iterationCount="infinite" duration={3000} style={styles.xpShineEffect} />
                        </Animatable.View>

                    </LinearGradient>
                </View>

                {/* === BODY CONTENT === */}
                <View style={styles.bodyContainer}>

                    <Animatable.View animation="fadeIn" delay={1000} style={styles.joinDateContainer}>
                        <Ionicons name="shield-checkmark-outline" size={14} color="#64748B" />
                        <Text style={styles.joinDateText}> Thành viên từ: {formatDateDisplay(userInfo?.joinDate)}</Text>
                    </Animatable.View>

                    <View style={styles.statsCardContainer}>
                        <StatBadge icon="cake-variant" label="Sinh nhật" value={formatDateDisplay(userInfo?.dateOfBirth)} color="#EC4899" delay={1100} />
                        <View style={styles.statsDivider} />
                        <StatBadge icon={userInfo?.gender?.toLowerCase().includes('male') ? 'gender-male' : 'gender-female'} label="Giới tính" value={userInfo?.gender?.toLowerCase() === 'male' ? 'Nam' : (userInfo?.gender === 'Female' ? 'Nữ' : 'Khác')} color={userInfo?.gender?.toLowerCase() === 'male' ? '#3B82F6' : '#F43F5E'} delay={1200} />
                    </View>

                    <Text style={styles.sectionTitle}>Cài đặt & Tiện ích</Text>
                    <View style={styles.menuGroup}>
                        <SettingItem icon="create-outline" title="Chỉnh sửa hồ sơ" onPress={() => navigation.navigate('EditProfileScreen', { userInitialData: userInfo })} delay={1300} />
                        <View style={styles.menuDivider} />
                        <SettingItem icon="key-outline" title="Đổi mật khẩu" onPress={() => navigation.navigate('ChangePasswordScreen', { email: userInfo?.email })} delay={1400} />
                    </View>

                    <Text style={styles.sectionTitle}>Hỗ trợ</Text>
                    <View style={styles.menuGroup}>
                        <SettingItem
                            icon="help-circle-outline"
                            title="Trung tâm trợ giúp"
                            onPress={() => setShowHelpModal(true)}
                            delay={1500}
                        />
                        <View style={styles.menuDivider} />
                        {/* 1. Sửa onPress để mở Modal Về Elisa */}
                        <SettingItem
                            icon="information-circle-outline"
                            title="Về Elisa"
                            subtitle="Phiên bản 1.2.0 (Build 2025)"
                            onPress={() => setShowAboutModal(true)}
                            delay={1600}
                        />
                    </View>

                    <View style={[styles.menuGroup, { marginTop: 20, backgroundColor: '#FFF1F2' }]}>
                        <SettingItem icon="log-out-outline" title="Đăng xuất" isDestructive={true} onPress={handleLogout} delay={1700} />
                    </View>

                    <Text style={styles.footerText}>Elisa Learning Journey © 2025</Text>
                </View>
            </ScrollView>

            {/* === 2. MODAL TRUNG TÂM TRỢ GIÚP (GIỮ NGUYÊN) === */}
            <Modal
                visible={showHelpModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowHelpModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setShowHelpModal(false)} />
                    <Animatable.View animation="zoomIn" duration={400} style={styles.modalContent}>
                        <TouchableOpacity style={styles.closeModalButton} onPress={() => setShowHelpModal(false)}>
                            <Ionicons name="close" size={24} color="#94A3B8" />
                        </TouchableOpacity>
                        <View style={styles.modalIconContainer}>
                            <Animatable.View animation="pulse" easing="ease-out" iterationCount="infinite" duration={2000}>
                                <View style={styles.modalIconCircle}>
                                    <MaterialCommunityIcons name="face-agent" size={50} color="#FFF" />
                                </View>
                            </Animatable.View>
                        </View>
                        <Text style={styles.modalTitle}>Elisa Support</Text>
                        <Text style={styles.modalSubtitle}>Chúng tôi luôn sẵn sàng lắng nghe mọi thắc mắc và góp ý của bạn.</Text>
                        <View style={styles.modalContactBox}>
                            <Text style={styles.contactLabel}>Email liên hệ:</Text>
                            <TouchableOpacity style={styles.emailButton} onPress={handleEmailSupport}>
                                <MaterialCommunityIcons name="email-outline" size={20} color="#3B82F6" />
                                <Text style={styles.emailText}>elisa@gmail.com</Text>
                                <View style={styles.copyBadge}><Text style={styles.copyText}>GỬI NGAY</Text></View>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.closeButtonFull} onPress={() => setShowHelpModal(false)}>
                            <Text style={styles.closeButtonText}>Đã hiểu</Text>
                        </TouchableOpacity>
                    </Animatable.View>
                </View>
            </Modal>

            {/* === 3. MODAL "VỀ ELISA" (MỚI) === */}
            <Modal
                visible={showAboutModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowAboutModal(false)}
            >
                <View style={styles.modalOverlay}>
                    {/* Lớp nền mờ, ấn vào để đóng */}
                    <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setShowAboutModal(false)} />

                    <Animatable.View animation="fadeInUpBig" duration={500} style={styles.aboutModalContent}>

                        {/* Header Background */}
                        <LinearGradient colors={['#3B82F6', '#60A5FA']} style={styles.aboutHeaderBg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                            <TouchableOpacity style={styles.closeAboutBtn} onPress={() => setShowAboutModal(false)}>
                                <Ionicons name="close-circle" size={30} color="rgba(255,255,255,0.8)" />
                            </TouchableOpacity>
                            <Animatable.View animation="rubberBand" iterationCount="infinite" duration={5000} style={{ marginTop: 10 }}>
                                <MaterialCommunityIcons name="rocket-launch-outline" size={60} color="white" />
                            </Animatable.View>
                            <Text style={styles.aboutHeaderTitle}>Về Elisa</Text>
                        </LinearGradient>

                        <View style={styles.aboutBody}>
                            {/* Thông tin phiên bản - Card nổi */}
                            <Animatable.View animation="zoomIn" delay={200} style={styles.versionInfoCard}>
                                <View style={styles.versionRow}>
                                    <Text style={styles.versionLabel}>Ra mắt v1.0.0</Text>
                                    <Text style={styles.versionValue}>12/10/2025</Text>
                                </View>
                                <View style={styles.versionDivider} />
                                <View style={styles.versionRow}>
                                    <Text style={styles.versionLabel}>Phiên bản hiện tại</Text>
                                    <View style={styles.versionBadge}>
                                        <Text style={styles.versionBadgeText}>1.2.0 (Build 2025)</Text>
                                    </View>
                                </View>
                            </Animatable.View>

                            {/* Slogan */}
                            <Animatable.Text animation="fadeInUp" delay={400} style={styles.aboutSlogan}>
                                "Elisa – Đánh thức tiềm năng ngôn ngữ trong bạn!"
                            </Animatable.Text>

                            {/* Mô tả - Scrollable nếu quá dài */}
                            <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
                                <Animatable.Text animation="fadeInUp" delay={600} style={styles.aboutDescription}>
                                    Học tiếng Anh không còn là nỗi sợ hãi hay áp lực với Elisa. Chúng tôi tin rằng việc học ngôn ngữ nên là một trải nghiệm vui vẻ và đầy cảm hứng.
                                    {"\n\n"}
                                    Elisa không chỉ là một ứng dụng, đó là người bạn đồng hành giúp bạn tự tin giao tiếp, phá bỏ rào cản ngôn ngữ và khám phá thế giới.
                                    {"\n\n"}
                                    Với giao diện thân thiện và các bài học tương tác sinh động, bạn sẽ thấy trình độ của mình tiến bộ rõ rệt qua từng ngày mà không hề cảm thấy nhàm chán.
                                </Animatable.Text>
                            </ScrollView>

                            {/* Nút đóng */}
                            <TouchableOpacity style={styles.aboutFooterBtn} onPress={() => setShowAboutModal(false)}>
                                <Text style={styles.aboutFooterText}>Đóng</Text>
                            </TouchableOpacity>
                        </View>
                    </Animatable.View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F2F5' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F2F5' },

    // ... (Giữ nguyên các styles cũ của Hero và Body) ...
    heroContainer: { marginBottom: 20, overflow: 'hidden', borderBottomLeftRadius: 35, borderBottomRightRadius: 35, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10 },
    heroGradient: { width: '100%', paddingVertical: 40, paddingTop: Platform.OS === 'android' ? 60 : 60, alignItems: 'center', position: 'relative' },
    rankTitleHuge: { fontSize: 28, fontWeight: '900', color: '#FFD700', textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 5, letterSpacing: 1, marginBottom: 20, marginTop: 10 },
    avatarHeroWrapper: { position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    avatarGlowRing: { padding: 3, backgroundColor: '#FFD700', borderRadius: 75, elevation: 15, shadowColor: '#FFD700', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 20 },
    avatarHeroImage: { width: 130, height: 130, borderRadius: 65, borderWidth: 4, borderColor: '#FFF', backgroundColor: '#E2E8F0' },
    rankHeroIcon: { position: 'absolute', bottom: -15, right: -15, width: 70, height: 70, zIndex: 10 },
    cameraHeroBtn: { position: 'absolute', bottom: 5, left: 5, backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
    heroFullName: { fontSize: 22, fontWeight: 'bold', color: 'white', textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
    heroEmail: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
    xpProgressContainer: { marginTop: 15, width: '85%', height: 36, backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 18, padding: 3, position: 'relative', overflow: 'hidden', justifyContent: 'center' },
    xpProgressBarFill: { height: '100%', borderRadius: 15, overflow: 'hidden' },
    xpTextOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
    xpProgressText: { color: '#7B341E', fontWeight: 'bold', fontSize: 13, textShadowColor: 'rgba(255, 255, 255, 0.4)', textShadowRadius: 1 },
    xpShineEffect: { position: 'absolute', top: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.3)', transform: [{ skewX: '-20deg' }], width: 50, left: -50, zIndex: 5 },
    bodyContainer: { paddingHorizontal: 20, paddingBottom: 30 },
    joinDateContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20, backgroundColor: '#E2E8F0', alignSelf: 'center', paddingVertical: 6, paddingHorizontal: 15, borderRadius: 20 },
    joinDateText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
    statsCardContainer: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 24, paddingVertical: 20, paddingHorizontal: 15, justifyContent: 'space-between', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, marginBottom: 25 },
    statBadgeContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' },
    statIconBubble: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    statLabel: { fontSize: 12, color: '#94A3B8', marginBottom: 2 },
    statValue: { fontSize: 16, fontWeight: '700', color: '#334155' },
    statsDivider: { width: 1, height: '80%', backgroundColor: '#F1F5F9', alignSelf: 'center' },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: '#64748B', marginBottom: 10, marginLeft: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
    menuGroup: { backgroundColor: 'white', borderRadius: 20, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 5, marginBottom: 20 },
    settingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
    iconBox: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
    settingContent: { flex: 1 },
    settingTitle: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
    settingSubtitle: { fontSize: 12, color: '#94A3B8', marginTop: 1 },
    menuDivider: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 66 },
    footerText: { textAlign: 'center', color: '#94A3B8', fontSize: 12, marginTop: 10 },

    // === MODAL HELP STYLES ===
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 340,
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    closeModalButton: { position: 'absolute', top: 15, right: 15, padding: 5, zIndex: 10 },
    modalIconContainer: { marginBottom: 20, marginTop: 10, shadowColor: '#3B82F6', shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 10 },
    modalIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#DBEAFE' },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
    modalSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 24, paddingHorizontal: 10, lineHeight: 20 },
    modalContactBox: { width: '100%', backgroundColor: '#F1F5F9', borderRadius: 16, padding: 16, marginBottom: 24 },
    contactLabel: { fontSize: 12, color: '#94A3B8', marginBottom: 8, fontWeight: '600', textTransform: 'uppercase' },
    emailButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
    emailText: { flex: 1, fontSize: 15, fontWeight: '600', color: '#334155', marginLeft: 10 },
    copyBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    copyText: { fontSize: 10, color: '#3B82F6', fontWeight: 'bold' },
    closeButtonFull: { width: '100%', paddingVertical: 14, borderRadius: 14, backgroundColor: '#F8FAFC', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
    closeButtonText: { fontSize: 16, fontWeight: '600', color: '#64748B' },

    // === MODAL ABOUT STYLES (NEW) ===
    aboutModalContent: {
        width: '90%',
        maxWidth: 360,
        backgroundColor: 'white',
        borderRadius: 24,
        overflow: 'hidden', // Để bo tròn ảnh nền
        elevation: 20,
    },
    aboutHeaderBg: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 30,
        position: 'relative'
    },
    closeAboutBtn: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10
    },
    aboutHeaderTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 10,
        letterSpacing: 1
    },
    aboutBody: {
        padding: 24,
        alignItems: 'center'
    },
    versionInfoCard: {
        width: '100%',
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 15,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 20
    },
    versionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4
    },
    versionDivider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: 10
    },
    versionLabel: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500'
    },
    versionValue: {
        fontSize: 13,
        color: '#334155',
        fontWeight: 'bold'
    },
    versionBadge: {
        backgroundColor: '#DBEAFE',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8
    },
    versionBadgeText: {
        fontSize: 12,
        color: '#2563EB',
        fontWeight: '700'
    },
    aboutSlogan: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2563EB',
        textAlign: 'center',
        marginBottom: 16,
        fontStyle: 'italic'
    },
    aboutDescription: {
        fontSize: 14,
        color: '#475569',
        textAlign: 'justify',
        lineHeight: 22,
    },
    aboutFooterBtn: {
        marginTop: 20,
        backgroundColor: '#2563EB',
        paddingVertical: 12,
        width: '100%',
        alignItems: 'center',
        borderRadius: 12,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5
    },
    aboutFooterText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    }
});

export default AccountScreen;