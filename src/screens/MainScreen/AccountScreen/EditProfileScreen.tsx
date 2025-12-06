import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, Alert, KeyboardAvoidingView, Platform,
    Dimensions, ActivityIndicator, StatusBar, Pressable
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { format } from 'date-fns';

// --- IMPORT SERVICE ---
import userService from '../../../services/userService';

const { width } = Dimensions.get('window');

const EditProfileScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { userInitialData } = route.params || {};

    const [isLoading, setIsLoading] = useState(false);

    // --- REFS CHO INPUT (Để xử lý focus) ---
    const fullnameRef = useRef<TextInput>(null);
    const emailRef = useRef<TextInput>(null);

    // --- FORM STATE ---
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [gender, setGender] = useState('Other');
    const [dob, setDob] = useState(new Date());

    // --- VALIDATION STATE ---
    const [errors, setErrors] = useState<{ [key: string]: string | null }>({});

    // --- UI STATE ---
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [focusedInput, setFocusedInput] = useState<string | null>(null);

    // Load dữ liệu ban đầu
    useEffect(() => {
        if (userInitialData) {
            setFullname(userInitialData.fullname || '');
            setEmail(userInitialData.email || '');
            setGender(userInitialData.gender || 'Other');
            if (userInitialData.dateOfBirth) {
                setDob(new Date(userInitialData.dateOfBirth));
            }
        }
    }, [userInitialData]);

    // --- HÀM VALIDATION (Khi bấm Lưu) ---
    const validateForm = () => {
        let isValid = true;
        let newErrors: { [key: string]: string | null } = {};

        // 1. Validate Tên
        if (!fullname.trim()) {
            newErrors.fullname = "Họ tên không được để trống dữ liệu";
            isValid = false;
        } else if (fullname.trim().length <= 3) {
            newErrors.fullname = "Họ tên phải dài hơn 3 ký tự";
            isValid = false;
        }

        // 2. Validate Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) {
            newErrors.email = "Email không được để trống dữ liệu";
            isValid = false;
        } else if (!emailRegex.test(email)) {
            newErrors.email = "Định dạng email không hợp lệ";
            isValid = false;
        }

        // 3. Validate Ngày sinh
        const today = new Date();
        const birthDate = new Date(dob);

        if (birthDate > today) {
            newErrors.dob = "Ngày sinh không được ở tương lai";
            isValid = false;
        } else {
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            if (age < 3) {
                newErrors.dob = "Người dùng phải trên 3 tuổi";
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    // --- HÀM XỬ LÝ BLUR (Khi rời khỏi ô input) ---
    const handleBlur = (key: string) => {
        setFocusedInput(null); // Tắt trạng thái focus

        let currentValue = '';
        if (key === 'fullname') currentValue = fullname;
        if (key === 'email') currentValue = email;

        // Kiểm tra logic để trống ngay lập tức
        if (!currentValue.trim()) {
            const label = key === 'fullname' ? 'Họ tên' : 'Email';
            setErrors(prev => ({
                ...prev,
                [key]: `${label} không được để trống dữ liệu`
            }));
        }
    };

    // Khi người dùng nhập liệu, xóa lỗi của trường đó đi
    const handleInputChange = (key: string, value: any) => {
        // Nếu đang có lỗi thì xóa lỗi đi để người dùng nhập lại
        if (errors[key]) {
            setErrors(prev => ({ ...prev, [key]: null }));
        }

        if (key === 'fullname') setFullname(value);
        if (key === 'email') setEmail(value);
        if (key === 'dob') setDob(value);
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            const updateData = {
                userId: userInitialData.userId,
                fullName: fullname,
                email: email,
                gender: gender,
                dateOfBirth: dob.toISOString()
            };

            await userService.updateProfile(updateData);

            Alert.alert("Thành công", "Hồ sơ đã được cập nhật!", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert("Lỗi", "Không thể cập nhật hồ sơ lúc này.");
        } finally {
            setIsLoading(false);
        }
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            handleInputChange('dob', selectedDate);
        }
    };

    // --- COMPONENT CON: INPUT FIELD ---
    const renderInput = (icon: any, placeholder: string, value: string, setValue: (text: string) => void, key: string, isEmail = false) => {
        const isFocused = focusedInput === key;
        const errorMsg = errors[key];

        // Xác định ref tương ứng
        const currentRef = key === 'fullname' ? fullnameRef : (key === 'email' ? emailRef : null);

        return (
            <Animatable.View animation="fadeInUp" delay={200} style={styles.inputContainer}>
                <Text style={styles.label}>
                    {placeholder} <Text style={{ color: '#EF4444' }}>*</Text>
                </Text>

                {/* Thay View bằng Pressable để bắt sự kiện tap vào toàn bộ khung */}
                <Pressable
                    onPress={() => {
                        // Khi bấm vào khung, tự động focus vào input bên trong
                        if (!isEmail && currentRef?.current) {
                            currentRef.current.focus();
                        }
                    }}
                    style={[
                        styles.inputWrapper,
                        isFocused && styles.inputWrapperFocused,
                        errorMsg ? styles.inputWrapperError : null,
                        isEmail && styles.inputWrapperDisabled
                    ]}
                >
                    <View style={[
                        styles.iconBox,
                        isFocused && { backgroundColor: '#3B82F6' },
                        errorMsg ? { backgroundColor: '#FEE2E2' } : null
                    ]}>
                        <Ionicons
                            name={errorMsg ? "alert-circle" : icon}
                            size={20}
                            color={errorMsg ? '#EF4444' : (isFocused ? '#FFF' : '#94A3B8')}
                        />
                    </View>

                    <TextInput
                        ref={currentRef} // Gắn ref vào đây
                        style={styles.input}
                        value={value}
                        onChangeText={(text) => handleInputChange(key, text)}
                        onFocus={() => setFocusedInput(key)}
                        onBlur={() => handleBlur(key)}
                        placeholder={`Nhập ${placeholder}`}
                        placeholderTextColor="#CBD5E1"
                        editable={!isEmail}
                        keyboardType={key === 'email' ? 'email-address' : 'default'}
                    />

                    {/* Icon bút chì */}
                    {isFocused && !errorMsg && !isEmail && (
                        <Animatable.View animation="zoomIn" duration={300}>
                            <Ionicons name="pencil" size={16} color="#3B82F6" />
                        </Animatable.View>
                    )}
                </Pressable>

                {/* Hiển thị text lỗi */}
                {errorMsg && (
                    <Animatable.View animation="bounceInLeft" duration={500} style={styles.errorContainer}>
                        <MaterialCommunityIcons name="alert-circle-outline" size={14} color="#EF4444" />
                        <Text style={styles.errorText}>{errorMsg}</Text>
                    </Animatable.View>
                )}
            </Animatable.View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <LinearGradient
                colors={['#2563EB', '#3B82F6', '#60A5FA']}
                style={styles.headerBackground}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <Animatable.View animation="bounceIn" style={styles.avatarContainer}>
                        <View style={styles.avatarOuterRing}>
                            <MaterialCommunityIcons name="account-edit-outline" size={50} color="#3B82F6" />
                        </View>
                        <Text style={styles.instructionText}>Cập nhật thông tin cá nhân của bạn</Text>
                    </Animatable.View>

                    <View style={styles.formCard}>

                        {/* Full Name */}
                        {renderInput("person-outline", "Họ và tên", fullname, setFullname, "fullname")}

                        {/* Email */}
                        {renderInput("mail-outline", "Địa chỉ Email", email, setEmail, "email")}

                        {/* Date of Birth */}
                        <Animatable.View animation="fadeInUp" delay={300} style={styles.inputContainer}>
                            <Text style={styles.label}>Ngày sinh</Text>
                            <TouchableOpacity
                                onPress={() => setShowDatePicker(true)}
                                activeOpacity={0.8}
                                style={[
                                    styles.inputWrapper,
                                    styles.datePickerButton,
                                    errors.dob ? styles.inputWrapperError : null
                                ]}
                            >
                                <View style={[
                                    styles.iconBox,
                                    { backgroundColor: '#FCE7F3' },
                                    errors.dob ? { backgroundColor: '#FEE2E2' } : null
                                ]}>
                                    <Ionicons
                                        name={errors.dob ? "alert-circle" : "calendar-outline"}
                                        size={20}
                                        color={errors.dob ? '#EF4444' : '#EC4899'}
                                    />
                                </View>
                                <Text style={styles.dateText}>
                                    {format(dob, 'dd/MM/yyyy')}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color="#94A3B8" />
                            </TouchableOpacity>

                            {/* Lỗi Ngày sinh */}
                            {errors.dob && (
                                <Animatable.View animation="bounceInLeft" duration={500} style={styles.errorContainer}>
                                    <MaterialCommunityIcons name="alert-circle-outline" size={14} color="#EF4444" />
                                    <Text style={styles.errorText}>{errors.dob}</Text>
                                </Animatable.View>
                            )}
                        </Animatable.View>

                        {showDatePicker && (
                            <DateTimePicker
                                value={dob}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onDateChange}
                                maximumDate={new Date()}
                            />
                        )}

                        {/* Gender Selection */}
                        <Animatable.View animation="fadeInUp" delay={400} style={styles.inputContainer}>
                            <Text style={styles.label}>Giới tính</Text>
                            <View style={styles.genderContainer}>
                                {[
                                    { key: 'Male', label: 'Nam', icon: 'gender-male', color: '#3B82F6' },
                                    { key: 'Female', label: 'Nữ', icon: 'gender-female', color: '#EC4899' },
                                    { key: 'Other', label: 'Khác', icon: 'gender-transgender', color: '#8B5CF6' }
                                ].map((item, index) => {
                                    const isSelected = gender === item.key;
                                    return (
                                        <TouchableOpacity
                                            key={item.key}
                                            onPress={() => setGender(item.key)}
                                            style={[
                                                styles.genderCard,
                                                isSelected && { backgroundColor: item.color, borderColor: item.color, elevation: 8 }
                                            ]}
                                        >
                                            <MaterialCommunityIcons
                                                name={item.icon as any}
                                                size={24}
                                                color={isSelected ? 'white' : '#94A3B8'}
                                            />
                                            <Text style={[styles.genderText, isSelected && { color: 'white', fontWeight: 'bold' }]}>
                                                {item.label}
                                            </Text>
                                            {isSelected && (
                                                <View style={styles.checkMark}>
                                                    <Ionicons name="checkmark-circle" size={16} color="white" />
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    )
                                })}
                            </View>
                        </Animatable.View>

                    </View>

                    {/* Save Button */}
                    <Animatable.View animation="fadeInUp" delay={600} style={styles.footer}>
                        <TouchableOpacity onPress={handleSave} disabled={isLoading}>
                            <LinearGradient
                                colors={isLoading ? ['#94A3B8', '#CBD5E1'] : ['#2563EB', '#1D4ED8']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={styles.saveButton}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
                                        <Ionicons name="checkmark-circle-outline" size={20} color="white" style={{ marginLeft: 8 }} />
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animatable.View>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    headerBackground: {
        paddingTop: Platform.OS === 'android' ? 50 : 80,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    backButton: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },

    scrollContent: { paddingBottom: 40 },

    avatarContainer: { alignItems: 'center', marginTop: 20, marginBottom: 10 },
    avatarOuterRing: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#DBEAFE', marginBottom: 10 },
    instructionText: { color: '#64748B', fontSize: 14 },

    formCard: {
        backgroundColor: 'white', marginHorizontal: 20, marginTop: 10,
        borderRadius: 24, padding: 20,
        elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10
    },

    inputContainer: { marginBottom: 20 },
    label: { fontSize: 13, color: '#64748B', fontWeight: '600', marginBottom: 8, marginLeft: 4 },
    inputWrapper: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#F8FAFC', borderColor: '#E2E8F0',
        borderRadius: 16, paddingHorizontal: 12, paddingVertical: 4,
        height: 56,
        borderWidth: 1.5 // Tăng độ dày viền chút để rõ màu đỏ
    },

    inputWrapperFocused: {
        borderColor: '#3B82F6', backgroundColor: '#EFF6FF',
        shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8
    },
    inputWrapperError: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2',
    },
    inputWrapperDisabled: {
        backgroundColor: '#F1F5F9', borderColor: '#E2E8F0', opacity: 0.8
    },
    iconBox: {
        width: 36, height: 36, borderRadius: 10, backgroundColor: '#E2E8F0',
        justifyContent: 'center', alignItems: 'center', marginRight: 12
    },
    input: { flex: 1, fontSize: 16, color: '#1E293B', fontWeight: '500' },

    errorContainer: {
        marginTop: 6,
        marginLeft: 4,
        flexDirection: 'row',
        alignItems: 'center'
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 4
    },

    datePickerButton: { justifyContent: 'space-between' },
    dateText: { flex: 1, fontSize: 16, color: '#334155', fontWeight: '500' },

    genderContainer: { flexDirection: 'row', justifyContent: 'space-between' },
    genderCard: {
        width: (width - 80) / 3 - 5,
        height: 90,
        borderRadius: 16,
        borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC',
        justifyContent: 'center', alignItems: 'center',
        position: 'relative'
    },
    genderText: { marginTop: 8, fontSize: 13, color: '#64748B', fontWeight: '500' },
    checkMark: { position: 'absolute', top: 6, right: 6 },

    footer: { paddingHorizontal: 20, marginTop: 10 },
    saveButton: {
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        paddingVertical: 16, borderRadius: 20,
        elevation: 5, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8
    },
    saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});

export default EditProfileScreen;
