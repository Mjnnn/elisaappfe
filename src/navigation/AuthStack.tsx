// src/navigation/AuthStack.tsx

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import các màn hình của bạn
import WelcomeScreen from '../screens/WelcomeScreen/WelcomeScreen';
import LoginScreen from '../screens/AuthScreen/LoginScreen';
import CourseSelectionScreen from '../screens/WelcomeScreen/CourseSelectionScreen';
import GoalSelectionScreen from '../screens/WelcomeScreen/GoalSelectionScreen';
import LevelSelectionScreen from '../screens/WelcomeScreen/LevelSelectionScreen';
import DailyGoalScreen from '../screens/WelcomeScreen/DailyGoalScreen';
import RegisterScreen from '../screens/AuthScreen/RegisterScreen';
import HomeScreen from '../screens/MainScreen/HomeScreen';
import PlacementQuizScreen from '../screens/WelcomeScreen/PlacementQuizScreen';
import QuizResultsScreen from '../screens/WelcomeScreen/QuizResultsScreen';
import SelfStudyScreen from '../screens/selfstudy/SelfStudyScreen';
import AppTabs from './AppTabs';

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
  PlacementQuiz: {
    languageName: string;
    selectedGoals: string[];
    selectedLevel: number;
  };
  QuizResults: {
    quizAnswers: { [questionId: number]: string }; // Đối tượng chứa câu trả lời của người dùng
    learningLanguage: string;
  };
  AppTabs: undefined;
  Home: undefined;
  SelfStudyScreen: undefined;

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
      <Stack.Screen name="AppTabs" component={AppTabs} />
      <Stack.Screen name="CourseSelection" component={CourseSelectionScreen} />
      <Stack.Screen name="GoalSelection" component={GoalSelectionScreen} />
      <Stack.Screen name="LevelSelection" component={LevelSelectionScreen} />
      <Stack.Screen name="DailyGoal" component={DailyGoalScreen} />
      <Stack.Screen name="PlacementQuiz" component={PlacementQuizScreen} />
      <Stack.Screen name="QuizResults" component={QuizResultsScreen} />
      <Stack.Screen name="SelfStudyScreen" component={SelfStudyScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;