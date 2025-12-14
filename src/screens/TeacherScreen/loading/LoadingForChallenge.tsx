import React from 'react';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/AuthStack';
import LoadingOverlay from '../../../components/LoadingOverlay';

type LoadingForChallengeScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'LoadingForChallenge'>;
type LoadingForChallengeRouteProp = RouteProp<AuthStackParamList, 'LoadingForChallenge'>;

const LoadingForChallenge: React.FC = () => {
    const navigation = useNavigation<LoadingForChallengeScreenNavigationProp>();
    const route = useRoute<LoadingForChallengeRouteProp>();

    const { quoteText, subtitleText, lessonId, lessonTitle, section, targetRoute } = route.params;

    // ✨ ĐỊNH NGHĨA HÀM ĐIỀU HƯỚNG KHI TẢI XONG
    const handleComplete = () => {
        const destination = route.params.targetRoute || 'AppTabChallenge';
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
                quoteText={`${quoteText}`}

                // Thay đổi subtitle để báo hiệu đang vào mode chỉnh sửa
                subtitleText={`${subtitleText}`}

                onLoadingComplete={handleComplete}
                duration={4000}
            />
        </SafeAreaView>
    );
};

export default LoadingForChallenge;