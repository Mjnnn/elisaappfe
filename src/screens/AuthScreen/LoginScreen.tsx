import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image
} from 'react-native';
import foxImage from '../../../assets/images/logo/Elisa.png';
import { SafeAreaView } from 'react-native-safe-area-context';
// Import icons từ thư viện Expo Vector Icons
import { Ionicons, FontAwesome } from '@expo/vector-icons';

// Navigation
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthStack';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

// Màu sắc chung
const COLOR_PRIMARY = '#3B82F6'; // Màu xanh dương chính (cho nút)
const COLOR_FACEBOOK = '#3b5998';
const COLOR_GOOGLE = '#DB4437';
const COLOR_TEXT = '#4B4B4B';
const COLOR_GRAY_BORDER = '#E5E5E5';

const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigation = useNavigation<LoginScreenNavigationProp>();

  // --- Hàm xử lý ---
  const handleLogin = () => {
    console.log('Đăng nhập với:', username, password);
    // TODO: Tích hợp API Spring Boot ở đây
  };

  const handleSocialLogin = (platform: 'facebook' | 'google' | 'phone') => {
    console.log(`Đăng nhập bằng ${platform} được nhấn`);
  };

  // --- Hàm xử lý Điều hướng (MỚI) ---
  const handleGoBack = () => {
    console.log('Nút đóng được nhấn, quay lại màn hình trước.');
    // navigation.goBack() quay trở lại màn hình trước đó trên Stack (WelcomeScreen)
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">

        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.closeButton}>
            <Ionicons name="close-outline" size={30} color={COLOR_TEXT} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đăng nhập</Text>
        </View>



        {/* Input Fields */}
        <View style={styles.inputGroup}>
          {/* Khu vực Hình ảnh */}
          <Image
            // Cần thay thế bằng nguồn hình ảnh thực tế của bạn
            source={foxImage}
            style={styles.logo}
            resizeMode="contain"
          />

          <TextInput
            style={styles.textInput}
            placeholder="Tên đăng nhập hoặc email"
            placeholderTextColor="#A9A9A9"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
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
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={24}
                color={COLOR_PRIMARY}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
          // Tạm thời kích hoạt nút (Có thể dùng disabled={!username || !password})
          >
            <Text style={styles.loginButtonText}>ĐĂNG NHẬP</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => console.log('Quên mật khẩu pressed')}>
            <Text style={styles.forgotPassword}>QUÊN MẬT KHẨU</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Social Login */}
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

          {/* Terms and Conditions */}
          <Text style={styles.termsText}>
            Khi đăng ký trên Elisa, bạn đã đồng ý với
            <Text style={styles.termsLink}> Các chính sách</Text>
            sách và
            <Text style={styles.termsLink}> Chính sách bảo mật</Text>
            của chúng tôi.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 10 : 0, // Padding trên Android
  },

  // --- Header ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLOR_TEXT,
  },
  closeButton: {
    position: 'absolute',
    left: 0,
    padding: 5,
  },

  // --- Input ---
  logo: {
    width: 300,
    height: 300,
    textAlign: 'center',
    margin: 'auto'
  },
  marginBottomCustom: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 30,
  },
  textInput: {
    height: 50,
    borderColor: COLOR_GRAY_BORDER,
    borderBottomWidth: 2,
    fontSize: 18,
    paddingHorizontal: 5,
    color: COLOR_TEXT,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: COLOR_GRAY_BORDER,
    borderBottomWidth: 2,
  },
  eyeIcon: {
    padding: 10,
    marginRight: -10,
  },

  socialIcon: {
    marginRight: 10, // Tạo khoảng cách nhỏ giữa icon và text
  },

  // --- Action Section ---
  actionSection: {
    alignItems: 'center',
  },
  loginButton: {
    width: '100%',
    backgroundColor: COLOR_PRIMARY,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPassword: {
    color: COLOR_PRIMARY,
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 100, // Đẩy khu vực nút xã hội xuống dưới
  },

  // --- Footer Social Login ---
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingBottom: 20,
  },
  phoneButton: {
    width: '100%',
    backgroundColor: '#6C757D', // Màu xám đậm cho nút điện thoại
    paddingVertical: 15,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  phoneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  socialButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  termsText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },
  termsLink: {
    fontWeight: 'bold',
    color: '#999',
  },
});

export default LoginScreen;