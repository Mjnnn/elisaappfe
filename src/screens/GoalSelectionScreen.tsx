// src/screens/GoalSelectionScreen.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthStack';
import foxImage from '../../assets/images/logo/Elisa.png';

// Định nghĩa kiểu Props cho màn hình này
type GoalSelectionScreenProps = NativeStackScreenProps<AuthStackParamList, 'GoalSelection'>;
type GoalSelectionRouteProp = RouteProp<AuthStackParamList, 'GoalSelection'>;
// ...existing code...
// Dữ liệu giả định cho các mục tiêu học tập (Cần thêm icon tương ứng)
const goals = [
  { id: 'study', label: 'Hỗ trợ việc học tập', icon: 'book' },
  { id: 'entertainment', label: 'Giải trí', icon: 'theater-masks' },
  { id: 'leisure', label: 'Tận dụng thời gian rảnh', icon: 'brain' },
  { id: 'connect', label: 'Kết nối với mọi người', icon: 'user-friends' },
  { id: 'career', label: 'Phát triển sự nghiệp', icon: 'briefcase' },
  { id: 'travel', label: 'Chuẩn bị đi du lịch', icon: 'plane-departure' },
  { id: 'other', label: 'Khác', icon: 'ellipsis-h' },
];

const GoalSelectionScreen: React.FC<GoalSelectionScreenProps> = ({ navigation }) => {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

    // Lấy data từ navigation params
    const route = useRoute<GoalSelectionRouteProp>();
    const { languageName } = route.params;

  const handleGoalToggle = (goalId: string) => {
    // Cho phép chọn nhiều mục tiêu
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId) // Bỏ chọn
        : [...prev, goalId] // Chọn
    );
  };

  const handleContinue = () => {
    if (selectedGoals.length > 0) {
      console.log('Các mục tiêu đã chọn:', selectedGoals);
      // TODO: Chuyển sang màn hình tiếp theo (ví dụ: tạo tài khoản)
      // navigation.navigate('RegisterScreen'); 
      navigation.navigate('LevelSelection', {
        languageName: languageName, // Ngôn ngữ đã nhận từ màn hình trước
        selectedGoals: selectedGoals    // List các mục tiêu đã chọn
      });
    } else {
      alert("Vui lòng chọn ít nhất một lý do học!");
    }
  };

  // Component phụ trợ cho từng lựa chọn mục tiêu
  const GoalItem: React.FC<{ goal: typeof goals[0] }> = ({ goal }) => {
    const isSelected = selectedGoals.includes(goal.id);

    return (
      <TouchableOpacity
        style={[styles.goalItem, isSelected && styles.goalItemSelected]}
        onPress={() => handleGoalToggle(goal.id)}
      >
        <View style={styles.goalContent}>
          <FontAwesome5 name={goal.icon} size={22} color={isSelected ? '#4C8BF5' : '#888'} style={styles.goalIcon} />
          <Text style={styles.goalText}>{goal.label}</Text>
        </View>
        
        {/* Checkbox (Mô phỏng) */}
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Ionicons name="checkmark-sharp" size={18} color="white" />}
        </View>
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
            {/* Thanh tiến trình đang ở bước 2/n */}
            <View style={styles.progressBar} />
          </View>
        </View>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          {/* Phần Chatbot và Câu hỏi */}
          <View style={styles.chatbotArea}>
            {/* Hình ảnh Chatbot (Fox Elisa) */}
             <Image 
                source={foxImage}
                style={styles.chatbotIcon} 
            />
            <View style={styles.speechBubble}>
                <Text style={styles.speechText}>Tại sao bạn học {languageName}?</Text>
            </View>
          </View>
          
          {/* Danh sách Mục tiêu */}
          {goals.map(goal => (
            <GoalItem key={goal.id} goal={goal} />
          ))}
          
          <View style={{ height: 50 }} /> 
        </ScrollView>
      </View>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            // Nút sáng màu khi có mục tiêu được chọn
            { backgroundColor: selectedGoals.length > 0 ? '#3B82F6' : '#E5E5E5' } 
          ]}
          onPress={handleContinue}
          disabled={selectedGoals.length === 0}
        >
          <Text style={[
            styles.continueButtonText,
            { color: selectedGoals.length > 0 ? 'white' : '#AFAFAF' }
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
    width: '30%', // Tiến độ ở bước 2
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
      // Style cho ảnh Fox Elisa
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
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    marginBottom: 10,
    backgroundColor: 'white',
  },
  goalItemSelected: {
    borderColor: '#3B82F6', // Màu xanh lá Duolingo nhạt
    backgroundColor: '#F7FFF0', 
    borderWidth: 3,
  },
  goalContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
  },
  goalIcon: {
    marginRight: 20,
    width: 30,
    textAlign: 'center',
  },
  goalText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#4B4B4B',
    flex: 1,
  },
  checkbox: {
      width: 25,
      height: 25,
      borderRadius: 13,
      borderWidth: 2,
      borderColor: '#AFAFAF',
      justifyContent: 'center',
      alignItems: 'center',
  },
  checkboxSelected: {
      backgroundColor: '#3B82F6',
      borderColor: '#3B82F6',
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

export default GoalSelectionScreen;