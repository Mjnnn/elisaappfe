import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useNavigation, useRoute } from '@react-navigation/native';

// --- IMPORT SERVICE ---
// Hãy đảm bảo đường dẫn import đúng với cấu trúc thư mục của bạn
import userService from '../../../services/userService';

// --- COMPONENT INPUT (Giữ nguyên như cũ) ---
const PasswordInput = ({
    label, value, onChangeText, onBlur, error, isSecure, toggleSecure, placeholder, delay
}: any) => {
    return (
        <Animatable.View animation="fadeInUp" delay={delay} style={styles.inputContainer}>
            <Text style={styles.label}>{label}</Text>
            <View style={[styles.inputWrapper, error ? styles.inputErrorBorder : null]}>
                <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={{ marginRight: 10 }} />
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    placeholderTextColor="#CBD5E1"
                    secureTextEntry={isSecure}
                />
                <TouchableOpacity onPress={toggleSecure} style={styles.eyeIcon}>
                    <Ionicons name={isSecure ? "eye-off-outline" : "eye-outline"} size={22} color="#64748B" />
                </TouchableOpacity>
            </View>
            {error ? (
                <Animatable.Text animation="shake" duration={500} style={styles.errorText}>
                    {error}
                </Animatable.Text>
            ) : null}
        </Animatable.View>
    );
};

// --- MÀN HÌNH CHÍNH ---
const ChangePasswordScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();

    // Lấy email được truyền từ màn hình Account sang
    // @ts-ignore
    const { email } = route.params || { email: '' };

    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ currentPass: '', newPass: '', confirmPass: '' });
    const [secure, setSecure] = useState({ current: true, new: true, confirm: true });
    const [errors, setErrors] = useState({ currentPass: '', newPass: '', confirmPass: '' });
    const [touched, setTouched] = useState({ currentPass: false, newPass: false, confirmPass: false });

    // --- LOGIC VALIDATE (Giữ nguyên logic UX của bạn) ---
    const validateField = (field: string, value: string) => {
        let error = '';
        if (!value.trim()) {
            error = 'Không được để trống trường này';
        } else if (value.length <= 6) {
            error = 'Mật khẩu phải lớn hơn 6 ký tự';
        } else {
            if (field === 'confirmPass' && value !== form.newPass) {
                error = 'Mật khẩu nhập lại không khớp';
            }
            if (field === 'newPass' && form.confirmPass && value !== form.confirmPass) {
                setErrors(prev => ({ ...prev, confirmPass: 'Mật khẩu nhập lại không khớp' }));
            } else if (field === 'newPass' && value === form.confirmPass) {
                setErrors(prev => ({ ...prev, confirmPass: '' }));
            }
        }
        return error;
    };

    const handleChange = (field: string, value: string) => {
        setForm({ ...form, [field]: value });
        if (touched[field as keyof typeof touched]) {
            const error = validateField(field, value);
            setErrors(prev => ({ ...prev, [field]: error }));
        }
    };

    const handleBlur = (field: keyof typeof touched) => {
        setTouched({ ...touched, [field]: true });
        const error = validateField(field, form[field as keyof typeof form]);
        setErrors(prev => ({ ...prev, [field]: error }));
    };

    // --- GỌI API THỰC TẾ ---
    const handleSubmit = async () => {
        // 1. Validate Client Side
        const currentError = validateField('currentPass', form.currentPass);
        const newError = validateField('newPass', form.newPass);
        const confirmError = validateField('confirmPass', form.confirmPass);

        setTouched({ currentPass: true, newPass: true, confirmPass: true });
        setErrors({ currentPass: currentError, newPass: newError, confirmPass: confirmError });

        if (currentError || newError || confirmError) {
            Alert.alert("Thất bại", "Vui lòng kiểm tra lại thông tin nhập.");
            return;
        }

        if (!email) {
            Alert.alert("Lỗi hệ thống", "Không tìm thấy thông tin Email người dùng.");
            return;
        }

        // 2. Gọi API
        setLoading(true);
        try {
            const payload = {
                email: email,
                currentPassword: form.currentPass,
                newPassword: form.newPass
            };

            console.log("Calling API changePassword with:", payload);

            // Gọi service
            await userService.changePassword(payload);

            Alert.alert("Thành công", "Mật khẩu của bạn đã được cập nhật!", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);

        } catch (error: any) {
            console.log("Change pass error:", error);

            // Xử lý thông báo lỗi từ Server trả về
            let message = "Đã có lỗi xảy ra. Vui lòng thử lại.";

            if (error.response) {
                // Nếu server trả về status 400/401 thường là do sai mật khẩu cũ
                if (error.response.status === 400 || error.response.status === 401) {
                    message = "Mật khẩu hiện tại không chính xác.";
                    setErrors(prev => ({ ...prev, currentPass: "Mật khẩu không đúng" })); // Highlight lỗi ở ô input
                } else if (error.response.data && error.response.data.message) {
                    message = error.response.data.message;
                }
            }

            Alert.alert("Đổi mật khẩu thất bại", message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#F8FAFC', '#E2E8F0']}
                style={styles.gradientBackground}
            />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#334155" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Bảo mật</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <Animatable.View animation="bounceIn" duration={1500} style={styles.iconContainer}>
                        <View style={styles.iconCircle}>
                            <MaterialCommunityIcons name="shield-key" size={60} color="#3B82F6" />
                        </View>
                        <Text style={styles.title}>Đổi Mật Khẩu</Text>
                        <Text style={styles.subtitle}>Thiết lập mật khẩu mới an toàn hơn cho tài khoản {email}.</Text>
                    </Animatable.View>

                    <View style={styles.formContainer}>
                        <PasswordInput
                            label="Mật khẩu hiện tại"
                            value={form.currentPass}
                            onChangeText={(t: string) => handleChange('currentPass', t)}
                            onBlur={() => handleBlur('currentPass')}
                            error={errors.currentPass}
                            isSecure={secure.current}
                            toggleSecure={() => setSecure({ ...secure, current: !secure.current })}
                            placeholder="Nhập mật khẩu cũ..."
                            delay={300}
                        />

                        <PasswordInput
                            label="Mật khẩu mới"
                            value={form.newPass}
                            onChangeText={(t: string) => handleChange('newPass', t)}
                            onBlur={() => handleBlur('newPass')}
                            error={errors.newPass}
                            isSecure={secure.new}
                            toggleSecure={() => setSecure({ ...secure, new: !secure.new })}
                            placeholder="Ít nhất 7 ký tự..."
                            delay={400}
                        />

                        <PasswordInput
                            label="Nhập lại mật khẩu mới"
                            value={form.confirmPass}
                            onChangeText={(t: string) => handleChange('confirmPass', t)}
                            onBlur={() => handleBlur('confirmPass')}
                            error={errors.confirmPass}
                            isSecure={secure.confirm}
                            toggleSecure={() => setSecure({ ...secure, confirm: !secure.confirm })}
                            placeholder="Xác nhận mật khẩu mới..."
                            delay={500}
                        />
                    </View>

                    <Animatable.View animation="fadeInUp" delay={600} style={{ marginTop: 30 }}>
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={loading ? ['#94A3B8', '#CBD5E1'] : ['#3B82F6', '#2563EB']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={styles.submitButton}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.submitButtonText}>LƯU THAY ĐỔI</Text>
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
    container: { flex: 1 },
    gradientBackground: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 10 },
    backButton: { padding: 8, borderRadius: 12, backgroundColor: 'white', elevation: 2 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#334155' },
    scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
    iconContainer: { alignItems: 'center', marginTop: 20, marginBottom: 30 },
    iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center', marginBottom: 15, elevation: 5, shadowColor: '#3B82F6', shadowOpacity: 0.3, shadowRadius: 10 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
    subtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 5, width: '80%' },
    formContainer: { backgroundColor: 'white', borderRadius: 24, padding: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
    inputContainer: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8, marginLeft: 4 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, paddingHorizontal: 14, height: 54 },
    inputErrorBorder: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
    input: { flex: 1, fontSize: 16, color: '#1E293B' },
    eyeIcon: { padding: 8 },
    errorText: { color: '#EF4444', fontSize: 12, marginTop: 4, marginLeft: 4, fontWeight: '500' },
    submitButton: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#3B82F6', shadowOpacity: 0.4, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8 },
    submitButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
});

export default ChangePasswordScreen;