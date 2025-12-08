import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Dimensions, StatusBar } from 'react-native';
import foxImage from '../../assets/images/logo/Elisa.png';

// Lấy cả chiều rộng và chiều cao
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const LOADING_DURATION_MS = 5000;

interface LoadingOverlayProps {
    mainText?: string;
    quoteText: string;
    subtitleText?: string;
    onLoadingComplete: () => void;
    duration?: number;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
    mainText = "ĐANG TẢI...",
    quoteText,
    subtitleText,
    onLoadingComplete,
    duration = LOADING_DURATION_MS,
}) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            // console.log("Loading complete...");
            onLoadingComplete();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onLoadingComplete]);

    return (
        <View style={styles.container}>
            {/* Set StatusBar trong suốt để background ăn lên trên cùng */}
            <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

            <View style={styles.imageContainer}>
                <Image
                    source={foxImage}
                    style={styles.characterImage}
                    resizeMode="contain"
                />
                <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 30 }} />
            </View>

            <View style={styles.textContainer}>
                <Text style={styles.loadingText}>{mainText}</Text>
                <Text style={styles.quoteText}>{quoteText}</Text>
                {subtitleText && (
                    <Text style={styles.loadingSubtitle}>
                        {subtitleText}
                    </Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        // --- THAY ĐỔI QUAN TRỌNG Ở ĐÂY ---
        position: 'absolute', // Đặt vị trí tuyệt đối để thoát khỏi luồng layout bình thường
        top: 0,
        left: 0,
        width: SCREEN_WIDTH,  // Bắt buộc chiều rộng bằng màn hình
        height: SCREEN_HEIGHT, // Bắt buộc chiều cao bằng màn hình
        zIndex: 9999,         // Đảm bảo nó nổi lên trên tất cả các view khác
        backgroundColor: '#e3f2faff',
        justifyContent: 'space-between',
        paddingVertical: SCREEN_HEIGHT * 0.1,
    },
    imageContainer: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'flex-end',
    },
    characterImage: {
        width: 150,
        height: 150,
    },
    textContainer: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 40,
        justifyContent: 'flex-start',
        marginTop: 50,
    },
    loadingText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    quoteText: {
        fontSize: 18,
        textAlign: 'center',
        color: '#4B4B4B',
        lineHeight: 28,
        fontWeight: '600',
    },
    loadingSubtitle: {
        fontSize: 14,
        color: '#888',
        marginTop: 20,
    }
});

export default LoadingOverlay;