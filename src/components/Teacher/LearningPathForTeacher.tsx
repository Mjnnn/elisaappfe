import React, { useRef, useState, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Dimensions, NativeSyntheticEvent, NativeScrollEvent,
    Animated, ActivityIndicator, Modal, Alert, Keyboard
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable';

// --- IMPORT DATA & TYPES (Đảm bảo đường dẫn đúng với project của bạn) ---
import { learningPathData, PathNode, NodeStatus } from '../../services/data/LearningPathData';
import userProgressService from '../../services/userProgressService';
import userXPService from '../../services/userXPService';
import { UserProgressResponse } from '../../types/response/UserProgressResponse';
import notificationService from '../../services/notificationService';
import { rankingData, getAchievementID, getRankIconByID } from '../../services/data/RankingData';
import LevelUpModal, { LevelData } from '../LevelUpModal';

// --- CẤU HÌNH UI ---
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const NODE_SIZE = 70;
const NODE_MARGIN = 20;
const ALIGNMENT_PADDING = 25;
const SECTION_HEIGHT = 15 * (NODE_SIZE + NODE_MARGIN * 2);

// Màu sắc chủ đạo
const COLOR_PRIMARY = '#3B82F6';
const COLOR_GREEN = '#6AC200';
const COLOR_CHALLENGE = '#FF5722';
const COLOR_TREASURE = '#FFD700';

// Types
type RenderedNode = PathNode & { status: NodeStatus };
type SectionColorsMap = { [key: string]: { background: string; title: string; } };

const sectionColors: SectionColorsMap = {
    '1': { background: '#F0FFF0', title: 'I. Cấp độ A1 - A2 (Cơ bản)' },
    '2': { background: '#FFF8F0', title: 'II. Cấp độ B1 - B2 (Trung cấp)' },
    '3': { background: '#F0F0FF', title: 'III. Cấp độ C1 - C2 (Nâng cao)' },
};

// --- INTERFACE CHO REF ---
export interface LearningPathHandle {
    scrollToLesson: (searchText: string) => void;
}

interface PathNodeIconProps extends RenderedNode {
    onPress: (node: RenderedNode) => void;
}

const PathNodeIcon: React.FC<PathNodeIconProps> = (props) => {
    const { title, type, level, status, onPress } = props;
    let iconContent: React.ReactElement | null = null;
    let nodeStyle: any = { backgroundColor: COLOR_PRIMARY, borderColor: 'white' };
    const baseStyle = {
        width: NODE_SIZE,
        height: NODE_SIZE,
        borderRadius: NODE_SIZE / 2,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        borderWidth: status === 'active' ? 5 : 2,
    };

    nodeStyle.backgroundColor = COLOR_PRIMARY; nodeStyle.borderColor = 'white';

    if (type === 'lesson') {
        iconContent = <Ionicons name="star" size={NODE_SIZE * 0.4} color="white" />;
        // Trong Teacher Mode, dù 'locked' (nếu có lỗi logic) cũng không hiện khóa để dễ nhận biết
    } else if (type === 'treasure') {
        nodeStyle.backgroundColor = COLOR_TREASURE; iconContent = <MaterialCommunityIcons name="treasure-chest" size={NODE_SIZE * 0.6} color={'#FFFFFF'} />;

    } else if (type === 'challenge') {
        nodeStyle.backgroundColor = COLOR_CHALLENGE;
        iconContent = <Ionicons name="trophy" size={NODE_SIZE * 0.4} color="white" />;
    }

    let finalContent = iconContent;
    if (level && level > 2 && status == 'active') {
        nodeStyle.backgroundColor = '#9932CC';
        finalContent = (
            <Ionicons name="flame" size={NODE_SIZE * 0.4} color="white" />
        );
    }

    return (
        <TouchableOpacity style={[baseStyle, nodeStyle, styles.nodeShadow]} disabled={status === 'locked'} onPress={() => onPress(props)} activeOpacity={0.8}>
            {finalContent}
        </TouchableOpacity>
    );
};

// ============================================================================
// 3. COMPONENT CHÍNH (LEARNING PATH SCREEN) - CÓ FORWARD REF
// ============================================================================
const LearningPathForTeacher = forwardRef<LearningPathHandle, {}>((props, ref) => {
    const navigation = useNavigation<any>();
    const scrollViewRef = useRef<ScrollView>(null);
    const animatedBackgroundColor = useRef(new Animated.Value(0)).current;

    // Teacher Mode: Không cần state isLoading chặn UI
    const [currentSection, setCurrentSection] = useState(1);
    const [sectionTitle, setSectionTitle] = useState(sectionColors['1'].title);

    // --- EXPOSE FUNCTION CHO COMPONENT CHA (HOME SCREEN) ---
    useImperativeHandle(ref, () => ({
        scrollToLesson: (searchText: string) => {
            if (!searchText.trim()) return;

            // Hàm chuẩn hóa chuỗi để so sánh (bỏ dấu, viết thường)
            const normalizeStr = (str: string) => {
                return str
                    .normalize("NFC") // Chuẩn hóa về dạng Unicode dựng sẵn
                    .trim()
                    .toLowerCase();
            };

            const searchKey = normalizeStr(searchText);

            // Tìm node đầu tiên có tên chứa từ khóa
            const foundIndex = learningPathData.findIndex(node =>
                normalizeStr(node.title).includes(searchKey)
            );
            if (foundIndex !== -1) {
                // Tính toán vị trí Y: index * (chiều cao node + margin)
                // Trừ đi 1/3 màn hình để node nằm giữa màn hình thay vì sát mép trên
                const y = foundIndex * (NODE_SIZE + NODE_MARGIN * 2) - SCREEN_HEIGHT / 3;

                scrollViewRef.current?.scrollTo({
                    y: y > 0 ? y : 0,
                    animated: true
                });
                Keyboard.dismiss(); // Ẩn bàn phím
            } else {
                Alert.alert("Rất tiếc", `Không tìm thấy bài học nào có tên "${searchText}"`);
            }
        }
    }));

    // Vẫn fetch progress ngầm để biết vị trí hiện tại của user (teacher), 
    // nhưng KHÔNG dùng nó để khóa bài học.
    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const userIdString = await AsyncStorage.getItem("userId");
                if (userIdString) {
                    const response = await userProgressService.getUserProgressByUserId(Number(userIdString));
                    if (response && response.data) {
                        // Cập nhật section và màu nền theo progress thật
                        setCurrentSection(response.data.section);
                        setSectionTitle(sectionColors[String(response.data.section)].title);

                        // Tự động scroll đến bài học hiện tại (nếu muốn tiện cho Teacher)
                        const activeNodeIndex = learningPathData.findIndex(node => node.id === response.data.lessonId);
                        if (activeNodeIndex !== -1) {
                            const y = activeNodeIndex * (NODE_SIZE + NODE_MARGIN * 2) - Dimensions.get('window').height / 3;
                            setTimeout(() => { scrollViewRef.current?.scrollTo({ y: y > 0 ? y : 0, animated: true }); }, 500);
                        }
                    }
                }
            } catch (error) {
                console.log("Teacher Mode: Không lấy được progress (không ảnh hưởng hiển thị)", error);
            }
        };
        fetchProgress();
    }, []);

    // --- LOGIC QUAN TRỌNG NHẤT: TEACHER MODE ---
    const processedPathData = useMemo((): RenderedNode[] => {
        return learningPathData.map((node) => ({
            ...node,
            status: 'active' // 'active' sẽ hiển thị màu xanh dương và cho phép click
        }));
    }, []);

    const handleNodePress = async (node: RenderedNode) => {
        // Cho phép truy cập mọi loại node
        if (node.type === 'lesson') {
            navigation.navigate('LoadingForLesson', { lessonId: node.id, lessonTitle: node.title, section: 1, targetRoute: 'AppTabLesson' });
        } else if (node.type === 'treasure') {
            // Teacher Mode: Test mở rương
            Alert.alert("Teacher Mode", "Đây là chức năng của hệ thống bạn không cần phải thiết lập, hãy tập trung vào xây dựng lộ trình khoá học nhé 🥰");
        } else if (node.type === 'challenge') {
            navigation.navigate('LoadingForChallenge',
                {
                    quoteText: "Đây là thử thách để lên cấp. Bạn hãy thiết kế thử thách có độ khó cao để thách thức năng lực học viên nhé!.",
                    subtitleText: node.title,
                    lessonId: node.id,
                    lessonTitle: node.title,
                    section: 1,
                    targetRoute: 'AppTabChallenge'
                });
        }
    };

    const interpolateColor = (sectionId: number) => {
        const currentKey = String(currentSection) as keyof SectionColorsMap;
        const targetKey = String(sectionId) as keyof SectionColorsMap;
        // Animation màu nền
        Animated.timing(animatedBackgroundColor, { toValue: 1, duration: 500, useNativeDriver: false }).start();
        return animatedBackgroundColor.interpolate({
            inputRange: [0, 1],
            outputRange: [
                sectionColors[currentKey]?.background || '#FFF',
                sectionColors[targetKey]?.background || '#FFF'
            ],
        });
    };

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const yOffset = event.nativeEvent.contentOffset.y;
        let newSection = 1;
        // Tính toán section dựa trên vị trí scroll
        if (yOffset >= SECTION_HEIGHT * 2) newSection = 3;
        else if (yOffset >= SECTION_HEIGHT) newSection = 2;

        if (newSection !== currentSection) {
            setCurrentSection(newSection);
            setSectionTitle(sectionColors[String(newSection)].title);
        }
    };

    const renderPathNodes = () => {
        return processedPathData.map((node, index) => {
            // Logic zigzag: Trái - Phải
            const isRightAligned = index % 2 !== 0;
            const topOffset = index * (NODE_SIZE + NODE_MARGIN * 2);

            const style = {
                marginTop: 20,
                position: 'absolute' as const,
                right: isRightAligned ? null : SCREEN_WIDTH / 2 + ALIGNMENT_PADDING,
                left: isRightAligned ? SCREEN_WIDTH / 2 + ALIGNMENT_PADDING : null,
                top: topOffset,
                alignItems: isRightAligned ? 'flex-start' as const : 'flex-end' as const,
            };

            return (
                <View key={node.id} style={style}>
                    <Text style={[styles.lessonNameText, { textAlign: isRightAligned ? 'left' : 'right' }]}>
                        {node.title}
                    </Text>
                    <PathNodeIcon {...node} onPress={handleNodePress} />
                </View>
            );
        });
    };

    const totalNodesHeight = learningPathData.length * (NODE_SIZE + NODE_MARGIN * 2);
    // Tăng thêm height cho container để scroll thoải mái ở dưới cùng
    const pathHeight = totalNodesHeight + (SCREEN_HEIGHT / 2);

    return (
        <Animated.View style={[styles.animatedContainer, { backgroundColor: interpolateColor(currentSection) }]}>
            {/* Header dính phía trên hiển thị tên Section hiện tại */}
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
                {renderPathNodes()}
            </ScrollView>
        </Animated.View>
    );
});

// --- STYLES ---
const styles = StyleSheet.create({
    animatedContainer: { flex: 1 },
    fixedSectionHeader: {
        position: 'absolute', top: 0, backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: 10, alignItems: 'center', justifyContent: 'center',
        width: SCREEN_WIDTH, zIndex: 100, borderBottomWidth: 1,
        borderBottomColor: '#EEE', borderBottomLeftRadius: 70, borderBottomRightRadius: 70,
    },
    fixedSectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLOR_PRIMARY },
    pathScrollView: { flex: 1, marginTop: 50 },
    pathContainer: { width: '100%', paddingTop: 50 },
    lessonNameText: { width: 150, marginBottom: 5, fontSize: 14, fontWeight: '600', color: '#4B4B4B' },
    nodeShadow: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 5 },
});

export default LearningPathForTeacher;