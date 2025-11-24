import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Dimensions, NativeSyntheticEvent, NativeScrollEvent,
    Animated, ActivityIndicator, Modal, Alert
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable';

// --- IMPORT DATA & TYPES ---
// Hãy đảm bảo đường dẫn này đúng với project của bạn
import { learningPathData, PathNode, NodeStatus } from '../services/data/LearningPathData';
import userProgressService from '../services/userProgressService';
import userXPService from '../services/userXPService';
import { UserProgressResponse } from '../types/response/UserProgressResponse';
import notificationService from '../services/notificationService';
import { rankingData, getAchievementID, getRankIconByID } from '../services/data/RankingData';
import LevelUpModal, { LevelData } from './LevelUpModal';


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

// ============================================================================
// 1. COMPONENT MODAL KHO BÁU (TREASURE MODAL)
// ============================================================================
const TreasureModal = ({ visible, onClose, xpAmount }: { visible: boolean, onClose: () => void, xpAmount: number }) => {
    if (!visible) return null;
    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <Animatable.View animation="zoomIn" duration={500} style={styles.treasureBox}>
                    <Text style={styles.treasureTitle}>KHO BÁU BÍ MẬT!</Text>

                    <Animatable.View animation="tada" iterationCount="infinite" duration={1500} style={{ marginVertical: 20 }}>
                        <MaterialCommunityIcons name="treasure-chest" size={100} color={COLOR_TREASURE} />
                    </Animatable.View>

                    <Text style={styles.treasureText}>Chúc mừng bạn nhận được</Text>
                    <Text style={styles.treasureXP}>+{xpAmount} XP</Text>

                    <TouchableOpacity style={styles.collectButton} onPress={onClose}>
                        <Text style={styles.collectButtonText}>NHẬN NGAY</Text>
                    </TouchableOpacity>
                </Animatable.View>
            </View>
        </Modal>
    );
};

// ============================================================================
// 2. COMPONENT NODE ICON (PATH NODE)
// ============================================================================
interface PathNodeIconProps extends RenderedNode {
    onPress: (node: RenderedNode) => void; // Nhận hàm xử lý từ cha
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

    // Xử lý màu sắc dựa trên trạng thái
    if (status === 'locked') {
        nodeStyle.backgroundColor = '#E0E0E0';
        nodeStyle.borderColor = '#C0C0C0';
    } else if (status === 'completed') {
        nodeStyle.backgroundColor = COLOR_GREEN;
        nodeStyle.borderColor = 'white';
    } else if (status === 'active') {
        nodeStyle.backgroundColor = COLOR_PRIMARY;
        nodeStyle.borderColor = 'white';
    }

    // Xử lý Icon dựa trên loại (Lesson/Treasure/Challenge)
    if (type === 'lesson') {
        iconContent = <Ionicons name="star" size={NODE_SIZE * 0.4} color="white" />;
        if (status === 'locked') iconContent = <Ionicons name="lock-closed-outline" size={NODE_SIZE * 0.4} color="white" />;
    } else if (type === 'treasure') {
        if (status === 'locked') {
            nodeStyle.backgroundColor = '#E0E0E0';
            iconContent = <MaterialCommunityIcons name="treasure-chest" size={NODE_SIZE * 0.6} color={'#999'} />;
        } else if (status === 'active') {
            nodeStyle.backgroundColor = COLOR_PRIMARY; // Đang chờ mở
            iconContent = <MaterialCommunityIcons name="treasure-chest" size={NODE_SIZE * 0.6} color={'#FFFFFF'} />;
        } else {
            nodeStyle.backgroundColor = COLOR_TREASURE; // Đã nhận
            iconContent = <MaterialCommunityIcons name="gift-open" size={NODE_SIZE * 0.6} color="#FFFFFF" />;
        }
    } else if (type === 'challenge') {
        nodeStyle.backgroundColor = status === 'locked' ? '#E0E0E0' : COLOR_CHALLENGE;
        iconContent = <Ionicons name="trophy" size={NODE_SIZE * 0.4} color="white" />;
    }

    let finalContent = iconContent;
    if (level && level > 3 && status !== 'locked') {
        nodeStyle.backgroundColor = '#9932CC'; // Level cao đổi màu tím
        finalContent = <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white' }}>{String(level)}</Text>
    }

    return (
        <TouchableOpacity
            style={[baseStyle, nodeStyle, styles.nodeShadow]}
            disabled={status === 'locked'}
            onPress={() => onPress(props)}
            activeOpacity={0.8}
        >
            {finalContent}
        </TouchableOpacity>
    );
};

// ============================================================================
// 3. COMPONENT CHÍNH (LEARNING PATH SCREEN)
// ============================================================================
const LearningPath: React.FC = () => {
    const navigation = useNavigation<any>();
    const scrollViewRef = useRef<ScrollView>(null);
    const animatedBackgroundColor = useRef(new Animated.Value(0)).current;

    // State Data
    const [userProgress, setUserProgress] = useState<UserProgressResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // State UI
    const [currentSection, setCurrentSection] = useState(1);
    const [sectionTitle, setSectionTitle] = useState(sectionColors['1'].title);

    // State Modal Treasure
    const [showTreasure, setShowTreasure] = useState(false);
    const [treasureXP, setTreasureXP] = useState(300);

    const [showLevelUpModal, setShowLevelUpModal] = useState<boolean>(false);
    const [newLevelData, setNewLevelData] = useState<LevelData | null>(null);

    const handleCloseTreasure = () => {
        setShowTreasure(false); // 1. Tắt modal rương trước

        // 2. Kiểm tra xem có dữ liệu lên cấp đang chờ không
        if (newLevelData) {
            // Dùng setTimeout nhẹ để tạo hiệu ứng mượt mà (đợi modal cũ tắt hẳn mới hiện modal mới)
            setTimeout(() => {
                setShowLevelUpModal(true);
                // Lưu ý: Không set newLevelData = null ở đây để modal có dữ liệu hiển thị
            }, 200);
        }
    };

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const userIdString = await AsyncStorage.getItem("userId");
                if (!userIdString) {
                    console.log("Chưa đăng nhập");
                    setIsLoading(false);
                    return;
                }

                const response = await userProgressService.getUserProgressByUserId(Number(userIdString));
                if (response && response.data) {
                    setUserProgress(response.data);
                    setCurrentSection(response.data.section);
                    setSectionTitle(sectionColors[String(response.data.section)].title);
                }
            } catch (error) {
                console.error("Lỗi khi lấy tiến độ học tập:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProgress();
    }, []);

    // --- MERGE DATA & STATUS ---
    const processedPathData = useMemo((): RenderedNode[] => {
        if (!userProgress) {
            return learningPathData.map(node => ({ ...node, status: 'locked' }));
        }

        return learningPathData.map((node) => {
            let newStatus: NodeStatus = 'locked';

            // Nếu ID nhỏ hơn bài hiện tại -> Đã học xong
            if (node.id < userProgress.lessonId) {
                newStatus = 'completed';
            }
            // Nếu ID bằng bài hiện tại -> Đang học (Active)
            else if (node.id === userProgress.lessonId) {
                newStatus = 'active';
            }
            else {
                newStatus = 'locked';
            }

            return { ...node, status: newStatus };
        });
    }, [userProgress]);

    // --- LOGIC XỬ LÝ KHI BẤM VÀO NODE (QUAN TRỌNG) ---
    const handleNodePress = async (node: RenderedNode) => {

        // TRƯỜNG HỢP 1: LESSON (BÀI HỌC)
        if (node.type === 'lesson') {
            navigation.navigate('LessonLoading', {
                lessonId: node.id,
                lessonTitle: node.title,
                section: 1,
                targetRoute: 'VocabularyScreen'
            });
        }

        // TRƯỜNG HỢP 2: TREASURE (RƯƠNG KHO BÁU)
        else if (node.type === 'treasure') {
            if (node.status === 'active') {
                // Rương đang active nghĩa là chưa nhận -> Thực hiện nhận quà
                try {
                    const userIdString = await AsyncStorage.getItem("userId");
                    const userId = Number(userIdString);
                    const fullName = await AsyncStorage.getItem("fullName") || "Học viên Elisa";
                    if (userIdString) {
                        // 1. Cộng XP
                        const xpToAdd = 300;
                        const currentXPRes = await userXPService.getUserXPByUserId(userId);
                        const currentXP = currentXPRes.data.totalXP || 0;
                        const newAchievementID = getAchievementID(currentXP + xpToAdd);

                        if (newAchievementID !== currentXPRes.data.achievementsID) {
                            const rankInfo = rankingData.find(r => r.achievementID === newAchievementID);
                            if (rankInfo) {
                                const notificationPayloadLevel = {
                                    userId: userId,
                                    title: "Lên cấp!",
                                    content: `Chúc mừng ${fullName} bạn vừa thăng cấp. Hãy tiếp tục cố gắng để đạt được những thành tựu cao hơn nhé!`,
                                    imageUrl: `${getRankIconByID(newAchievementID)}`,
                                    type: "level",
                                };
                                await notificationService.createNotification(notificationPayloadLevel);

                                setNewLevelData(rankInfo);
                            } else {
                                setNewLevelData(null);
                            }
                        }
                        await userXPService.updateUserXP({
                            userId: Number(userIdString),
                            achievementsID: newAchievementID,
                            totalXP: currentXP + xpToAdd
                        });


                        setTreasureXP(300);
                        setShowTreasure(true);


                        // 2. Cập nhật tiến độ (Mở khóa bài tiếp theo)
                        const nextLessonId = node.id + 1;
                        console.log("Mở khóa bài tiếp theo ID:", nextLessonId);
                        await userProgressService.updateUserProgress({
                            userId: Number(userIdString),
                            lessonId: nextLessonId,
                            section: 1 // Hoặc logic tính section nếu cần
                        });

                        // 3. Cập nhật UI ngay lập tức (Không cần reload)
                        if (userProgress) {
                            setUserProgress({
                                ...userProgress,
                                lessonId: nextLessonId
                            });
                        }
                    }
                } catch (e) {
                    console.error("Lỗi nhận rương:", e);
                }

                // 4. Hiện Modal chúc mừng

            } else {
                // Nếu đã nhận rồi (completed)
                Alert.alert("Đã nhận", "Bạn đã mở chiếc rương này rồi!");
            }
        }

        // TRƯỜNG HỢP 3: CHALLENGE (THỬ THÁCH)
        else if (node.type === 'challenge') {
            navigation.navigate('ChallengeScreen', {
                challengeId: node.id,
                challengeTitle: node.title,
                levelTag: node.levelTag
            });
        }
    };

    // --- AUTO SCROLL ĐẾN BÀI HIỆN TẠI ---
    useEffect(() => {
        if (!isLoading && userProgress) {
            const activeNodeIndex = processedPathData.findIndex(node => node.id === userProgress.lessonId);
            if (activeNodeIndex !== -1) {
                const y = activeNodeIndex * (NODE_SIZE + NODE_MARGIN * 2) - Dimensions.get('window').height / 3;
                setTimeout(() => {
                    scrollViewRef.current?.scrollTo({ y: y > 0 ? y : 0, animated: true });
                }, 500);
            }
        }
    }, [isLoading]); // Chỉ chạy 1 lần khi load xong

    // --- ANIMATION BACKGROUND ---
    const interpolateColor = (sectionId: number) => {
        const currentSectionKey = String(currentSection) as keyof SectionColorsMap;
        const sectionIdKey = String(sectionId) as keyof SectionColorsMap;
        const startColor = sectionColors[currentSectionKey]?.background || '#FFFFFF';
        const endColor = sectionColors[sectionIdKey]?.background || '#FFFFFF';

        animatedBackgroundColor.setValue(0);
        Animated.timing(animatedBackgroundColor, {
            toValue: 1, duration: 500, useNativeDriver: false,
        }).start();

        return animatedBackgroundColor.interpolate({
            inputRange: [0, 1], outputRange: [startColor, endColor],
        });
    };

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const yOffset = event.nativeEvent.contentOffset.y;
        let newSection = currentSection;
        if (yOffset < SECTION_HEIGHT) newSection = 1;
        else if (yOffset < SECTION_HEIGHT * 2) newSection = 2;
        else newSection = 3;

        if (newSection !== currentSection) {
            setCurrentSection(newSection);
            setSectionTitle(sectionColors[String(newSection)].title);
        }
    };

    // --- RENDER LIST ---
    const renderPathNodes = () => {
        return processedPathData.map((node, index) => {
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
                    {/* Truyền hàm handleNodePress xuống icon */}
                    <PathNodeIcon {...node} onPress={handleNodePress} />
                </View>
            );
        });
    };

    const totalNodesHeight = learningPathData.length * (NODE_SIZE + NODE_MARGIN * 2);
    const pathHeight = totalNodesHeight + (SCREEN_HEIGHT / 2) - 400;

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLOR_PRIMARY} />
                <Text style={{ marginTop: 10, color: '#666' }}>Đang đồng bộ dữ liệu...</Text>
            </View>
        );
    }

    return (
        <Animated.View style={[styles.animatedContainer, { backgroundColor: interpolateColor(currentSection) }]}>
            {/* Treasure Modal */}
            <TreasureModal
                visible={showTreasure}
                xpAmount={treasureXP}
                onClose={handleCloseTreasure}
            />

            <LevelUpModal
                visible={showLevelUpModal}
                levelData={newLevelData}
                onClose={() => {
                    setShowLevelUpModal(false)
                    setNewLevelData(null);
                }}
            />

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
};

// --- STYLES ---
const styles = StyleSheet.create({
    animatedContainer: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
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

    // --- STYLES CHO TREASURE MODAL ---
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center', alignItems: 'center'
    },
    treasureBox: {
        width: SCREEN_WIDTH * 0.8, backgroundColor: 'white',
        borderRadius: 20, padding: 30, alignItems: 'center',
        elevation: 10,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84,
    },
    treasureTitle: { fontSize: 24, fontWeight: 'bold', color: '#FF8C00', marginBottom: 10 },
    treasureText: { fontSize: 18, color: '#666', marginTop: 10 },
    treasureXP: { fontSize: 36, fontWeight: 'bold', color: COLOR_TREASURE, marginVertical: 10 },
    collectButton: {
        backgroundColor: COLOR_PRIMARY, paddingVertical: 12, paddingHorizontal: 40,
        borderRadius: 25, marginTop: 10, width: '100%', alignItems: 'center'
    },
    collectButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

export default LearningPath;