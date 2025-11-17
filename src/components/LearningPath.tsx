import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Platform, NativeSyntheticEvent, NativeScrollEvent, Animated } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { learningPathData, PathNode } from '../services/data/LearningPathData';
import foxImage from '../../assets/images/logo/Elisa.png';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const NODE_SIZE = 70;
const NODE_MARGIN = 20;
const ALIGNMENT_PADDING = 25;
const PATH_LINE_WIDTH = 10;
const COLOR_PRIMARY = '#3B82F6';
const COLOR_GREEN = '#6AC200';
const COLOR_CHALLENGE = '#FF5722';
const COLOR_TREASURE = '#FFD700';

// Khai báo kiểu cho SectionColors
type SectionConfig = {
    background: string;
    title: string;
};

// Sử dụng SectionColorsMap để chỉ định rõ các khóa là chuỗi ('1', '2', '3')
type SectionColorsMap = {
    '1': SectionConfig;
    '2': SectionConfig;
    '3': SectionConfig;
};

// ✨ FIX LỖI: Sử dụng các khóa là chuỗi cố định
const sectionColors: SectionColorsMap = {
    '1': { background: '#F0FFF0', title: 'I. Cấp độ A1 - A2 (Cơ bản)' },
    '2': { background: '#FFF8F0', title: 'II. Cấp độ B1 - B2 (Trung cấp)' },
    '3': { background: '#F0F0FF', title: 'III. Cấp độ C1 - C2 (Nâng cao)' },
};

// Ngưỡng cuộn Y để xác định Section mới bắt đầu
const SECTION_HEIGHT = 15 * (NODE_SIZE + NODE_MARGIN * 2);

// Component PathNodeIcon (Giữ nguyên)
const PathNodeIcon: React.FC<PathNode> = ({ type, status, level, id }) => {
    let iconContent: React.ReactElement | null = null;
    let nodeStyle: any = { backgroundColor: COLOR_PRIMARY, borderColor: 'white' };

    const baseStyle = {
        width: NODE_SIZE,
        height: NODE_SIZE,
        borderRadius: NODE_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: status === 'active' ? 5 : 2,
    };

    if (status === 'locked') {
        nodeStyle.backgroundColor = '#E0E0E0';
        nodeStyle.borderColor = '#C0C0C0';
    } else if (status === 'completed') {
        nodeStyle.backgroundColor = COLOR_GREEN;
        nodeStyle.borderColor = 'white';
    } else if (status === 'active') {
        nodeStyle.backgroundColor = COLOR_PRIMARY;
        nodeStyle.borderColor = 'white';
    } else if (status === 'unlocked' && type !== 'treasure') {
        nodeStyle.backgroundColor = COLOR_PRIMARY;
    }

    if (type === 'lesson') {
        iconContent = <Ionicons name="star" size={NODE_SIZE * 0.4} color="white" />;
        if (status === 'locked') {
            iconContent = <Ionicons name="lock-closed-outline" size={NODE_SIZE * 0.4} color="white" />;
        }
    } else if (type === 'treasure') {
        nodeStyle.backgroundColor = status === 'locked' ? '#E0E0E0' : COLOR_TREASURE;

        if (status === 'active') {
            nodeStyle.backgroundColor = COLOR_PRIMARY
            iconContent = (
                <MaterialCommunityIcons name="treasure-chest" size={NODE_SIZE * 0.6} color={'#FFFFFF'} />
            );
        }
        else if (status !== 'locked') {
            iconContent = (
                <MaterialCommunityIcons name="gift-open" size={NODE_SIZE * 0.6} color="#FFFFFF" />
            );
        } else {
            iconContent = (
                <MaterialCommunityIcons name="treasure-chest" size={NODE_SIZE * 0.6} color={'#999'} />
            );
        }
    } else if (type === 'challenge') {
        nodeStyle.backgroundColor = status === 'locked' ? '#E0E0E0' : COLOR_CHALLENGE;
        iconContent = <Ionicons name="trophy" size={NODE_SIZE * 0.4} color="white" />;
    }

    let finalContent = iconContent;
    if (level && level > 3 && status !== 'locked') {
        nodeStyle.backgroundColor = '#9932CC';
        nodeStyle.borderColor = 'white';
        finalContent = <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white' }}>{String(level)}</Text>
    }

    return (
        <TouchableOpacity
            style={[baseStyle, nodeStyle, styles.nodeShadow]}
            disabled={status === 'locked'}
            onPress={() => console.log(`Bắt đầu học Node ${level || type} - ID ${id}`)}
            activeOpacity={0.8}
        >
            {finalContent}
        </TouchableOpacity>
    );
};


// Component Chính
const LearningPath: React.FC = () => {
    const scrollViewRef = useRef<ScrollView>(null);
    const [currentSection, setCurrentSection] = useState(1);
    // FIX: Ban đầu dùng khóa chuỗi
    const [sectionTitle, setSectionTitle] = useState(sectionColors['1'].title);

    const animatedBackgroundColor = useRef(new Animated.Value(0)).current;

    // --- Logic Xử lý Màu Nền Động ---
    const interpolateColor = (sectionId: number) => {
        // ✨ FIX LỖI: Truy cập khóa bằng chuỗi
        const currentSectionKey = String(currentSection) as keyof SectionColorsMap;
        const sectionIdKey = String(sectionId) as keyof SectionColorsMap;

        const startColor = sectionColors[currentSectionKey].background;
        const endColor = sectionColors[sectionIdKey].background;

        animatedBackgroundColor.setValue(0);
        Animated.timing(animatedBackgroundColor, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false,
        }).start();

        return animatedBackgroundColor.interpolate({
            inputRange: [0, 1],
            outputRange: [startColor, endColor],
        });
    };

    // --- Logic Theo dõi Cuộn (Scroll Tracking) ---
    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const yOffset = event.nativeEvent.contentOffset.y;
        let newSection = currentSection;

        // Tính toán vị trí Section
        if (yOffset < SECTION_HEIGHT) {
            newSection = 1;
        } else if (yOffset < SECTION_HEIGHT * 2) {
            newSection = 2;
        } else {
            newSection = 3;
        }

        if (newSection !== currentSection) {
            // Chuyển màu và cập nhật tiêu đề
            setCurrentSection(newSection);
            // Cập nhật tiêu đề bằng khóa chuỗi
            setSectionTitle(sectionColors[String(newSection) as keyof SectionColorsMap].title);
        }
    };

    // --- Logic Khởi động (Chạy màu nền ban đầu) ---
    React.useEffect(() => {
        // Logic cuộn tự động giữ nguyên
        const activeNodeIndex = learningPathData.findIndex(node => node.status === 'active');
        if (activeNodeIndex !== -1) {
            const y = activeNodeIndex * (NODE_SIZE + NODE_MARGIN * 2) - Dimensions.get('window').height / 3;
            setTimeout(() => {
                scrollViewRef.current?.scrollTo({ y: y > 0 ? y : 0, animated: true });
            }, 100);
        }
    }, []);

    // --- Logic Render Nodes ---
    const renderPathNodes = () => {
        return learningPathData.map((node, index) => {
            const isRightAligned = index % 2 !== 0;
            const topOffset = index * (NODE_SIZE + NODE_MARGIN * 2);

            const style = {
                position: 'absolute' as 'absolute',
                right: isRightAligned ? null : SCREEN_WIDTH / 2 + ALIGNMENT_PADDING,
                left: isRightAligned ? SCREEN_WIDTH / 2 + ALIGNMENT_PADDING : null,
                top: topOffset,
                alignItems: isRightAligned ? 'flex-start' as 'flex-start' : 'flex-end' as 'flex-end',
            };

            // Thêm tiêu đề Section (ví dụ: ngay trước Node đầu tiên của Section)
            let sectionHeader = null;
            if (node.id === 16 || node.id === 31) { // Bắt đầu Section 2 (id 16) và Section 3 (id 31)
                // Truy cập bằng khóa chuỗi
                const sectionKey = String(node.section) as keyof SectionColorsMap;
                sectionHeader = (
                    <View style={{ width: '100%', alignItems: 'center', marginTop: 50, marginBottom: 50 }}>
                        <Text style={styles.sectionDividerText}>{sectionColors[sectionKey].title}</Text>
                        <View style={styles.sectionDividerLine} />
                    </View>
                );
            }


            return (
                <View key={node.id} style={style}>
                    {/* {sectionHeader} */}
                    <Text style={[styles.lessonNameText, { textAlign: isRightAligned ? 'left' : 'right' }]}>
                        {node.title}
                    </Text>
                    <PathNodeIcon {...node} />
                </View>
            );
        });
    };

    // Chiều cao tổng của con đường học tập
    // const pathHeight = learningPathData.length * (NODE_SIZE + NODE_MARGIN * 2) + 200;
    const totalNodesHeight = learningPathData.length * (NODE_SIZE + NODE_MARGIN * 2);
    const pathHeight = totalNodesHeight + (SCREEN_HEIGHT / 2) - 400;

    return (
        // Component chứa toàn bộ giao diện (sẽ thay đổi màu nền)
        // FIX: Truy cập màu nền bằng hàm interpolateColor
        <Animated.View style={[styles.animatedContainer, { backgroundColor: interpolateColor(currentSection) }]}>

            {/* Tiêu đề Section (Cấp độ B1-B2) cố định ở trên cùng */}
            <View style={styles.fixedSectionHeader}>
                <Text style={styles.fixedSectionTitle}>{sectionTitle}</Text>
            </View>

            <ScrollView
                ref={scrollViewRef}
                style={styles.pathScrollView}
                contentContainerStyle={[styles.pathContainer, { height: pathHeight }]}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >

                {/* Render các Node Bài học */}
                {renderPathNodes()}


            </ScrollView>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    animatedContainer: {
        flex: 1,

    },
    fixedSectionHeader: {
        position: 'absolute',
        top: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: 10,
        alignItems: 'center', // ✨ FIX: Căn giữa nội dung bên trong header
        justifyContent: 'center', // ✨ FIX: Đảm bảo nội dung được căn giữa
        width: SCREEN_WIDTH, // Đảm bảo nó vẫn chiếm toàn bộ chiều rộng
        zIndex: 100,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        borderBottomLeftRadius: 70,
        borderBottomRightRadius: 70,
    },
    fixedSectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLOR_PRIMARY,
    },
    pathScrollView: {
        flex: 1,
        marginTop: 50, // Tạo khoảng trống cho fixedSectionHeader
    },
    pathContainer: {
        width: '100%',
        paddingTop: 50,
    },
    pathLine: {
        position: 'absolute',
        width: PATH_LINE_WIDTH,
        backgroundColor: '#E0E0E0',
        left: '50%',
        transform: [{ translateX: -(PATH_LINE_WIDTH / 2) }],
        top: 0,
    },
    lessonNameText: {
        width: 150,
        marginBottom: 5,
        fontSize: 14,
        fontWeight: '600',
        color: '#4B4B4B',
    },
    nodeShadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    character: {
        position: 'absolute',
        width: 80,
        height: 80,
        zIndex: 1,
    },
    // Divider Styles
    sectionDividerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    sectionDividerLine: {
        width: '50%',
        height: 2,
        backgroundColor: COLOR_PRIMARY,
    },
});

export default LearningPath;