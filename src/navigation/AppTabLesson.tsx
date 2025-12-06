import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';

import VocabularyOfLesssonScreen from '../screens/TeacherScreen/Lesson/VocabularyOfLessonScreen';
import GrammarOfLessonScreen from '../screens/TeacherScreen/Lesson/GrammarOfLessonScreen';
import ExerciseOfLessonScreen from '../screens/TeacherScreen/Lesson/ExerciseOfLessonScreen';


// --- Định nghĩa Kiểu cho Tabs ---
export type AppTabsParamLessonList = {
    Vocabulary: { lessonId: number; lessonTitle: string };
    Grammar: { lessonId: number; lessonTitle: string };
    Exercise: { lessonId: number; lessonTitle: string };
};

const Tab = createBottomTabNavigator<AppTabsParamLessonList>();

// Màu sắc chung
const COLOR_PRIMARY = '#3B82F6';
const COLOR_INACTIVE = '#AFAFAF';

const AppTabLeson: React.FC = () => {
    const insets = useSafeAreaInsets();
    const route = useRoute();
    const { lessonId, lessonTitle } = route.params as { lessonId: number; lessonTitle: string };
    const commonParams = { lessonId, lessonTitle };

    return (
        <Tab.Navigator
            initialRouteName="Vocabulary"
            screenOptions={({ route }) => ({
                // Định nghĩa icon dựa trên tên route
                tabBarIcon: ({ focused, color, size }) => {
                    let iconComponent: React.ReactElement;

                    switch (route.name) {
                        case 'Vocabulary':
                            // Khoá học: Sử dụng icon mềm mại hơn (Ionicons)
                            // Nhớ import { MaterialCommunityIcons } from '@expo/vector-icons';
                            iconComponent = (
                                <MaterialCommunityIcons
                                    name={focused ? 'text-box-search' : 'text-box-search-outline'}
                                    size={size}
                                    color={color}
                                />
                            );
                            break;

                        case 'Grammar':
                            // Chat AI: Sử dụng icon robot hoặc 'auto-fix' (MaterialCommunityIcons)
                            iconComponent = (
                                <MaterialCommunityIcons
                                    name={focused ? 'script-text' : 'script-text-outline'}
                                    size={size}
                                    color={color}
                                />
                            );
                            break;

                        case 'Exercise':
                            // Xếp Hạng: Sử dụng icon 'medal' hoặc 'star-circle' (MaterialCommunityIcons)
                            iconComponent = (
                                <MaterialCommunityIcons
                                    name={focused ? 'format-list-checks' : 'format-list-checkbox'}
                                    size={size}
                                    color={color}
                                />
                            );
                            break;

                        default:
                            iconComponent = <Ionicons name={'help-circle-outline'} size={size} color={color} />;
                    }

                    return iconComponent;
                },

                // Cấu hình chung cho Tab Bar
                tabBarActiveTintColor: COLOR_PRIMARY,
                tabBarInactiveTintColor: COLOR_INACTIVE,
                tabBarStyle: {
                    // Chiều cao tự động tính toán theo Safe Area
                    height: 60 + (insets.bottom > 0 ? insets.bottom : 10),

                    // Padding đáy tự động (nếu máy có thanh vuốt thì đệm nhiều, không thì đệm ít)
                    paddingBottom: insets.bottom > 0 ? insets.bottom : 10,

                    paddingTop: 5,
                    backgroundColor: 'white',
                    borderTopWidth: 0,
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
                headerShown: false, // Ẩn header mặc định của Tab
            })}
        >
            <Tab.Screen
                name="Vocabulary"
                component={VocabularyOfLesssonScreen}
                options={{ title: 'Từ vựng' }}
                initialParams={commonParams}
            />
            <Tab.Screen
                name="Grammar"
                component={GrammarOfLessonScreen}
                options={{ title: 'Ngữ pháp' }}
                initialParams={commonParams}
            />
            <Tab.Screen
                name="Exercise"
                component={ExerciseOfLessonScreen}
                options={{ title: 'Bài tập' }}
                initialParams={commonParams}
            />
        </Tab.Navigator>
    );
};

export default AppTabLeson;