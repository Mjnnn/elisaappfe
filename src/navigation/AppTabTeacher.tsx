import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";

import LessonScreen from '../screens/TeacherScreen/Lesson/LesssonScreen';
import EarTrainingScreen from '../screens/TeacherScreen/EarTraining/EarTrainingScreen';


// --- Định nghĩa Kiểu cho Tabs ---
export type AppTabsParamTeacherList = {
    Lesson: undefined;
    EarTraining: undefined;
};

const Tab = createBottomTabNavigator<AppTabsParamTeacherList>();

// Màu sắc chung
const COLOR_PRIMARY = '#3B82F6';
const COLOR_INACTIVE = '#AFAFAF';


const AppTabTeacher: React.FC = () => {
    const insets = useSafeAreaInsets();
    const route = useRoute();

    return (
        <Tab.Navigator
            initialRouteName="Lesson"
            screenOptions={({ route }) => ({
                // Định nghĩa icon dựa trên tên route
                tabBarIcon: ({ focused, color, size }) => {
                    let iconComponent: React.ReactElement;

                    switch (route.name) {
                        case 'Lesson':
                            // Khoá học: Sử dụng icon mềm mại hơn (Ionicons)
                            // Nhớ import { MaterialCommunityIcons } from '@expo/vector-icons';
                            iconComponent = <Ionicons name={focused ? 'school' : 'school-outline'} size={size} color={color} />;
                            break;

                        case 'EarTraining':
                            iconComponent = (
                                <MaterialCommunityIcons
                                    // focused: tai nghe thường, !focused: tai nghe trong hộp (hoặc bạn để 'headphones' cho cả 2 cũng được)
                                    name={focused ? 'headphones' : 'headphones-box'}
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
                name="Lesson"
                component={LessonScreen}
                options={{ title: 'Khoá học' }}
            />
            <Tab.Screen
                name="EarTraining"
                component={EarTrainingScreen}
                options={{ title: 'Ngữ âm' }}
            />
        </Tab.Navigator>
    );
};

export default AppTabTeacher;