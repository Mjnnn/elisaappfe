import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';

interface LessonCompletionModalProps {
    visible: boolean;
    onClose: () => void;
    xpGained: number;
}

const { width } = Dimensions.get('window');

const LessonCompletionModal: React.FC<LessonCompletionModalProps> = ({ visible, onClose, xpGained }) => {
    if (!visible) return null;

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <View style={styles.backdrop} />

                <Animatable.View
                    animation="bounceIn"
                    duration={600}
                    style={styles.modalContent}
                >
                    {/* Header Icon */}
                    <View style={styles.iconContainer}>
                        <Ionicons name="checkmark-circle" size={80} color="#58CC02" />
                    </View>

                    <Text style={styles.headerText}>HOÀN THÀNH!</Text>

                    <Text style={styles.subText}>
                        Bạn đã hoàn thành bài học xuất sắc.
                    </Text>

                    {/* Phần hiển thị XP */}
                    <View style={styles.xpBox}>
                        <Text style={styles.xpText}>+{xpGained} XP</Text>
                        <Text style={styles.xpLabel}>Kinh nghiệm kỹ năng</Text>
                    </View>

                    <TouchableOpacity style={styles.button} onPress={onClose}>
                        <Text style={styles.buttonText}>TIẾP TỤC</Text>
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
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalContent: {
        width: width * 0.8,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        elevation: 5,
    },
    iconContainer: {
        marginBottom: 15,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#58CC02',
        marginBottom: 10,
    },
    subText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    xpBox: {
        backgroundColor: '#FFF4D6', // Màu vàng nhạt
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 15,
        marginBottom: 25,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFD700'
    },
    xpText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#F59E0B', // Màu vàng đậm
    },
    xpLabel: {
        fontSize: 14,
        color: '#B45309',
        fontWeight: '600',
        marginTop: 5
    },
    button: {
        backgroundColor: '#3B82F6',
        paddingVertical: 12,
        paddingHorizontal: 50,
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

export default LessonCompletionModal;