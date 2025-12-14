import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../../navigation/AuthStack';
import foxImage from '../../../../assets/images/logo/Elisa.png'; // Đảm bảo đường dẫn đúng
import { EnglishGrammarResponse } from '../../../types/response/GrammarResponse';
import grammarService from '../../../services/grammarService';

// Định nghĩa kiểu Route
type GrammarScreenRouteProp = RouteProp<AuthStackParamList, 'GrammarScreen'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- Component hiển thị thẻ Ngữ pháp (Giữ nguyên như cũ) ---
const GrammarCard: React.FC<{ item: EnglishGrammarResponse; index: number }> = ({ item, index }) => {
    const cardColors = ['#E3F2FD', '#F3E5F5', '#E8F5E9', '#FFF3E0', '#FBE9E7'];
    const accentColor = cardColors[index % cardColors.length];

    return (
        <View style={[styles.card, { backgroundColor: '#FFF' }]}>
            <View style={[styles.cardHeader, { backgroundColor: accentColor }]}>
                <View style={styles.iconCircle}>
                    <Text style={styles.indexText}>{index + 1}</Text>
                </View>
                <Text style={styles.cardTitle}>{item.grammarTitle}</Text>
            </View>

            <View style={styles.cardBody}>
                {/* Cấu trúc */}
                <View style={styles.sectionRow}>
                    <MaterialCommunityIcons name="function-variant" size={24} color="#FF9800" style={styles.icon} />
                    <View style={styles.textContainer}>
                        <Text style={styles.label}>Cấu trúc:</Text>
                        <View style={styles.formulaBox}>
                            <Text style={styles.formulaText}>{item.grammarContent}</Text>
                        </View>
                    </View>
                </View>

                {/* Cách dùng */}
                <View style={styles.sectionRow}>
                    <MaterialCommunityIcons name="information-outline" size={24} color="#2196F3" style={styles.icon} />
                    <View style={styles.textContainer}>
                        <Text style={styles.label}>Cách dùng:</Text>
                        <Text style={styles.contentText}>{item.grammarUsage}</Text>
                    </View>
                </View>

                {/* Ví dụ */}
                <View style={styles.sectionRow}>
                    <MaterialCommunityIcons name="lightbulb-on-outline" size={24} color="#4CAF50" style={styles.icon} />
                    <View style={styles.textContainer}>
                        <Text style={styles.label}>Ví dụ:</Text>
                        <Text style={styles.exampleText}>"{item.grammarExample}"</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

// --- Component Chính ---
const GrammarScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp<AuthStackParamList>>();
    const route = useRoute<GrammarScreenRouteProp>();

    // Lấy lessonId từ params
    const { lessonId, lessonTitle, section } = route.params;
    const newSection = section + 1;
    const oldSection = 1;

    const [grammarData, setGrammarData] = useState<EnglishGrammarResponse[]>([]);
    const [loading, setLoading] = useState(true);

    // --- Hàm gọi API (Đã cập nhật) ---
    const fetchGrammarData = async () => {
        // Kiểm tra lessonId hợp lệ
        if (!lessonId) {
            Alert.alert("Lỗi", "Không tìm thấy ID bài học.");
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            console.log(`Fetching grammar for lessonId: ${lessonId}`);

            // Gọi API từ Service
            const response = await grammarService.getGrammarTheoriesByLesson(lessonId);

            // Vì service đã định nghĩa trả về mảng EnglishGrammarResponse[]
            // nên ta có thể set trực tiếp response.data
            if (response.data && Array.isArray(response.data)) {
                setGrammarData(response.data);
            } else {
                // Trường hợp backend trả về rỗng hoặc format lạ (fallback)
                console.warn("Dữ liệu trả về không phải là mảng:", response.data);
                setGrammarData([]);
            }

        } catch (error) {
            console.log("Lỗi tải ngữ pháp:", error);
            Alert.alert("Thông báo", "Không thể tải dữ liệu ngữ pháp. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    // Gọi API khi component được mount hoặc lessonId thay đổi
    useEffect(() => {
        fetchGrammarData();
    }, [lessonId]);


    const handleComplete = () => {
        console.log("GrammarSection: ", { section });
        navigation.navigate('ExerciseLoading', {
            lessonId: lessonId,
            lessonTitle: lessonTitle,
            section: newSection,
            targetRoute: 'ExerciseScreen'
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={{ marginTop: 10, color: '#666' }}>Đang tải ngữ pháp...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('VocabularyScreen', { lessonId, lessonTitle, section: oldSection })} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ngữ Pháp Trọng Tâm</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Intro */}
                <View style={styles.introContainer}>
                    <Image source={foxImage} style={styles.mascotImage} resizeMode="contain" />
                    <View style={styles.bubble}>
                        <Text style={styles.bubbleText}>
                            Đây là các cấu trúc ngữ pháp có trong bài học này!
                        </Text>
                    </View>
                </View>

                {/* List Data */}
                {grammarData.length === 0 ? (
                    <View style={{ alignItems: 'center', marginTop: 50 }}>
                        <Ionicons name="document-text-outline" size={60} color="#DDD" />
                        <Text style={styles.noDataText}>Chưa có dữ liệu ngữ pháp cho bài này.</Text>
                    </View>
                ) : (
                    grammarData.map((item, index) => (
                        // Sử dụng grammarId làm key nếu có, nếu không dùng index
                        <GrammarCard key={item.grammarId || index} item={item} index={index} />
                    ))
                )}

                {/* Button */}
                {grammarData.length > 0 && (
                    <TouchableOpacity style={styles.finishButton} onPress={handleComplete}>
                        <Text style={styles.finishButtonText}>Đã hiểu, Hoàn thành!</Text>
                    </TouchableOpacity>
                )}

                <View style={{ height: 30 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

// Styles giữ nguyên như cũ
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    backButton: { padding: 5 },
    scrollContent: { padding: 20 },
    noDataText: { textAlign: 'center', marginTop: 10, fontSize: 16, color: '#999' },
    introContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
        backgroundColor: '#E3F2FD',
        padding: 15,
        borderRadius: 16,
    },
    mascotImage: { width: 60, height: 60, marginRight: 15 },
    bubble: { flex: 1 },
    bubbleText: { fontSize: 15, color: '#1565C0', fontWeight: '500' },
    card: {
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#EFEFEF',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    iconCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    indexText: { fontWeight: 'bold', color: '#333' },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', flex: 1 },
    cardBody: { padding: 15 },
    sectionRow: {
        flexDirection: 'row',
        marginBottom: 15,
        alignItems: 'flex-start',
    },
    icon: { marginRight: 12, marginTop: 2 },
    textContainer: { flex: 1 },
    label: { fontSize: 14, color: '#888', marginBottom: 4, fontWeight: '600', textTransform: 'uppercase' },
    formulaBox: {
        backgroundColor: '#FFF3E0',
        padding: 8,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    formulaText: { fontSize: 16, fontWeight: 'bold', color: '#E65100', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
    contentText: { fontSize: 16, color: '#333', lineHeight: 22 },
    exampleText: { fontSize: 16, color: '#2E7D32', fontStyle: 'italic', lineHeight: 22 },
    finishButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: "#3B82F6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    finishButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});

export default GrammarScreen;