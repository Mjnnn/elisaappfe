import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from 'react-native-toast-message';

import foxImage from '../../../assets/images/logo/Elisa.png';
import { AuthStackParamList } from '../../navigation/AuthStack';

// ✅ Import đúng authService (không phải userService)
import authService from '../../services/authService';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const COLOR_PRIMARY = '#3B82F6';
const COLOR_FACEBOOK = '#3b5998';
const COLOR_GOOGLE = '#DB4437';
const COLOR_TEXT = '#4B4B4B';
const COLOR_GRAY_BORDER = '#E5E5E5';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<LoginScreenNavigationProp>();

  // ⭐ Login API
  const handleLogin = async () => {
    if (!email || !password) {
      alert("Vui lòng nhập email và mật khẩu!");
      return;
    }

    try {
      setLoading(true);

      const response = await authService.login({
        email: email,
        password: password
      });

      const data = response.data;
      console.log("Login success:", data);

      // ✅ Lưu session
      await AsyncStorage.setItem("userId", String(data.userId));
      await AsyncStorage.setItem("email", data.email);
      await AsyncStorage.setItem("fullName", data.fullName);
      await AsyncStorage.setItem("role", data.role);

      Toast.show({
        type: 'success', // 👈 Loại thông báo có icon thành công

        // Tiêu đề lớn
        text1: '🎉 Đăng nhập thành công!',

        // Thời gian hiển thị (mili giây)
        visibilityTime: 1000,

        // Vị trí
        position: 'top',
        topOffset: 80,
      });

      if (data.role === 'USER') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'AppTabs' }],
        });
      } else if (data.role === 'TEACHER') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'AppTabTeacher' }],
        });
      }

    } catch (error: any) {
      console.log("Login error:", error.response?.data || error);
      alert(error.response?.data?.message || "Đăng nhập thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToRegister = () => {
    navigation.navigate('Register');
  }

  const handleSocialLogin = (platform: 'facebook' | 'google') => {
    console.log(`Đăng nhập bằng ${platform} được nhấn`);
  };

  const handleGoBack = () => {
    // Kiểm tra xem có thể quay lại không
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      console.log("Không còn màn hình nào phía trước để quay lại.");
      // Tùy chọn: Nếu không quay lại được thì đưa về Trang chủ (để user không bị kẹt)
      // navigation.navigate('AppTabs'); 
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.closeButton}>
            <Ionicons name="close-outline" size={30} color={COLOR_TEXT} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đăng nhập</Text>
        </View>

        {/* Input */}
        <View style={styles.inputGroup}>
          <Image source={foxImage} style={styles.logo} resizeMode="contain" />

          <TextInput
            style={styles.textInput}
            placeholder="Email"
            placeholderTextColor="#A9A9A9"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <View style={styles.marginBottomCustom}></View>

          <View style={styles.passwordInputContainer}>
            <TextInput
              style={[styles.textInput, { flex: 1, borderBottomWidth: 0 }]}
              placeholder="Mật khẩu"
              placeholderTextColor="#A9A9A9"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={24} color={COLOR_PRIMARY} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>ĐĂNG NHẬP</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNavigateToRegister}>
            <Text style={styles.registerLink}>
              Bạn chưa có tài khoản? <Text style={styles.registerLinkHighlight}>Đăng ký ngay</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => console.log('Quên mật khẩu pressed')}>
            <Text style={styles.forgotPassword}>QUÊN MẬT KHẨU</Text>
          </TouchableOpacity>
        </View>

        {/* Social Login */}
        <View style={styles.footer}>
          <View style={styles.socialRow}>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: COLOR_FACEBOOK }]}
              onPress={() => handleSocialLogin('facebook')}
            >
              <FontAwesome name="facebook" size={20} color="#fff" />
              <Text style={styles.socialButtonText}>FACEBOOK</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: COLOR_GOOGLE, marginLeft: 15 }]}
              onPress={() => handleSocialLogin('google')}
            >
              <FontAwesome name="google" size={20} color="#fff" />
              <Text style={styles.socialButtonText}>GOOGLE</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  registerLink: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10, // Đẩy khu vực xã hội xuống
  },
  registerLinkHighlight: {
    color: COLOR_PRIMARY,
    fontWeight: 'bold',
  },
  scrollContainer: { flexGrow: 1, paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 10 : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, marginBottom: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLOR_TEXT },
  closeButton: { position: 'absolute', left: 0, padding: 5 },
  inputGroup: { marginBottom: 30 },
  logo: { width: 300, height: 300, alignSelf: 'center' },
  marginBottomCustom: { marginBottom: 20 },
  textInput: { height: 50, borderColor: COLOR_GRAY_BORDER, borderBottomWidth: 2, fontSize: 18, paddingHorizontal: 5, color: COLOR_TEXT },
  passwordInputContainer: { flexDirection: 'row', alignItems: 'center', borderColor: COLOR_GRAY_BORDER, borderBottomWidth: 2 },
  eyeIcon: { padding: 10, marginRight: -10 },
  actionSection: { alignItems: 'center' },
  loginButton: { width: '100%', backgroundColor: COLOR_PRIMARY, paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  forgotPassword: { color: COLOR_PRIMARY, fontSize: 15, fontWeight: 'bold', marginBottom: 100 },
  footer: { marginTop: 'auto', alignItems: 'center', paddingBottom: 20 },
  socialRow: { flexDirection: 'row', width: '100%' },
  socialButton: { flex: 1, paddingVertical: 15, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  socialButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 }
});

export default LoginScreen;
