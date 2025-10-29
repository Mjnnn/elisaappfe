// src/navigation/AuthStack.tsx

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import các màn hình của bạn
import WelcomeScreen from '../screens/WelcomeScreen'; 
import LoginScreen from '../screens/LoginScreen';
import CourseSelectionScreen from '../screens/CourseSelectionScreen';
import GoalSelectionScreen from '../screens/GoalSelectionScreen';
import LevelSelectionScreen from '../screens/LevelSelectionScreen';
import DailyGoalScreen from '../screens/DailyGoalScreen';
import RegisterScreen from '../screens/RegisterScreen';

// Định nghĩa kiểu dữ liệu cho các route (dùng TypeScript)
export type AuthStackParamList = {
  Welcome: undefined;
  Register: undefined;
  Login: undefined;
  CourseSelection: undefined;
  GoalSelection: { languageName: string };
  LevelSelection: { 
    languageName: string; 
    selectedGoals: string[]; // Mảng chứa ID các mục tiêu đã chọn
  };
  DailyGoal: { 
    languageName: string; 
    selectedGoals: string[]; 
    selectedLevel: number; 
  };
  // Bạn có thể thêm các màn hình khác như Register, ForgotPassword, v.v.
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthStack: React.FC = () => {
  return (
    <Stack.Navigator
      // Tùy chọn: Ẩn thanh header mặc định
      screenOptions={{ headerShown: false }}
      initialRouteName="Welcome" // Màn hình đầu tiên sẽ hiển thị
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="CourseSelection" component={CourseSelectionScreen} />
      <Stack.Screen name="GoalSelection" component={GoalSelectionScreen} />
      <Stack.Screen name="LevelSelection" component={LevelSelectionScreen} />
      <Stack.Screen name="DailyGoal" component={DailyGoalScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;