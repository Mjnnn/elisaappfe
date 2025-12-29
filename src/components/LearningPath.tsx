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

// --- INTERFACE CHO REF ---
export interface LearningPathHandle {
    scrollToLesson: (searchText: string) => void;
}

// ============================================================================
// 1. COMPONENT MODAL KHO BÁU & NODE ICON (Giữ nguyên logic cũ)
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

    if (status === 'locked') {
        nodeStyle.backgroundColor = '#E0E0E0'; nodeStyle.borderColor = '#C0C0C0';
    } else if (status === 'completed') {
        nodeStyle.backgroundColor = COLOR_GREEN; nodeStyle.borderColor = 'white';
    } else if (status === 'active') {
        nodeStyle.backgroundColor = COLOR_PRIMARY; nodeStyle.borderColor = 'white';
    }

    if (type === 'lesson') {
        iconContent = <Ionicons name="star" size={NODE_SIZE * 0.4} color="white" />;
        if (status === 'locked') iconContent = <Ionicons name="lock-closed-outline" size={NODE_SIZE * 0.4} color="white" />;
    } else if (type === 'treasure') {
        if (status === 'locked') {
            nodeStyle.backgroundColor = '#E0E0E0'; iconContent = <MaterialCommunityIcons name="treasure-chest" size={NODE_SIZE * 0.6} color={'#999'} />;
        } else if (status === 'active') {
            nodeStyle.backgroundColor = COLOR_PRIMARY; iconContent = <MaterialCommunityIcons name="treasure-chest" size={NODE_SIZE * 0.6} color={'#FFFFFF'} />;
        } else {
            nodeStyle.backgroundColor = COLOR_TREASURE; iconContent = <MaterialCommunityIcons name="gift-open" size={NODE_SIZE * 0.6} color="#FFFFFF" />;
        }
    } else if (type === 'challenge') {
        nodeStyle.backgroundColor = status === 'locked' ? '#E0E0E0' : COLOR_CHALLENGE;
        iconContent = <Ionicons name="trophy" size={NODE_SIZE * 0.4} color="white" />;
    }

    let finalContent = iconContent;
    if (level && level > 2 && status !== 'locked') {
        nodeStyle.backgroundColor = '#9932CC';
        finalContent = finalContent = (
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
const LearningPath = forwardRef<LearningPathHandle, {}>((props, ref) => {
    const navigation = useNavigation<any>();
    const scrollViewRef = useRef<ScrollView>(null);
    const animatedBackgroundColor = useRef(new Animated.Value(0)).current;

    const [userProgress, setUserProgress] = useState<UserProgressResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentSection, setCurrentSection] = useState(1);
    const [sectionTitle, setSectionTitle] = useState(sectionColors['1'].title);
    const [showTreasure, setShowTreasure] = useState(false);
    const [treasureXP, setTreasureXP] = useState(300);
    const [showLevelUpModal, setShowLevelUpModal] = useState<boolean>(false);
    const [newLevelData, setNewLevelData] = useState<LevelData | null>(null);

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

    const handleCloseTreasure = () => {
        setShowTreasure(false);
        if (newLevelData) {
            setTimeout(() => {
                setShowLevelUpModal(true);
            }, 200);
        }
    };

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const userIdString = await AsyncStorage.getItem("userId");
                if (!userIdString) {
                    setIsLoading(false); return;
                }
                const response = await userProgressService.getUserProgressByUserId(Number(userIdString));
                if (response && response.data) {
                    setUserProgress(response.data);
                    setCurrentSection(response.data.section);
                    setSectionTitle(sectionColors[String(response.data.section)].title);
                }
            } catch (error) {
                console.log("Lỗi lấy tiến độ:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProgress();
    }, []);

    const processedPathData = useMemo((): RenderedNode[] => {
        if (!userProgress) return learningPathData.map(node => ({ ...node, status: 'locked' }));
        return learningPathData.map((node) => {
            let newStatus: NodeStatus = 'locked';
            if (node.id < userProgress.lessonId) newStatus = 'completed';
            else if (node.id === userProgress.lessonId) newStatus = 'active';
            return { ...node, status: newStatus };
        });
    }, [userProgress]);

    const handleNodePress = async (node: RenderedNode) => {
        if (node.type === 'lesson') {
            navigation.navigate('LessonLoading', { lessonId: node.id, lessonTitle: node.title, section: 1, targetRoute: 'VocabularyScreen' });
        } else if (node.type === 'treasure') {
            if (node.status === 'active') {
                try {
                    const userIdString = await AsyncStorage.getItem("userId");
                    const userId = Number(userIdString);
                    const fullName = await AsyncStorage.getItem("fullName") || "Học viên";
                    if (userIdString) {
                        const xpToAdd = 300;
                        const currentXPRes = await userXPService.getUserXPByUserId(userId);
                        const currentXP = currentXPRes.data.totalXP || 0;
                        const newAchievementID = getAchievementID(currentXP + xpToAdd);

                        if (newAchievementID !== currentXPRes.data.achievementsID) {
                            const rankInfo = rankingData.find(r => r.achievementID === newAchievementID);
                            if (rankInfo) {
                                await notificationService.createNotification({
                                    userId: userId, title: "Lên cấp!", content: `Chúc mừng ${fullName} thăng cấp!`, imageUrl: `${getRankIconByID(newAchievementID)}`, type: "level",
                                });
                                setNewLevelData(rankInfo);
                            }
                        }
                        await userXPService.updateUserXP({ userId, achievementsID: newAchievementID, totalXP: currentXP + xpToAdd });
                        setTreasureXP(300);
                        setShowTreasure(true);

                        const nextLessonId = node.id + 1;
                        await userProgressService.updateUserProgress({ userId, lessonId: nextLessonId, section: 1 });
                        if (userProgress) setUserProgress({ ...userProgress, lessonId: nextLessonId });
                    }
                } catch (e) { console.log(e); }
            } else { Alert.alert("Đã nhận", "Bạn đã mở chiếc rương này rồi!"); }
        } else if (node.type === 'challenge') {
            navigation.navigate('ChallengeLoading', { lessonId: node.id, lessonTitle: node.title, section: 1, targetRoute: 'MultipleChoiceScreen' });
        }
    };

    useEffect(() => {
        if (!isLoading && userProgress) {
            const activeNodeIndex = processedPathData.findIndex(node => node.id === userProgress.lessonId);
            if (activeNodeIndex !== -1) {
                const y = activeNodeIndex * (NODE_SIZE + NODE_MARGIN * 2) - Dimensions.get('window').height / 3;
                setTimeout(() => { scrollViewRef.current?.scrollTo({ y: y > 0 ? y : 0, animated: true }); }, 500);
            }
        }
    }, [isLoading]);

    const interpolateColor = (sectionId: number) => {
        const currentKey = String(currentSection) as keyof SectionColorsMap;
        const targetKey = String(sectionId) as keyof SectionColorsMap;
        Animated.timing(animatedBackgroundColor, { toValue: 1, duration: 500, useNativeDriver: false }).start();
        return animatedBackgroundColor.interpolate({
            inputRange: [0, 1], outputRange: [sectionColors[currentKey]?.background || '#FFF', sectionColors[targetKey]?.background || '#FFF'],
        });
    };

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const yOffset = event.nativeEvent.contentOffset.y;
        let newSection = 1;
        if (yOffset >= SECTION_HEIGHT * 2) newSection = 3;
        else if (yOffset >= SECTION_HEIGHT) newSection = 2;
        if (newSection !== currentSection) {
            setCurrentSection(newSection);
            setSectionTitle(sectionColors[String(newSection)].title);
        }
    };

    const renderPathNodes = () => {
        return processedPathData.map((node, index) => {
            const isRightAligned = index % 2 !== 0;
            const topOffset = index * (NODE_SIZE + NODE_MARGIN * 2);
            const style = {
                marginTop: 20, position: 'absolute' as const,
                right: isRightAligned ? null : SCREEN_WIDTH / 2 + ALIGNMENT_PADDING,
                left: isRightAligned ? SCREEN_WIDTH / 2 + ALIGNMENT_PADDING : null,
                top: topOffset, alignItems: isRightAligned ? 'flex-start' as const : 'flex-end' as const,
            };
            return (
                <View key={node.id} style={style}>
                    <Text style={[styles.lessonNameText, { textAlign: isRightAligned ? 'left' : 'right' }]}>{node.title}</Text>
                    <PathNodeIcon {...node} onPress={handleNodePress} />
                </View>
            );
        });
    };

    const totalNodesHeight = learningPathData.length * (NODE_SIZE + NODE_MARGIN * 2);
    const pathHeight = totalNodesHeight + (SCREEN_HEIGHT / 2) - 400;

    if (isLoading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={COLOR_PRIMARY} /></View>;

    return (
        <Animated.View style={[styles.animatedContainer, { backgroundColor: interpolateColor(currentSection) }]}>
            <TreasureModal visible={showTreasure} xpAmount={treasureXP} onClose={handleCloseTreasure} />
            <LevelUpModal visible={showLevelUpModal} levelData={newLevelData} onClose={() => { setShowLevelUpModal(false); setNewLevelData(null); }} />
            <View style={styles.fixedSectionHeader}><Text style={styles.fixedSectionTitle}>{sectionTitle}</Text></View>
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

// --- STYLES GIỮ NGUYÊN ---
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
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    treasureBox: { width: SCREEN_WIDTH * 0.8, backgroundColor: 'white', borderRadius: 20, padding: 30, alignItems: 'center', elevation: 10 },
    treasureTitle: { fontSize: 24, fontWeight: 'bold', color: '#FF8C00', marginBottom: 10 },
    treasureText: { fontSize: 18, color: '#666', marginTop: 10 },
    treasureXP: { fontSize: 36, fontWeight: 'bold', color: COLOR_TREASURE, marginVertical: 10 },
    collectButton: { backgroundColor: COLOR_PRIMARY, paddingVertical: 12, paddingHorizontal: 40, borderRadius: 25, marginTop: 10, width: '100%', alignItems: 'center' },
    collectButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

export default LearningPath;