import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import LearningPath, { LearningPathHandle } from '../../../components/LearningPath';
import LearningPathForTeacher from '../../../components/Teacher/LearningPathForTeacher';
import foxImage from '../../../../assets/images/logo/Elisa.png';

const LessonScreen: React.FC = () => {
    const [name, setName] = useState<string>('');

    // 1. CHỈ DÙNG STATE ĐỂ HIỂN THỊ NÚT X (True/False)
    // Không lưu toàn bộ text vào state để tránh re-render liên tục
    const [showClearButton, setShowClearButton] = useState(false);

    // 2. DÙNG REF ĐỂ LƯU TEXT TÌM KIẾM (Thay vì state)
    const searchTextRef = useRef('');

    const searchInputRef = useRef<TextInput>(null);
    const learningPathRef = useRef<LearningPathHandle>(null);
    const navigation = useNavigation<any>();
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const loadUser = async () => {
            const storedName = await AsyncStorage.getItem('fullName');
            if (storedName) setName(storedName);
            const storedRole = await AsyncStorage.getItem("role");
            if (storedRole) setRole(storedRole);
        };
        loadUser();
    }, []);

    // Hàm xử lý khi gõ chữ
    const handleChangeText = (text: string) => {
        // Cập nhật giá trị vào biến Ref (Không gây re-render)
        searchTextRef.current = text;

        // Chỉ re-render để hiện nút X khi cần thiết
        if (text.length > 0 && !showClearButton) {
            setShowClearButton(true);
        } else if (text.length === 0 && showClearButton) {
            setShowClearButton(false);
        }
    };

    const handleSearch = () => {
        if (learningPathRef.current) {
            // 3. LẤY GIÁ TRỊ TỪ REF ĐỂ TÌM KIẾM
            learningPathRef.current.scrollToLesson(searchTextRef.current);
        }
    };

    const handleClearSearch = () => {
        searchTextRef.current = '';   // Reset biến ref
        setShowClearButton(false);    // Ẩn nút X
        searchInputRef.current?.clear(); // Xóa chữ trên giao diện
        // Keyboard.dismiss(); // Có thể bỏ dòng này nếu muốn gõ tiếp luôn sau khi xóa
    };

    return (
        <SafeAreaView style={homeStyles.container} edges={['top', 'left', 'right']}>
            <View style={{ flex: 1 }}>

                {/* HEADER ... giữ nguyên ... */}
                <View style={homeStyles.header}>
                    <Image source={foxImage} style={homeStyles.avatar} resizeMode="contain" />
                    <View style={homeStyles.centerBox}>
                        <Text style={homeStyles.welcomeText}>Xin chào,</Text>
                        <Text style={homeStyles.username}>{name || 'Học viên'}</Text>
                    </View>
                    {role?.toLowerCase() === 'user' ? (
                        <TouchableOpacity onPress={() => navigation.navigate('SelfStudyScreen')}>
                            <Ionicons name="book-outline" size={30} color="#111827" />
                        </TouchableOpacity>
                    ) : role?.toLowerCase() === 'teacher' ? (
                        <TouchableOpacity onPress={() => navigation.navigate('AccountTeacherScreen')}>
                            <Ionicons name="person-circle-outline" size={35} color="#111827" />
                        </TouchableOpacity>
                    ) : null}
                </View>

                {/* SEARCH BAR */}
                <View style={homeStyles.searchContainer}>
                    <TouchableOpacity onPress={handleSearch}>
                        <Ionicons name="search" size={22} color="#6B7280" />
                    </TouchableOpacity>

                    <TextInput
                        ref={searchInputRef}
                        style={homeStyles.searchInput}
                        placeholder="Tìm bài học..."
                        placeholderTextColor="#9CA3AF"

                        // 4. KHÔNG TRUYỀN VALUE, CHỈ DÙNG DEFAULT VALUE
                        defaultValue=""

                        // 5. GỌI HÀM XỬ LÝ MỚI (KHÔNG SET STATE LIÊN TỤC)
                        onChangeText={handleChangeText}

                        returnKeyType="search"
                        onSubmitEditing={handleSearch}

                        // Tắt gợi ý để đỡ bị nhảy chữ trên iOS
                        autoCorrect={false}
                        spellCheck={false}
                    />

                    {/* 6. HIỂN THỊ NÚT X DỰA TRÊN BIẾN LOGIC */}
                    {showClearButton && (
                        <TouchableOpacity onPress={handleClearSearch}>
                            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>

                <LearningPathForTeacher ref={learningPathRef} />
            </View>
        </SafeAreaView>
    );
};

const homeStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center',
    },
    centerBox: { alignItems: 'center', flex: 1 },
    welcomeText: { fontSize: 16, color: '#6B7280' },
    username: { fontSize: 26, fontWeight: 'bold', color: '#111827' },
    avatar: { width: 50, height: 50 },
    searchContainer: {
        flexDirection: 'row', backgroundColor: '#F3F4F6', marginHorizontal: 20,
        paddingHorizontal: 12, paddingVertical: 12, borderRadius: 12,
        alignItems: 'center', marginBottom: 20,
    },
    searchInput: { marginLeft: 10, fontSize: 16, flex: 1, color: '#111' },
});

export default LessonScreen;