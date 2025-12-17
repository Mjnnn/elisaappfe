import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthStack';
import foxImage from '../../../assets/images/logo/Elisa.png';

// Khai báo kiểu dữ liệu cho props (nếu có, ở đây không cần)
// type WelcomeScreenProps = {};
type WelcomeScreenProps = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  // Hàm xử lý khi người dùng nhấn nút
  const handleStart = () => {
    console.log('Bắt đầu ngay được nhấn');
    navigation.navigate('Register');
    // TODO: Thêm logic chuyển màn hình đăng ký/chính
  };

  const handleLogin = () => {
    console.log('Tôi đã có tài khoản được nhấn');
    navigation.navigate('Login');
  };

  return (
    // SafeAreaView giúp nội dung không bị che bởi notch/thanh trạng thái
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        {/* Khu vực Hình ảnh */}
        <Image
          // Cần thay thế bằng nguồn hình ảnh thực tế của bạn
          source={foxImage}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Khu vực Văn bản */}
        <Text style={styles.title}>Elisa</Text>
        <Text style={styles.subtitle}>
          Mở ra cánh cửa thế giới thông qua ngôn ngữ.
        </Text>

        {/* Khu vực Nút bấm */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleStart}>
            <Text style={styles.primaryButtonText}>BẮT ĐẦU NGAY</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleLogin}>
            <Text style={styles.secondaryButtonText}>TÔI ĐÃ CÓ TÀI KHOẢN</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    alignItems: 'center', // Căn giữa theo chiều ngang
    justifyContent: 'space-between', // Đẩy nội dung lên trên và nút xuống dưới
    paddingTop: 80,
    paddingBottom: 40,
  },
  logo: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  title: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#004AAD', // Màu xanh đậm tương tự trong ảnh
    marginBottom: 5,
    fontFamily: 'System' // Sử dụng font mặc định
  },
  subtitle: {
    fontSize: 16,
    color: '#3869adff', // Màu Slate-600 đậm hơn một chút để nổi bật trên nền sáng
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
    fontWeight: '500',

    // --- PHẦN ĐỔ BÓNG CHO CHỮ (TEXT SHADOW) ---
    textShadowColor: 'rgba(0, 0, 0, 0.15)', // Đổ bóng nhẹ nhàng màu đen trong suốt
    textShadowOffset: { width: 1, height: 1 }, // Độ lệch bóng (ngang 1px, dọc 1px)
    textShadowRadius: 3, // Độ nhòe của bóng giúp chữ trông mềm mại hơn
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 'auto', // Đẩy khu vực nút bấm xuống dưới cùng
  },
  // Nút BẮT ĐẦU NGAY (Primary Button)
  primaryButton: {
    width: '100%',
    backgroundColor: '#3B82F6', // Màu xanh dương đậm hơn
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#171717', // Thêm bóng nhẹ
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5, // Dành cho Android
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Nút TÔI ĐÃ CÓ TÀI KHOẢN (Secondary Button)
  secondaryButton: {
    width: '100%',
    backgroundColor: '#fff', // Nền trắng
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2, // Viền
    borderColor: '#3B82F6', // Viền màu xanh
  },
  secondaryButtonText: {
    color: '#3B82F6', // Chữ màu xanh
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen;   