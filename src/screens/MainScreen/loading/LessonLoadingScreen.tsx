import React from 'react';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/AuthStack';
import LoadingOverlay from '../../../components/LoadingOverlay'; // ✨ IMPORT COMPONENT TÁI SỬ DỤNG

type LessonLoadingScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'LessonLoading'>;
type LessonLoadingRouteProp = RouteProp<AuthStackParamList, 'LessonLoading'>;

const LessonLoadingScreen: React.FC = () => {
    const navigation = useNavigation<LessonLoadingScreenNavigationProp>();
    const route = useRoute<LessonLoadingRouteProp>();

    const { lessonId, lessonTitle, section, targetRoute } = route.params;

    // ✨ ĐỊNH NGHĨA HÀM ĐIỀU HƯỚNG KHI TẢI XONG
    const handleComplete = () => {
        const destination = route.params.targetRoute || 'VocabularyScreen';
        const params = {
            lessonId: route.params.lessonId,
            lessonTitle: route.params.lessonTitle,
            section: route.params.section,
        };
        // Sử dụng navigation.replace để xóa màn hình Loading khỏi stack
        navigation.replace(destination as any, params);
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <LoadingOverlay
                quoteText="Người học đạt 50 ngày streak sẽ tăng gấp 9 lần khả năng hoàn thành khóa học!"
                subtitleText={`Chuẩn bị cho bài học: ${lessonTitle}`}
                // Truyền hàm điều hướng vào component
                onLoadingComplete={handleComplete}
                duration={2000} // Ví dụ: 2 giây tải
            />
        </SafeAreaView>
    );
};

export default LessonLoadingScreen;