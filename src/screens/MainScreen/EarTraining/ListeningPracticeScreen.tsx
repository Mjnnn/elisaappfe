import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    StatusBar,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window');
// Điều chỉnh tính toán chiều rộng: (Màn hình - padding 2 bên - khoảng cách giữa 2 cột) / 2
const GAP_BETWEEN_CARDS = 15;
const CARD_WIDTH = (width - 40 - GAP_BETWEEN_CARDS) / 2;

interface LevelData {
    id: string;
    title: string;
    subtitle: string;
    color1: string;
    color2: string;
    icon: string;
    bgIcon: string;
}

const LEVELS_DATA: LevelData[] = [
    {
        id: 'A1',
        title: 'Beginner',
        subtitle: 'Khởi đầu hành trình',
        color1: '#FF6B6B',
        color2: '#EE5253',
        icon: 'sprout',
        bgIcon: 'seed',
    },
    {
        id: 'A2',
        title: 'Elementary',
        subtitle: 'Xây dựng nền tảng',
        color1: '#FF9F43',
        color2: '#F368E0',
        icon: 'ladder',
        bgIcon: 'stairs',
    },
    {
        id: 'B1',
        title: 'Intermediate',
        subtitle: 'Phát triển kỹ năng',
        color1: '#FDCB6E',
        color2: '#E1B12C',
        icon: 'bicycle',
        bgIcon: 'road-variant',
    },
    {
        id: 'B2',
        title: 'Upper-Inter',
        subtitle: 'Tự tin giao tiếp',
        color1: '#2ECC71',
        color2: '#00B894',
        icon: 'rocket-launch',
        bgIcon: 'cloud-outline',
    },
    {
        id: 'C1',
        title: 'Advanced',
        subtitle: 'Thành thạo chuyên sâu',
        color1: '#0984E3',
        color2: '#74B9FF',
        icon: 'trophy-award',
        bgIcon: 'podium',
    },
    {
        id: 'C2',
        title: 'Proficiency',
        subtitle: 'Chinh phục đỉnh cao',
        color1: '#6C5CE7',
        color2: '#A29BFE',
        icon: 'crown',
        bgIcon: 'diamond-stone',
    },
];

const CustomHeader = () => (
    <View style={styles.headerContainer}>
        <View style={styles.headerIconBubble}>
            <MaterialCommunityIcons name="headphones" size={28} color="#fff" />
        </View>
        <Text style={styles.headerTitle}>Dữ liệu video{'\n'}bài giảng hệ thống</Text>
        <MaterialCommunityIcons name="playlist-music" size={30} color="rgba(255,255,255,0.5)" style={{ position: 'absolute', right: 20 }} />
    </View>
);

interface LevelCardProps {
    item: LevelData;
    index: number;
    onPress: (id: string) => void;
}

const LevelCard: React.FC<LevelCardProps> = ({ item, index, onPress }) => {
    // Kiểm tra xem thẻ có phải là thẻ bên phải không để không thêm margin phải
    const isRightCard = index % 2 !== 0;

    return (
        <Animatable.View
            animation="bounceInUp"
            duration={800}
            delay={index * 150}
            style={{
                width: CARD_WIDTH,
                marginBottom: GAP_BETWEEN_CARDS + 5, // Khoảng cách dọc giữa các hàng
                marginRight: isRightCard ? 0 : GAP_BETWEEN_CARDS, // Khoảng cách ngang giữa các cột
            }}
        >
            <TouchableOpacity
                style={[styles.cardContainer, { backgroundColor: item.color1 }]}
                activeOpacity={0.8}
                onPress={() => onPress(item.id)}
            >
                <MaterialCommunityIcons
                    name={item.bgIcon}
                    size={100}
                    color="rgba(255,255,255,0.15)"
                    style={styles.cardBgIcon}
                />
                <View style={[styles.levelBadge, { backgroundColor: item.color2 }]}>
                    <Text style={styles.levelBadgeText}>{item.id}</Text>
                </View>
                <View style={styles.cardContent}>
                    <MaterialCommunityIcons name={item.icon} size={40} color="#fff" style={{ marginBottom: 10 }} />
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                </View>
                <View style={styles.playIconContainer}>
                    <MaterialCommunityIcons name="play-circle" size={24} color="#fff" />
                </View>
            </TouchableOpacity>
        </Animatable.View>
    );
};

const ListeningPracticeScreen = ({ navigation }: any) => {
    const handlePressLevel = (levelId: string) => {
        console.log(`Đã chọn cấp độ: ${levelId}`);
        navigation.navigate('LearnByLevelScreen', { levelId: levelId });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#4a69bd" />
            <CustomHeader />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.gridContainer}>
                    {LEVELS_DATA.map((item, index) => (
                        <LevelCard
                            key={item.id}
                            item={item}
                            index={index}
                            onPress={handlePressLevel}
                        />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

export default ListeningPracticeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F2F5',
    },
    headerContainer: {
        paddingTop: 50,
        paddingBottom: 25,
        paddingHorizontal: 20,
        backgroundColor: '#4a69bd',
        borderBottomRightRadius: 30,
        borderBottomLeftRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        marginBottom: 10,
        position: 'relative',
    },
    headerIconBubble: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 10,
        borderRadius: 50,
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        lineHeight: 28,
        flex: 1,
    },
    scrollContent: {
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        // justifyContent: 'space-between', // Đã bỏ để dùng margin thủ công
    },
    cardContainer: {
        height: 180,
        borderRadius: 20,
        padding: 15,
        position: 'relative',
        overflow: 'hidden',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    cardBgIcon: {
        position: 'absolute',
        bottom: -20,
        right: -20,
        transform: [{ rotate: '-15deg' }],
    },
    levelBadge: {
        position: 'absolute',
        top: 15,
        right: 15,
        paddingVertical: 5,
        paddingHorizontal: 12,
        borderRadius: 15,
        elevation: 2,
    },
    levelBadgeText: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 14,
    },
    cardContent: {
        flex: 1,
        justifyContent: 'center',
        marginTop: 10,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    cardSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '500',
    },
    playIconContainer: {
        position: 'absolute',
        bottom: 15,
        left: 15,
    }
});