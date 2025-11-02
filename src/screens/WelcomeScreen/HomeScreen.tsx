import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import foxImage from '../../../assets/images/logo/Elisa.png';

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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* HEADER */}
        <View style={styles.header}>
          {/* Logo bên trái */}
          <Image source={foxImage} style={styles.avatar} resizeMode="contain" />

          {/* Chữ chào + tên ở giữa */}
          <View style={styles.centerBox}>
            <Text style={styles.welcomeText}>Xin chào,</Text>
            <Text style={styles.username}>{name || 'Học viên'}</Text>
          </View>

          {/* Nút SelfStudyScreen bên phải */}
          <TouchableOpacity onPress={() => navigation.navigate('SelfStudyScreen')}>
            <Ionicons name="book-outline" size={30} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* SEARCH */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={22} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm bài học, chủ đề, kỹ năng..."
            placeholderTextColor="#9CA3AF"
          />
        </View>

       
 
      </ScrollView>
    </SafeAreaView>
  );
};

const skills = [
  { title: 'Nghe', icon: 'headset-outline' },
  { title: 'Nói', icon: 'mic-outline' },
  { title: 'Đọc', icon: 'book-outline' },
  { title: 'Viết', icon: 'create-outline' },
  { title: 'Từ vựng', icon: 'leaf-outline' },
  { title: 'Ngữ pháp', icon: 'school-outline' },
];

const recommendedCourses = [
  { title: 'Giao tiếp cơ bản', desc: 'Phù hợp người mới bắt đầu' },
  { title: 'Luyện phát âm chuẩn', desc: 'Giọng Mỹ dễ học, dễ nghe' },
  { title: 'Ngữ pháp từ A → Z', desc: 'Ôn tập đầy đủ, chi tiết' },
];

const styles = StyleSheet.create({
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
    marginBottom: 20,
  },
  searchInput: { marginLeft: 10, fontSize: 16, flex: 1, color: '#111' },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 12,
    color: '#111827',
  },
  skillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  skillCard: {
    width: '30%',
    backgroundColor: '#EFF6FF',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  skillText: { marginTop: 8, color: '#1E3A8A', fontWeight: '600' },
  continueCard: {
    marginHorizontal: 20,
    backgroundColor: '#DBEAFE',
    padding: 16,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  continueTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 6, color: '#1E3A8A' },
  continueSubtitle: { fontSize: 14, color: '#1E40AF' },
  courseCard: {
    marginHorizontal: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  courseTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  courseDescription: { fontSize: 14, color: '#6B7280' },
});

export default HomeScreen;
