// src/navigation/AuthStack.tsx

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import WelcomeScreen from '../screens/WelcomeScreen/WelcomeScreen';
import LoginScreen from '../screens/AuthScreen/LoginScreen';
import CourseSelectionScreen from '../screens/WelcomeScreen/CourseSelectionScreen';
import GoalSelectionScreen from '../screens/WelcomeScreen/GoalSelectionScreen';
import LevelSelectionScreen from '../screens/WelcomeScreen/LevelSelectionScreen';
import DailyGoalScreen from '../screens/WelcomeScreen/DailyGoalScreen';
import RegisterScreen from '../screens/AuthScreen/RegisterScreen';
import HomeScreen from '../screens/MainScreen/HomeScreen/HomeScreen';
import PlacementQuizScreen from '../screens/WelcomeScreen/PlacementQuizScreen';
import QuizResultsScreen from '../screens/WelcomeScreen/QuizResultsScreen';
import SelfStudyScreen from '../screens/selfstudy/SelfStudyScreen';
import AppTabs from './AppTabs';
import LessonLoadingScreen from '../screens/MainScreen/loading/LessonLoadingScreen';
import VocabularyScreen from '../screens/MainScreen/HomeScreen/VocabularyScreen';
import VocabularyPracticeScreen from '../screens/MainScreen/HomeScreen/VocabularyPracticeScreen';
import GrammarScreen from '../screens/MainScreen/HomeScreen/GrammarScreen';
import ExerciseLoadingScreen from '../screens/MainScreen/loading/ExerciseLoadingScreen';
import ExerciseScreen from '../screens/MainScreen/HomeScreen/ExerciseScreen';
import EditProfileScreen from '../screens/MainScreen/AccountScreen/EditProfileScreen';
import ChangePasswordScreen from '../screens/MainScreen/AccountScreen/ChangePasswordScreen';
import LessonScreen from '../screens/TeacherScreen/Lesson/LesssonScreen';
import ListeningPracticeScreen from '../screens/MainScreen/EarTraining/ListeningPracticeScreen';
import LearnByLevelScreen from '../screens/MainScreen/EarTraining/LearnByLevelScreen';
import VideoLearningScreen from '../screens/MainScreen/EarTraining/VideoLearningScreen';
import ChallengeLoadingScreen from '../screens/MainScreen/loading/ChallengeLoadingScreen';
import MultipleChoiceScreen from "../screens/MainScreen/HomeScreen/MultipleChoiceScreen";
import SentenceRewritingScreen from "../screens/MainScreen/HomeScreen/SentenceRewritingScreen";
import ListeningDictationScreen from "../screens/MainScreen/HomeScreen/ListeningDictationScreen";
import ClozeScreen from "../screens/MainScreen/HomeScreen/ClozeScreen";
import OrderingScreen from "../screens/MainScreen/HomeScreen/OrderingScreen";
import StartConversationScreen from "../screens/MainScreen/ChatAIScreen/StartConversationScreen";
import ChatbotScreen from "../screens/MainScreen/ChatAIScreen/ChatbotScreen";

// Router Teacher
import AppTabLesson from './AppTabLesson';
import VocabularyOfLessonScreen from '../screens/TeacherScreen/Lesson/VocabularyOfLessonScreen';
import GrammarOfLessonScreen from '../screens/TeacherScreen/Lesson/GrammarOfLessonScreen';
import ExerciseOfLessonScreen from '../screens/TeacherScreen/Lesson/ExerciseOfLessonScreen';
import LoadingForLesson from '../screens/TeacherScreen/loading/LoadingForLesson';
import AppTabTeacher from './AppTabTeacher';
import EarTrainingScreen from '../screens/TeacherScreen/EarTraining/EarTrainingScreen';
import CommonLevelScreen from '../screens/TeacherScreen/EarTraining/CommonLevelScreen';
import LoadingForChallenge from '../screens/TeacherScreen/loading/LoadingForChallenge';
import AppTabChallenge from './AppTabChallenge';


// ==== Tự học (Self Study) ====
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

  ChallengeLoading: {
    lessonId: number;
    lessonTitle: string;
    section: number;
    targetRoute: keyof AuthStackParamList;
  };

  MultipleChoiceScreen: {
    lessonId: number;
    lessonTitle: string;
    section: number;
  }

  SentenceRewritingScreen: {
    lessonId: number;
    lessonTitle: string;
    section: number;
    currentScore: number;
  }

  ListeningDictationScreen: {
    lessonId: number;
    lessonTitle: string;
    section: number;
    currentScore: number;
  }

  ClozeScreen: {
    lessonId: number;
    lessonTitle: string;
    section: number;
    currentScore: number;
  }

  OrderingScreen: {
    lessonId: number;
    lessonTitle: string;
    section: number;
    currentScore: number;
  }


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
  LessonScreen: undefined;
  AppTabLesson: undefined;
  AppTabChallenge: undefined;
  VocabularyOfLessonScreen: { lessonId: number; lessonTitle: string };
  GrammarOfLessonScreen: { lessonId: number; lessonTitle: string };
  ExerciseOfLessonScreen: { lessonId: number; lessonTitle: string };
  LoadingForLesson: { lessonId: number; lessonTitle: string; section: number; targetRoute: keyof AuthStackParamList };
  LoadingForChallenge: { quoteText: string; subtitleText: string; lessonId: number; lessonTitle: string; section: number; targetRoute: keyof AuthStackParamList };
  AppTabTeacher: undefined;
  EarTrainingScreen: undefined;
  CommonLevelScreen: { levelId: string };
  LearnByLevelScreen: { levelId: string };
  VideoLearningScreen: { videoId: number };
  StartConversation: { topicId: number; levelCode: string };
  ChatbotScreen: { topic: string; levelCode: string };
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
      <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
      <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />
      <Stack.Screen name="LessonScreen" component={LessonScreen} />
      <Stack.Screen name="AppTabLesson" component={AppTabLesson} />
      <Stack.Screen name="VocabularyOfLessonScreen" component={VocabularyOfLessonScreen} />
      <Stack.Screen name="GrammarOfLessonScreen" component={GrammarOfLessonScreen} />
      <Stack.Screen name="ExerciseOfLessonScreen" component={ExerciseOfLessonScreen} />
      <Stack.Screen name="LoadingForLesson" component={LoadingForLesson} />
      <Stack.Screen name="LoadingForChallenge" component={LoadingForChallenge} />
      <Stack.Screen name="AppTabTeacher" component={AppTabTeacher} />
      <Stack.Screen name="EarTrainingScreen" component={EarTrainingScreen} />
      <Stack.Screen name="CommonLevelScreen" component={CommonLevelScreen} />
      <Stack.Screen name="LearnByLevelScreen" component={LearnByLevelScreen} />
      <Stack.Screen name="VideoLearningScreen" component={VideoLearningScreen} />
      <Stack.Screen name="ChallengeLoading" component={ChallengeLoadingScreen} />
      <Stack.Screen name="MultipleChoiceScreen" component={MultipleChoiceScreen} />
      <Stack.Screen name="SentenceRewritingScreen" component={SentenceRewritingScreen} />
      <Stack.Screen name="ListeningDictationScreen" component={ListeningDictationScreen} />
      <Stack.Screen name="ClozeScreen" component={ClozeScreen} />
      <Stack.Screen name="OrderingScreen" component={OrderingScreen} />
      <Stack.Screen name="AppTabChallenge" component={AppTabChallenge} />
      <Stack.Screen name="StartConversation" component={StartConversationScreen} />
      <Stack.Screen name="ChatbotScreen" component={ChatbotScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;
