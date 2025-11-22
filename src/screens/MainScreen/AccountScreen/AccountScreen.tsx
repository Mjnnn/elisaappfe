import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AccountScreen: React.FC = () => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>⚙️ Cài Đặt</Text>
                <Text style={styles.subtitle}>Quản lý tài khoản, thông báo và tùy chỉnh ứng dụng.</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#4B4B4B',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
});

export default AccountScreen;
