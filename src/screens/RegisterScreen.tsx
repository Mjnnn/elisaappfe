// src/screens/RegisterScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Alert // Dùng Alert cho thông báo lỗi
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import foxImage from '../../assets/images/logo/Elisa.png';

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>(''); // ✨ INPUT MỚI
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false); // ✨ STATE MỚI

  const handleRegister = () => {
    // 1. Kiểm tra điền đầy đủ thông tin
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Lỗi Đăng ký', 'Vui lòng điền đầy đủ tất cả các thông tin.');
      return;
    }

    // 2. Kiểm tra Mật khẩu và Xác nhận Mật khẩu
    if (password !== confirmPassword) {
      Alert.alert('Lỗi Mật khẩu', 'Mật khẩu và Xác nhận Mật khẩu không khớp nhau.');
      return;
    }

    // TODO: Triển khai logic gửi dữ liệu lên API
    console.log('Họ và Tên:', fullName);
    console.log('Email:', email);
    console.log('Mật khẩu:', password);

    // Xử lý thành công
    Alert.alert('Thành công', 'Đăng ký tài khoản thành công!');
    navigation.navigate('CourseSelection');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {/* Header Bar */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="close" size={28} color="#4B4B4B" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Đăng ký</Text>
            <View style={{ width: 50 }} />
          </View>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={foxImage}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Form Đăng ký */}
          <View style={styles.formContainer}>
            {/* Input Họ và Tên */}
            <TextInput
              style={styles.input}
              placeholder="Họ và Tên"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              keyboardType="default"
              placeholderTextColor="#AFAFAF"
            />

            {/* Input Email */}
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#AFAFAF"
            />

            {/* Input Mật khẩu */}
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Mật khẩu"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                placeholderTextColor="#AFAFAF"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.passwordVisibilityToggle}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={24}
                  color="#AFAFAF"
                />
              </TouchableOpacity>
            </View>

            {/* ✨ INPUT XÁC NHẬN MẬT KHẨU MỚI */}
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Xác nhận Mật khẩu"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword} // Sử dụng state riêng
                autoCapitalize="none"
                placeholderTextColor="#AFAFAF"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.passwordVisibilityToggle}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={24}
                  color="#AFAFAF"
                />
              </TouchableOpacity>
            </View>

            {/* Nút Đăng ký */}
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              activeOpacity={0.8}
            >
              <Text style={styles.registerButtonText}>ĐĂNG KÝ</Text>
            </TouchableOpacity>

            {/* Tùy chọn: đã có tài khoản? */}
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Đã có tài khoản? <Text style={styles.loginLinkHighlight}>Đăng nhập ngay</Text></Text>
            </TouchableOpacity>
          </View>

          <View style={styles.socialLoginContainer}>
            <Text style={styles.orText}>Hoặc đăng ký bằng</Text>

            {/* Nút Đăng ký bằng Facebook */}
            <TouchableOpacity style={[styles.socialButton, styles.facebookButton]}>
              <Ionicons name="logo-facebook" size={20} color="white" style={styles.socialIcon} />
              <Text style={styles.socialButtonText}>FACEBOOK</Text>
            </TouchableOpacity>

            {/* Nút Đăng ký bằng Google */}
            <TouchableOpacity style={[styles.socialButton, styles.googleButton]}>
              <Ionicons name="logo-google" size={20} color="white" style={styles.socialIcon} />
              <Text style={styles.socialButtonText}>GOOGLE</Text>
            </TouchableOpacity>
          </View>

          {/* Điều khoản và chính sách */}
          <Text style={styles.termsText}>
            Khi đăng ký trên Elisa, bạn đã đồng ý với Các chính sách và
            <Text style={styles.termsHighlight}> Chính sách bảo mật </Text>
            của chúng tôi.
          </Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },

  // Logo
  logoContainer: {
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 20,
  },
  logo: {
    width: 300,
    height: 200,
  },

  // Form Input
  formContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 15, // Giảm margin để phù hợp với 2 trường mật khẩu
    paddingHorizontal: 15,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  passwordVisibilityToggle: {
    paddingLeft: 10,
  },

  // Register Button (Màu giống nút Đăng nhập)
  registerButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 5, // Tăng nhẹ margin trên để tách khỏi input cuối
    marginBottom: 15,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Already have account? Login link
  loginLink: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  loginLinkHighlight: {
    color: '#5C7AFF',
    fontWeight: 'bold',
  },

  // Social Login
  socialLoginContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  orText: {
    textAlign: 'center',
    color: '#AFAFAF',
    fontSize: 15,
    marginBottom: 20,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  socialIcon: {
    marginRight: 10,
  },
  socialButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  facebookButton: {
    backgroundColor: '#4267B2',
  },
  googleButton: {
    backgroundColor: '#DB4437',
  },

  // Terms and Conditions
  termsText: {
    fontSize: 13,
    color: '#AFAFAF',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 18,
  },
  termsHighlight: {
    color: '#4B4B4B',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;