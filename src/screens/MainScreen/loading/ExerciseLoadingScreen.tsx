import React from 'react';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/AuthStack';
import LoadingOverlay from '../../../components/LoadingOverlay'; // ✨ IMPORT COMPONENT TÁI SỬ DỤNG

type ExerciseLoadingScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ExerciseLoading'>;
type ExerciseLoadingRouteProp = RouteProp<AuthStackParamList, 'ExerciseLoading'>;

const ExcerciseLoadingScreen: React.FC = () => {
    const navigation = useNavigation<ExerciseLoadingScreenNavigationProp>();
    const route = useRoute<ExerciseLoadingRouteProp>();
    const { lessonId, lessonTitle, section, targetRoute } = route.params;

    // ✨ ĐỊNH NGHĨA HÀM ĐIỀU HƯỚNG KHI TẢI XONG
    const handleComplete = () => {
        const destination = route.params.targetRoute || 'ExerciseScreen';
        const params = {
            lessonId: route.params.lessonId,
            lessonTitle: route.params.lessonTitle,
            section: route.params.section
        };
        // Sử dụng navigation.replace để xóa màn hình Loading khỏi stack
        navigation.replace(destination as any, params);
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <LoadingOverlay
                quoteText={`Chúc mừng! Bạn vừa hoàn thành xong nội dung bài học chủ đề ${lessonTitle}. Hãy cùng luyện tập cùng mình nhé.`}
                subtitleText={`Chuẩn bị luyện tập cho chủ đề: ${lessonTitle}`}
                // Truyền hàm điều hướng vào component
                onLoadingComplete={handleComplete}
                duration={4000} // Ví dụ: 2 giây tải
            />
        </SafeAreaView>
    );
};

export default ExcerciseLoadingScreen;