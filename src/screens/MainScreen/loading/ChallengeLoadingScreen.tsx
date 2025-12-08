import React from 'react';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/AuthStack';
import LoadingOverlay from '../../../components/LoadingOverlay'; // ✨ IMPORT COMPONENT TÁI SỬ DỤNG

type ChallengeLoadingScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ChallengeLoading'>;
type ChallengeLoadingRouteProp = RouteProp<AuthStackParamList, 'ChallengeLoading'>;

const ChallengeLoadingScreen: React.FC = () => {
    const navigation = useNavigation<ChallengeLoadingScreenNavigationProp>();
    const route = useRoute<ChallengeLoadingRouteProp>();

    const { lessonId, lessonTitle, section, targetRoute } = route.params;

    // ✨ ĐỊNH NGHĨA HÀM ĐIỀU HƯỚNG KHI TẢI XONG
    const handleComplete = () => {
        const destination = route.params.targetRoute || 'MultipleChoiceScreen';
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
                quoteText="Đây là thử thách để quyết định xem bạn đang ở cấp đô nào hãy cố gắng hoàn thành bài thi nghiêm túc nhé!"
                subtitleText={`Chuẩn bị cho thử thách: ${lessonTitle}`}
                // Truyền hàm điều hướng vào component
                onLoadingComplete={handleComplete}
                duration={2000} // Ví dụ: 2 giây tải
            />
        </SafeAreaView>
    );
};

export default ChallengeLoadingScreen;