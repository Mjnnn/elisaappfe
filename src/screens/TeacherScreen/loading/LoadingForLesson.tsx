import React from 'react';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/AuthStack';
import LoadingOverlay from '../../../components/LoadingOverlay'; // ✨ IMPORT COMPONENT TÁI SỬ DỤNG

type LoadingForLessonScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'LoadingForLesson'>;
type LoadingForLessonRouteProp = RouteProp<AuthStackParamList, 'LoadingForLesson'>;

const LoadingForLesson: React.FC = () => {
    const navigation = useNavigation<LoadingForLessonScreenNavigationProp>();
    const route = useRoute<LoadingForLessonRouteProp>();

    const { lessonId, lessonTitle, section, targetRoute } = route.params;

    // ✨ ĐỊNH NGHĨA HÀM ĐIỀU HƯỚNG KHI TẢI XONG
    const handleComplete = () => {
        const destination = route.params.targetRoute || 'AppTabLesson';
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
                // Thay đổi quote thành thông báo về quyền truy cập hoặc hệ thống
                quoteText="Đang kích hoạt chế độ Giáo viên. Giáo viên hãy cân nhắc giáo trình vì mọi thay đổi sẽ ảnh hưởng trực tiếp đến lộ trình của học viên. "

                // Thay đổi subtitle để báo hiệu đang vào mode chỉnh sửa
                subtitleText={`Đang tải dữ liệu cấu hình bài: ${lessonTitle}`}

                onLoadingComplete={handleComplete}
                duration={4000}
            />
        </SafeAreaView>
    );
};

export default LoadingForLesson;