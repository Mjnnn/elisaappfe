// src/navigation/AuthStack.tsx

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// ==== Màn hình chung / onboarding & auth ====
import WelcomeScreen from "../screens/WelcomeScreen/WelcomeScreen";
import LoginScreen from "../screens/AuthScreen/LoginScreen";
import RegisterScreen from "../screens/AuthScreen/RegisterScreen";
import CourseSelectionScreen from "../screens/WelcomeScreen/CourseSelectionScreen";
import GoalSelectionScreen from "../screens/WelcomeScreen/GoalSelectionScreen";
import LevelSelectionScreen from "../screens/WelcomeScreen/LevelSelectionScreen";
import DailyGoalScreen from "../screens/WelcomeScreen/DailyGoalScreen";
import PlacementQuizScreen from "../screens/WelcomeScreen/PlacementQuizScreen";
import QuizResultsScreen from "../screens/WelcomeScreen/QuizResultsScreen";

// ==== Main / Home ====
import AppTabs from "./AppTabs";
import HomeScreen from "../screens/MainScreen/HomeScreen/HomeScreen";

// ==== Màn hình bài học chính ====
import LessonLoadingScreen from "../screens/MainScreen/loading/LessonLoadingScreen";
import VocabularyScreen from "../screens/MainScreen/HomeScreen/VocabularyScreen";
import VocabularyPracticeScreen from "../screens/MainScreen/HomeScreen/VocabularyPracticeScreen";
import GrammarScreen from "../screens/MainScreen/HomeScreen/GrammarScreen";
import ExerciseLoadingScreen from "../screens/MainScreen/loading/ExerciseLoadingScreen";
import ExerciseScreen from "../screens/MainScreen/HomeScreen/ExerciseScreen";

// ==== Tài khoản ====
import EditProfileScreen from "../screens/MainScreen/AccountScreen/EditProfileScreen";
import ChangePasswordScreen from "../screens/MainScreen/AccountScreen/ChangePasswordScreen";

// ==== Tự học (Self Study) ====
import SelfStudyScreen from "../screens/selfstudy/SelfStudyScreen";
import DocumentListDetailScreen from "../screens/selfstudy/DocumentListDetailScreen";
import FlashcardScreen from "../screens/selfstudy/FlashcardScreen";
import PracticeQuestionScreen from "../screens/selfstudy/PracticeQuestionScreen";
import TwoSideSpeakScreen from "../screens/selfstudy/TwoSideSpeakScreen";

// ================== Khai báo các route ==================
export type AuthStackParamList = {
  Welcome: undefined;
  Register: undefined;
  Login: undefined;

  CourseSelection: undefined;
  GoalSelection: { languageName: string };
  LevelSelection: {
    languageName: string;
    selectedGoals: string[];
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
    quizAnswers: { [questionId: number]: string };
    learningLanguage: string;
  };

  AppTabs: undefined;
  Home: undefined;

  // ===== Self Study =====
  SelfStudyScreen: undefined;

  DocumentListDetail: {
    listId: number;
    title: string;
    author: string;
    itemCount: number;
  };

  FlashcardScreen: {
    listId: number;
    title: string;
  };

  PracticeQuestionScreen: {
    listId: number;
    title: string;
  };

  TwoSideSpeakScreen: {
    listId: number;
    title: string;
  };

  // ===== Lesson / Exercise flow =====
  LessonLoading: {
    lessonId: number;
    lessonTitle: string;
    section: number;
    targetRoute: keyof AuthStackParamList;
  };
  VocabularyScreen: {
    lessonId: number;
    lessonTitle: string;
    section: number;
  };
  VocabularyPractice: {
    lessonId: number;
    lessonTitle: string;
    section: number;
    vocabularyList: any[];
  };
  GrammarScreen: {
    lessonId: number;
    lessonTitle: string;
    section: number;
  };
  ExerciseLoading: {
    lessonId: number;
    lessonTitle: string;
    section: number;
    targetRoute: keyof AuthStackParamList;
  };
  ExerciseScreen: {
    lessonId: number;
    lessonTitle: string;
    section: number;
  };

  // ===== Account =====
  EditProfileScreen: { userInitialData: any };
  ChangePasswordScreen: { email: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Welcome"
    >
      {/* Onboarding / Auth */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="CourseSelection" component={CourseSelectionScreen} />
      <Stack.Screen name="GoalSelection" component={GoalSelectionScreen} />
      <Stack.Screen name="LevelSelection" component={LevelSelectionScreen} />
      <Stack.Screen name="DailyGoal" component={DailyGoalScreen} />
      <Stack.Screen name="PlacementQuiz" component={PlacementQuizScreen} />
      <Stack.Screen name="QuizResults" component={QuizResultsScreen} />

      {/* Main / Tabs / Home */}
      <Stack.Screen name="AppTabs" component={AppTabs} />
      <Stack.Screen name="Home" component={HomeScreen} />

      {/* Self Study */}
      <Stack.Screen name="SelfStudyScreen" component={SelfStudyScreen} />
      <Stack.Screen
        name="DocumentListDetail"
        component={DocumentListDetailScreen}
      />
      <Stack.Screen name="FlashcardScreen" component={FlashcardScreen} />
      <Stack.Screen
        name="PracticeQuestionScreen"
        component={PracticeQuestionScreen}
      />
      <Stack.Screen
        name="TwoSideSpeakScreen"
        component={TwoSideSpeakScreen}
      />

      {/* Lesson / Exercise flow */}
      <Stack.Screen name="LessonLoading" component={LessonLoadingScreen} />
      <Stack.Screen name="VocabularyScreen" component={VocabularyScreen} />
      <Stack.Screen
        name="VocabularyPractice"
        component={VocabularyPracticeScreen}
      />
      <Stack.Screen name="GrammarScreen" component={GrammarScreen} />
      <Stack.Screen
        name="ExerciseLoading"
        component={ExerciseLoadingScreen}
      />
      <Stack.Screen name="ExerciseScreen" component={ExerciseScreen} />

      {/* Account */}
      <Stack.Screen
        name="EditProfileScreen"
        component={EditProfileScreen}
      />
      <Stack.Screen
        name="ChangePasswordScreen"
        component={ChangePasswordScreen}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;
