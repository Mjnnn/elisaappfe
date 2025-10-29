// src/screens/DailyGoalScreen.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthStack';
import Toast from 'react-native-toast-message';
import foxImage from '../../assets/images/logo/Elisa.png';

// Định nghĩa kiểu Props cho màn hình này
type DailyGoalScreenProps = NativeStackScreenProps<AuthStackParamList, 'DailyGoal'>;

// Định nghĩa kiểu cho Route Prop để nhận params
type DailyGoalRouteProp = RouteProp<AuthStackParamList, 'DailyGoal'>;

// Dữ liệu giả định cho các mục tiêu thời gian
const goals = [
  { id: 'easy', time: '5 phút / ngày', difficulty: 'Dễ' },
  { id: 'medium', time: '10 phút / ngày', difficulty: 'Vừa' },
  { id: 'hard', time: '15 phút / ngày', difficulty: 'Khó' },
  { id: 'superhard', time: '30 phút / ngày', difficulty: 'Siêu khó' },
];

const DailyGoalScreen: React.FC<DailyGoalScreenProps> = ({ navigation }) => {
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  
  // Nhận tham số từ màn hình trước
  const route = useRoute<DailyGoalRouteProp>();
  const learningLanguage = route.params?.languageName ?? 'Tiếng Anh';
  const goalsChosen = route.params?.selectedGoals ?? [];
  const levelChosen = route.params?.selectedLevel ?? 0; // Giả định LevelSelection truyền ID (number)
  
  const handleContinue = () => {
    if (selectedGoalId !== null) {
      console.log('Mục tiêu hàng ngày đã chọn:', selectedGoalId);
      
      // BƯỚC CUỐI CÙNG TRONG ONBOARDING:
      // TODO: Gửi toàn bộ dữ liệu (Ngôn ngữ, Goals, Level, DailyGoal) lên API Spring Boot.
      // Sau đó, chuyển sang màn hình chính của ứng dụng (Home/Tabs).

      const selectedGoal = goals.find(goal => goal.id === selectedGoalId);
      if (selectedGoal) {
                Toast.show({
            type: 'success', // 👈 Loại thông báo có icon thành công
            
            // Tiêu đề lớn
            text1: '🎉 Đã hoàn thành Onboarding!', 
            
            // Nội dung nhỏ hơn
            text2: `Ngôn ngữ: ${learningLanguage}, Mục tiêu: ${selectedGoal.time}`,
            
            // Thời gian hiển thị (mili giây)
            visibilityTime: 2000, 
            
            // Vị trí
            position: 'top',
            topOffset: 80,
            });
        }
    } else {
      alert("Vui lòng chọn mục tiêu hàng ngày của bạn!");
    }
  };

  // Component phụ trợ cho từng lựa chọn mục tiêu
  const GoalItem: React.FC<{ goal: typeof goals[0] }> = ({ goal }) => {
    const isSelected = selectedGoalId === goal.id;
    return (
      <TouchableOpacity
        style={[
          styles.goalItem,
          isSelected && styles.goalItemSelected,
        ]}
        onPress={() => setSelectedGoalId(goal.id)}
      >
        <Text style={styles.goalTimeText}>{goal.time}</Text>
        <Text style={styles.goalDifficultyText}>{goal.difficulty}</Text>
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
            {/* Thanh tiến trình đang ở bước 4/n */}
            <View style={styles.progressBar} />
          </View>
        </View>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          {/* Phần Chatbot và Câu hỏi */}
          <View style={styles.chatbotArea}>
            <Image 
                source={foxImage} 
                style={styles.chatbotIcon} 
            />
            <View style={styles.speechBubble}>
                <Text style={styles.speechText}>Mục tiêu hàng ngày của bạn là gì nhỉ?</Text>
            </View>
          </View>
          
          {/* Danh sách Mục tiêu Thời gian */}
          {goals.map(goal => (
            <GoalItem key={goal.id} goal={goal} />
          ))}
          
          <View style={{ height: 100 }} /> 
        </ScrollView>
      </View>

      {/* Footer Button (TÔI QUYẾT TÂM) */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            { backgroundColor: selectedGoalId !== null ? '#3B82F6' : '#E5E5E5' } // Màu xanh lá Duolingo
          ]}
          onPress={handleContinue}
          disabled={selectedGoalId === null}
        >
          <Text style={[
            styles.continueButtonText,
            { color: selectedGoalId !== null ? 'white' : '#AFAFAF' }
          ]}>
            TÔI QUYẾT TÂM
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
    width: '70%', // Tiến độ ở bước 4/n
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
  
  // --- Goal Items ---
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    marginBottom: 15,
    backgroundColor: 'white',
  },
  goalItemSelected: {
    borderColor: '#3B82F6', // Màu xanh lá nhạt khi được chọn
    backgroundColor: '#F7FFF0', 
    borderWidth: 3,
  },
  goalTimeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B4B4B',
  },
  goalDifficultyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#AFAFAF', // Màu xám nhạt cho độ khó
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

export default DailyGoalScreen;