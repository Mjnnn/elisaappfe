import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import * as Animatable from 'react-native-animatable';
import ConfettiCannon from 'react-native-confetti-cannon';

// 1. Định nghĩa kiểu dữ liệu cho thông tin Level
export interface LevelData {
    achievementID: number;
    title: string;
    min_xp: number;
    max_xp: number;
    icon_url?: string | null; // Dấu ? nghĩa là có thể không có
    description?: string;
}

// 2. Định nghĩa kiểu dữ liệu cho Props của Component
interface LevelUpModalProps {
    visible: boolean;
    onClose: () => void;
    levelData: LevelData | null;
}

const { width } = Dimensions.get('window');

const LevelUpModal: React.FC<LevelUpModalProps> = ({ visible, onClose, levelData }) => {
    // Nếu không hiển thị hoặc chưa có data thì không render gì cả
    if (!visible || !levelData) return null;

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Nền đen mờ */}
                <View style={styles.backdrop} />

                {/* Pháo giấy */}
                <ConfettiCannon count={200} origin={{ x: -10, y: 0 }} fadeOut={true} />

                {/* Nội dung Modal */}
                <Animatable.View
                    animation="zoomIn"
                    duration={500}
                    style={styles.modalContent}
                >
                    <Text style={styles.headerText}>🎉 LEVEL UP! 🎉</Text>

                    <Animatable.Image
                        animation="pulse"
                        easing="ease-out"
                        iterationCount="infinite"
                        // Xử lý ảnh fallback nếu icon_url bị null
                        source={{ uri: levelData.icon_url ?? 'https://img.icons8.com/color/480/medal.png' }}
                        style={styles.rankImage}
                        resizeMode="contain"
                    />

                    <Text style={styles.congratsText}>Chúc mừng bạn đạt danh hiệu</Text>
                    <Text style={styles.rankTitle}>{levelData.title}</Text>

                    <Text style={styles.description}>
                        {levelData.description || "Kỹ năng của bạn đã tiến bộ vượt bậc!"}
                    </Text>

                    <TouchableOpacity style={styles.button} onPress={onClose}>
                        <Text style={styles.buttonText}>TUYỆT VỜI</Text>
                    </TouchableOpacity>

                </Animatable.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalContent: {
        width: width * 0.85,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFD700',
        marginBottom: 15,
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    rankImage: {
        width: 120,
        height: 120,
        marginBottom: 15,
    },
    congratsText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 5,
    },
    rankTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2E86C1',
        marginBottom: 15,
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        marginBottom: 25,
        paddingHorizontal: 10,
        fontStyle: 'italic'
    },
    button: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 25,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    }
});

export default LevelUpModal;