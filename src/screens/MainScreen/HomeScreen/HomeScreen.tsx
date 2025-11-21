import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// ✨ IMPORT COMPONENT LEARNING PATH
import LearningPath from '../../../components/LearningPath';

import foxImage from '../../../../assets/images/logo/Elisa.png';

const COLOR_GREEN = '#6AC200';

// Component Section Header
const SectionHeader: React.FC<{ title: string; subtitle: string; color: string }> = ({ title, subtitle, color }) => {
  return (
    <View style={[homeStyles.sectionHeader, { backgroundColor: color }]}>
      <Text style={homeStyles.sectionSubtitle}>{subtitle}</Text>
      <Text style={homeStyles.sectionTitleText}>{title}</Text>
      <TouchableOpacity style={homeStyles.menuIcon}>
        <Ionicons name="list" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const HomeScreen: React.FC = () => {
  const [name, setName] = React.useState<string>('');
  const navigation = useNavigation<any>();

  React.useEffect(() => {
    const loadUser = async () => {
      const storedName = await AsyncStorage.getItem('fullName');
      if (storedName) setName(storedName);
    };
    loadUser();
  }, []);

  return (
    <SafeAreaView style={homeStyles.container} edges={['top', 'left', 'right']}>
      {/* 1. KHÔNG SỬ DỤNG SCROLLVIEW Ở ĐÂY NỮA, DÙNG VIEW THAY THẾ */}
      <View style={{ flex: 1 }}>

        {/* HEADER CỐ ĐỊNH */}
        <View style={homeStyles.header}>
          <Image source={foxImage} style={homeStyles.avatar} resizeMode="contain" />
          <View style={homeStyles.centerBox}>
            <Text style={homeStyles.welcomeText}>Xin chào,</Text>
            <Text style={homeStyles.username}>{name || 'Học viên'}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('SelfStudyScreen')}>
            <Ionicons name="book-outline" size={30} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* SEARCH */}
        <View style={homeStyles.searchContainer}>
          <Ionicons name="search" size={22} color="#6B7280" />
          <TextInput
            style={homeStyles.searchInput}
            placeholder="Tìm bài học, chủ đề, kỹ năng..."
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* 2. RENDER LEARNING PATH (NÓ ĐÃ LÀ SCROLLVIEW) */}
        <LearningPath />
      </View>
    </SafeAreaView>
  );
};


// Đổi tên styles thành homeStyles để tránh xung đột với LearningPath
const homeStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
  },
  centerBox: { alignItems: 'center', flex: 1 },
  welcomeText: { fontSize: 16, color: '#6B7280' },
  username: { fontSize: 26, fontWeight: 'bold', color: '#111827' },
  avatar: { width: 50, height: 50 },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    marginHorizontal: 20,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20, // ✨ LOẠI BỎ MARGIN BOTTOM Ở ĐÂY
  },
  searchInput: { marginLeft: 10, fontSize: 16, flex: 1, color: '#111' },

  // --- Section Header Styles (Đã chuyển từ LearningPath) ---
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    height: 80,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'normal',
    position: 'absolute',
    top: 8,
    left: 20,
  },
  sectionTitleText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  menuIcon: {
    position: 'absolute',
    right: 20,
    padding: 5,
  },
  // ... (Các styles khác không liên quan đã được xóa/giữ nguyên)
});

export default HomeScreen;
