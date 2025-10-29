// src/screens/CourseSelectionScreen.tsx

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthStack';
import foxImage from '../../assets/images/logo/Elisa.png';

// Định nghĩa kiểu Props cho màn hình này
type CourseSelectionScreenProps = NativeStackScreenProps<AuthStackParamList, 'CourseSelection'>;

// Dữ liệu giả định cho các khóa học
const courses = [
  // LƯU Ý: ĐƯỜNG DẪN CỜ CẦN CHÍNH XÁC VỚI DỰ ÁN CỦA BẠN
  { name: "Tiếng Anh", flag: require('../../assets/images/flags/england.png') },
  { name: "Tiếng Trung", flag: require('../../assets/images/flags/china.png') },
  { name: "Tiếng Tây Ban Nha", flag: require('../../assets/images/flags/spain.png') },
  { name: "Tiếng Pháp", flag: require('../../assets/images/flags/france.png') },
  { name: "Tiếng Hàn", flag: require('../../assets/images/flags/korea.png') },
  { name: "Tiếng Nhật", flag: require('../../assets/images/flags/japan.png') },
];

const CourseSelectionScreen: React.FC<CourseSelectionScreenProps> = ({ navigation }) => {
  const [selectedCourse, setSelectedCourse] = React.useState<string | null>(null);

  const handleContinue = () => {
    if (selectedCourse) {
      console.log(`Tiếp tục với khóa học: ${selectedCourse}`);
      // TODO: Logic chuyển màn hình đăng ký
      navigation.navigate('GoalSelection', {
        languageName: selectedCourse // Gán tên ngôn ngữ được chọn vào param
      });
    } else {
      alert("Vui lòng chọn một khóa học!");
    }
  };

  // Component phụ trợ cho từng lựa chọn khóa học
  const CourseItem: React.FC<{ name: string, flag: any }> = ({ name, flag }) => (
    <TouchableOpacity
      style={[
        styles.courseItem,
        selectedCourse === name && styles.courseItemSelected,
      ]}
      onPress={() => setSelectedCourse(name)}
    >
      <Image source={flag} style={styles.flagIcon} />
      <Text style={styles.courseText}>{name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#888" />
          </TouchableOpacity>
          <View style={styles.progressBarContainer}>
            {/* Progress Bar (Thanh tiến trình) */}
            <View style={styles.progressBar} />
          </View>
        </View>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Phần Chatbot và Câu hỏi */}
          <View style={styles.chatbotArea}>
            {/* Tương tự hình ảnh Duolingo */}
            <Image 
                source={foxImage} // Bạn cần thêm ảnh này
                style={styles.chatbotIcon} 
            />
            <View style={styles.speechBubble}>
                <Text style={styles.speechText}>Bạn muốn học gì nhỉ?</Text>
            </View>
          </View>
          
          <Text style={styles.sectionTitle}>Dành cho người nói tiếng Việt</Text>
          
          {/* Danh sách Khóa học */}
          {courses.map(course => (
            <CourseItem key={course.name} name={course.name} flag={course.flag} />
          ))}
          
          {/* Khoảng trống đệm */}
          <View style={{ height: 120 }} /> 
        </ScrollView>
      </View>

      {/* Footer Button - Đặt ngoài ScrollView */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            { backgroundColor: selectedCourse ? '#3B82F6' : '#E5E5E5' } 
          ]}
          onPress={handleContinue}
          disabled={!selectedCourse}
        >
          <Text style={[
            styles.continueButtonText,
            { color: selectedCourse ? 'white' : '#AFAFAF' }
          ]}>
            TIẾP TỤC
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContainer: {
    flex: 1,
  },
  
  // --- Header & Progress Bar ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  backButton: {
    paddingRight: 15,
  },
  progressBarContainer: {
    flex: 1,
    height: 10,
    backgroundColor: '#E5E5E5',
    borderRadius: 5,
  },
  progressBar: {
    width: '10%', // Tiến độ ban đầu
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 5,
  },

  // --- Chatbot Area ---
  chatbotArea: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 30,
    marginTop: 10,
  },
  chatbotIcon: {
      width: 100,
      height: 100,
      borderRadius: 30, // Giả định là ảnh tròn
  },
  speechBubble: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    // Tạo đuôi bong bóng thoại
    shadowColor: '#171717',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  speechText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  
  // --- Section Title ---
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },

  // --- Course Items ---
  courseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    marginBottom: 10,
    backgroundColor: 'white',
  },
  courseItemSelected: {
    borderColor: '#3B82F6', // Màu viền khi được chọn
    backgroundColor: '#F7FFF0', // Màu nền nhạt khi được chọn
    borderWidth: 3,
  },
  flagIcon: {
    width: 40,
    height: 25,
    borderRadius: 5,
    marginRight: 20,
    borderWidth: 1, // Viền cờ
    borderColor: '#eee',
  },
  courseText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B4B4B',
  },

  // --- Footer & Button ---
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 15,
    paddingBottom: Platform.OS === 'ios' ? 0 : 15,
    marginLeft: 20,
    marginRight: 20,
  },
  continueButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CourseSelectionScreen;