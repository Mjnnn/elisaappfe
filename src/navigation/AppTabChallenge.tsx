import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';

import CreateClozeScreen from '../screens/TeacherScreen/Challenge/CreateClozeScreen';
import CreateListeningDictationScreen from '../screens/TeacherScreen/Challenge/CreateListeningDictationScreen';
import CreateMultipleScreen from '../screens/TeacherScreen/Challenge/CreateMultipleScreen';
import CreateOrderingScreen from '../screens/TeacherScreen/Challenge/CreateOrderingScreen';
import CreateSentenceRewritingScreen from '../screens/TeacherScreen/Challenge/CreateSentenceRewritingScreen';

// --- Định nghĩa Kiểu cho Tabs ---
export type AppTabsParamChallengeList = {
    Multiple: { lessonId: number; lessonTitle: string };
    SentenceRewriting: { lessonId: number; lessonTitle: string };
    ListeningDictation: { lessonId: number; lessonTitle: string };
    Cloze: { lessonId: number; lessonTitle: string };
    Ordering: { lessonId: number; lessonTitle: string };
};

const Tab = createBottomTabNavigator<AppTabsParamChallengeList>();

// Màu sắc chung
const COLOR_PRIMARY = '#3B82F6';
const COLOR_INACTIVE = '#AFAFAF';

const AppTabChallenge: React.FC = () => {
    const insets = useSafeAreaInsets();
    const route = useRoute();
    const { lessonId, lessonTitle } = route.params as { lessonId: number; lessonTitle: string };
    const commonParams = { lessonId, lessonTitle };

    return (
        <Tab.Navigator
            initialRouteName="Multiple"
            screenOptions={({ route }) => ({
                // Định nghĩa icon dựa trên tên route
                tabBarIcon: ({ focused, color, size }) => {
                    let iconComponent: React.ReactElement;

                    switch (route.name) {
                        case 'Multiple':
                            iconComponent = (
                                <MaterialCommunityIcons
                                    name={focused ? 'checkbox-marked-circle' : 'checkbox-marked-circle-outline'}
                                    size={size}
                                    color={color}
                                />
                            )
                            break;

                        case 'SentenceRewriting':
                            iconComponent = (
                                <MaterialCommunityIcons
                                    name={focused ? 'puzzle' : 'puzzle-outline'}
                                    size={size}
                                    color={color}
                                />
                            );
                            break;

                        case 'ListeningDictation':
                            iconComponent = (
                                <MaterialCommunityIcons
                                    name={focused ? 'subtitles' : 'subtitles-outline'}
                                    size={size}
                                    color={color}
                                />
                            );
                            break;

                        case 'Cloze':
                            iconComponent = (
                                <MaterialCommunityIcons
                                    name={focused ? 'file-document-edit' : 'file-document-edit-outline'}
                                    size={size}
                                    color={color}
                                />
                            );
                            break;


                        case 'Ordering':
                            iconComponent = (
                                <MaterialCommunityIcons
                                    name={focused ? 'sort-variant' : 'sort'}
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
                name="Multiple"
                component={CreateMultipleScreen}
                options={{ title: 'Trắc Nghiệp' }}
                initialParams={commonParams}
            />
            <Tab.Screen
                name="SentenceRewriting"
                component={CreateSentenceRewritingScreen}
                options={{ title: 'Ghép Câu' }}
                initialParams={commonParams}
            />
            <Tab.Screen
                name="ListeningDictation"
                component={CreateListeningDictationScreen}
                options={{ title: 'Nghe Chép' }}
                initialParams={commonParams}
            />

            <Tab.Screen
                name="Cloze"
                component={CreateClozeScreen}
                options={{ title: 'Điền Từ' }}
                initialParams={commonParams}
            />

            <Tab.Screen
                name="Ordering"
                component={CreateOrderingScreen}
                options={{ title: 'Sắp Xếp' }}
                initialParams={commonParams}
            />
        </Tab.Navigator>
    );
};

export default AppTabChallenge;