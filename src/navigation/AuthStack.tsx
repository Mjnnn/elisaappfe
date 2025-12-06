// src/navigation/AuthStack.tsx

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import WelcomeScreen from "../screens/WelcomeScreen/WelcomeScreen";
import LoginScreen from "../screens/AuthScreen/LoginScreen";
import CourseSelectionScreen from "../screens/WelcomeScreen/CourseSelectionScreen";
import GoalSelectionScreen from "../screens/WelcomeScreen/GoalSelectionScreen";
import LevelSelectionScreen from "../screens/WelcomeScreen/LevelSelectionScreen";
import DailyGoalScreen from "../screens/WelcomeScreen/DailyGoalScreen";
import RegisterScreen from "../screens/AuthScreen/RegisterScreen";
import HomeScreen from "../screens/MainScreen/HomeScreen";
import PlacementQuizScreen from "../screens/WelcomeScreen/PlacementQuizScreen";
import QuizResultsScreen from "../screens/WelcomeScreen/QuizResultsScreen";
import SelfStudyScreen from "../screens/selfstudy/SelfStudyScreen";
import DocumentListDetailScreen from "../screens/selfstudy/DocumentListDetailScreen";
import FlashcardScreen from "../screens/selfstudy/FlashcardScreen";
import PracticeQuestionScreen from "../screens/selfstudy/PracticeQuestionScreen";
import TwoSideSpeakScreen from "../screens/selfstudy/TwoSideSpeakScreen";
import AppTabs from "./AppTabs";

// Khai báo các route
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
  SelfStudyScreen: undefined;

  DocumentListDetail: {
    listId: number;
    title: string;
    author: string;
    itemCount: number;
  };

  FlashcardScreen: {          // 👈 route cho màn học flashcard
    listId: number;
    title: string;
  };
  TwoSideSpeakScreen: {
    listId: number;
    title: string;
  };
  PracticeQuestionScreen: { listId: number; title: string }; 
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Welcome"
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
      <Stack.Screen
        name="DocumentListDetail"
        component={DocumentListDetailScreen}
      />
      <Stack.Screen
        name="FlashcardScreen"
        component={FlashcardScreen}
      />
      <Stack.Screen
        name="PracticeQuestionScreen"
        component={PracticeQuestionScreen}
      />
      <Stack.Screen
        name="TwoSideSpeakScreen"
        component={TwoSideSpeakScreen}
      />


    </Stack.Navigator>
  );
};

export default AuthStack;
