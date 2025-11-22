import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';

// Import các màn hình chính (Bạn cần tạo các file này sau)
import HomeScreen from '../screens/MainScreen/HomeScreen/HomeScreen'; // Khoá học
import RankingScreen from '../screens/MainScreen/RankingScreen/RankingScreen'; // Xếp Hạng
import ChatAIScreen from '../screens/MainScreen/ChatAIScreen/ChatAIScreen'; // Chat AI
import NotificationScreen from '../screens/MainScreen/NotificationScreen/NotificationScreen'; // Thông Báo
import SettingsScreen from '../screens/MainScreen/AccountScreen/SettingsScreen'; // Cài Đặt
import AccountScreen from '../screens/MainScreen/AccountScreen/AccountScreen';

// --- Định nghĩa Kiểu cho Tabs ---
export type AppTabsParamList = {
    Home: undefined; // Khoá học (Thường Home là nơi bắt đầu)
    ChatAI: undefined;
    Ranking: undefined;
    Notifications: undefined;
    Account: undefined;
};

const Tab = createBottomTabNavigator<AppTabsParamList>();

// Màu sắc chung
const COLOR_PRIMARY = '#3B82F6';
const COLOR_INACTIVE = '#AFAFAF';

const AppTabs: React.FC = () => {
    return (
        <Tab.Navigator
            initialRouteName="Home"
            screenOptions={({ route }) => ({
                // Định nghĩa icon dựa trên tên route
                tabBarIcon: ({ focused, color, size }) => {
                    let iconComponent: React.ReactElement;

                    switch (route.name) {
                        case 'Home':
                            // Khoá học: Sử dụng icon mềm mại hơn (Ionicons)
                            iconComponent = <Ionicons name={focused ? 'school' : 'school-outline'} size={size} color={color} />;
                            break;

                        case 'ChatAI':
                            // Chat AI: Sử dụng icon robot hoặc 'auto-fix' (MaterialCommunityIcons)
                            iconComponent = (
                                <MaterialCommunityIcons
                                    name={focused ? 'robot-happy' : 'robot-happy-outline'}
                                    size={size}
                                    color={color}
                                />
                            );
                            break;

                        case 'Ranking':
                            // Xếp Hạng: Sử dụng icon 'medal' hoặc 'star-circle' (MaterialCommunityIcons)
                            iconComponent = (
                                <MaterialCommunityIcons
                                    name={focused ? 'medal' : 'medal-outline'}
                                    size={size}
                                    color={color}
                                />
                            );
                            break;

                        case 'Notifications':
                            // Thông Báo: Sử dụng 'bell' (MaterialCommunityIcons)
                            iconComponent = (
                                <MaterialCommunityIcons
                                    name={focused ? 'bell' : 'bell-outline'}
                                    size={size}
                                    color={color}
                                />
                            );
                            break;

                        case 'Account':
                            // Cài Đặt: Sử dụng 'cog' hoặc 'account-settings' (MaterialCommunityIcons)
                            iconComponent = (
                                <MaterialCommunityIcons
                                    name={focused ? 'account' : 'account-outline'}
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
                    height: Platform.OS === 'ios' ? 90 : 60, // Tăng chiều cao trên iOS để tính cả Safe Area
                    paddingBottom: Platform.OS === 'ios' ? 30 : 5, // Đệm dưới cho Android và iOS
                    paddingTop: 5,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
                headerShown: false, // Ẩn header mặc định của Tab
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: 'Khoá học' }}
            />
            <Tab.Screen
                name="ChatAI"
                component={ChatAIScreen}
                options={{ title: 'Chat AI' }}
            />
            <Tab.Screen
                name="Ranking"
                component={RankingScreen}
                options={{ title: 'Xếp hạng' }}
            />
            <Tab.Screen
                name="Notifications"
                component={NotificationScreen}
                options={{ title: 'Thông báo' }}
            />
            <Tab.Screen
                name="Account"
                component={AccountScreen}
                options={{ title: 'Tài khoản' }}
            />
        </Tab.Navigator>
    );
};

export default AppTabs;