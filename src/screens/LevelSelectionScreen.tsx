// src/screens/LevelSelectionScreen.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthStack';
import foxImage from '../../assets/images/logo/Elisa.png';

// Định nghĩa kiểu Props cho màn hình này
type LevelSelectionScreenProps = NativeStackScreenProps<AuthStackParamList, 'LevelSelection'>;

// Định nghĩa kiểu Route Prop để lấy params
type LevelSelectionRouteProp = RouteProp<AuthStackParamList, 'LevelSelection'>;

// Dữ liệu giả định cho các cấp độ (sử dụng một số để mô phỏng biểu tượng thanh sóng)
const levels = [
  { id: 1, label: 'Tôi mới bắt đầu học', progress: 1 },
  { id: 2, label: 'Tôi biết một vài từ thông dụng', progress: 2 },
  { id: 3, label: 'Tôi có thể giao tiếp cơ bản', progress: 3 },
  { id: 4, label: 'Tôi có thể nói về nhiều chủ đề', progress: 4 },
  { id: 5, label: 'Tôi có thể đi sâu vào hầu hết các chủ đề', progress: 5 },
];

const LevelSelectionScreen: React.FC<LevelSelectionScreenProps> = ({ navigation }) => {
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  
    // Lấy data từ navigation params
    const route = useRoute<LevelSelectionRouteProp>();
    const { languageName, selectedGoals } = route.params;

    React.useEffect(() => {
      console.log('Ngôn ngữ đã chọn:', learningLanguage);
      console.log('Lý do đã chọn:', selectedGoals);
      // Bạn có thể lưu goalsChosen vào state toàn cục nếu cần.
  }, []);

  // Lấy ngôn ngữ đã chọn từ màn hình trước (ví dụ)
  const learningLanguage = languageName;

  const handleContinue = () => {
    if (selectedLevelId !== null) {
      console.log('Trình độ đã chọn:', selectedLevelId);
      // TODO: Chuyển sang màn hình cuối cùng của Onboarding (ví dụ: màn hình tạo tài khoản)
      // navigation.navigate('RegisterScreen'); 
        navigation.navigate('DailyGoal', {
          languageName: learningLanguage,
          selectedGoals: selectedGoals,
          selectedLevel: selectedLevelId,
        });
    } else {
      alert("Vui lòng chọn trình độ của bạn!");
    }
  };

  // Component phụ trợ cho từng lựa chọn trình độ
  const LevelItem: React.FC<{ level: typeof levels[0] }> = ({ level }) => {
    const isSelected = selectedLevelId === level.id;
    return (
      <TouchableOpacity
        style={[
          styles.levelItem,
          isSelected && styles.levelItemSelected,
        ]}
        onPress={() => setSelectedLevelId(level.id)}
      >
        {/* Biểu tượng Thanh sóng (Mô phỏng bằng FontAwesome) */}
        <View style={styles.iconContainer}>
            {[...Array(5)].map((_, index) => (
                <View 
                    key={index} 
                    style={[
                        styles.bar, 
                        // Thanh sóng đậm khi progress <= level.progress
                        index < level.progress && styles.barFilled,
                        // Điều chỉnh chiều cao cho từng thanh
                        { height: 10 + index * 5 } 
                    ]} 
                />
            ))}
        </View>
        <Text style={styles.levelText}>{level.label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#888" />
          </TouchableOpacity>
          <View style={styles.progressBarContainer}>
            {/* Thanh tiến trình đang ở bước 3/n */}
            <View style={styles.progressBar} />
          </View>
        </View>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          {/* Phần Chatbot và Câu hỏi */}
          <View style={styles.chatbotArea}>
            <Image 
                source={foxImage} // Hoặc ảnh chatbot Duolingo nếu bạn dùng
                style={styles.chatbotIcon} 
            />
            <View style={styles.speechBubble}>
                <Text style={styles.speechText}>Trình độ {learningLanguage} của bạn ở mức nào?</Text>
            </View>
          </View>
          
          {/* Danh sách Trình độ */}
          {levels.map(level => (
            <LevelItem key={level.id} level={level} />
          ))}
          
          <View style={{ height: 50 }} /> 
        </ScrollView>
      </View>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            // Nút sáng màu khi có cấp độ được chọn
            { backgroundColor: selectedLevelId !== null ? '#3B82F6' : '#E5E5E5' } 
          ]}
          onPress={handleContinue}
          disabled={selectedLevelId === null}
        >
          <Text style={[
            styles.continueButtonText,
            { color: selectedLevelId !== null ? 'white' : '#AFAFAF' }
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
    width: '50%', // Tiến độ ở bước 3/n
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
      borderRadius: 30, 
      // Style cho ảnh chatbot
  },
  speechBubble: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#171717',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    maxWidth: '70%',
  },
  speechText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  
  // --- Level Items ---
  levelItem: {
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
  levelItemSelected: {
    borderColor: '#3B82F6', // Màu xanh lá Duolingo nhạt
    backgroundColor: '#F7FFF0', 
    borderWidth: 3,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: 40,
    height: 35, // Chiều cao tối đa của biểu tượng
    justifyContent: 'space-between',
    marginRight: 20,
    paddingBottom: 5,
  },
  bar: {
    width: 4, // Độ rộng của thanh sóng
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
  },
  barFilled: {
    backgroundColor: '#1CB0F6', // Màu xanh dương cho thanh sóng đầy
  },
  levelText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#4B4B4B',
    flex: 1,
  },

  // --- Footer & Button ---
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 15,
    paddingBottom: Platform.OS === 'ios' ? 20 : 15,
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

export default LevelSelectionScreen;