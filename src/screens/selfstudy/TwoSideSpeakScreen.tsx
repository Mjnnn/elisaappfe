// src/screens/selfstudy/TwoSideSpeakScreen.tsx

import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
  } from "react";
  import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Dimensions,
  } from "react-native";
  import { SafeAreaView } from "react-native-safe-area-context";
  import { Ionicons } from "@expo/vector-icons";
  import {
    RouteProp,
    useNavigation,
    useRoute,
  } from "@react-navigation/native";
  import { NativeStackNavigationProp } from "@react-navigation/native-stack";
  
  import { AuthStackParamList } from "../../navigation/AuthStack";
  import documentItemService from "../../services/documentItemService";
  
  const { width: SCREEN_WIDTH } = Dimensions.get("window");
  
  // ===== Types =====
  type TwoSideRouteProp = RouteProp<AuthStackParamList, "TwoSideSpeakScreen">;
  type TwoSideNavProp = NativeStackNavigationProp<
    AuthStackParamList,
    "TwoSideSpeakScreen"
  >;
  
  interface DocumentItem {
    wordId: number;
    listId: number;
    word: string;
    meaning: string;
    example?: string;
    vocabImage?: string;
  }
  
  interface MatchCard {
    id: string; // unique
    pairId: number;
    text: string;
  }
  
  // ===== Helper: shuffle =====
  function shuffleArray<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
  
  // ===== Card Component =====
  interface MatchCardProps {
    card: MatchCard;
    isMatched: boolean;
    isSelected: boolean;
    isWrong: boolean;
    onPress: () => void;
  }
  
  const CardItem: React.FC<MatchCardProps> = ({
    card,
    isMatched,
    isSelected,
    isWrong,
    onPress,
  }) => {
    if (isMatched) {
      return <View style={[styles.card, { opacity: 0 }]} />;
    }
  
    let borderColor = "#E5E7EB";
    if (isSelected) borderColor = "#2563EB";
    if (isWrong) borderColor = "#EF4444";
  
    return (
      <TouchableOpacity
        style={[styles.card, { borderColor }]}
        activeOpacity={0.8}
        onPress={onPress}
      >
        <Text style={styles.cardText}>{card.text}</Text>
      </TouchableOpacity>
    );
  };
  
  // ===== Main Screen =====
  const TwoSideSpeakScreen: React.FC = () => {
    const navigation = useNavigation<TwoSideNavProp>();
    const route = useRoute<TwoSideRouteProp>();
    const { listId } = route.params;
  
    const [cards, setCards] = useState<MatchCard[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
  
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const [matchedPairIds, setMatchedPairIds] = useState<Set<number>>(
      new Set()
    );
    const [wrongIndices, setWrongIndices] = useState<number[]>([]);
  
    const [seconds, setSeconds] = useState<number>(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
    // ===== Load items (6 từ random) =====
    useEffect(() => {
      const loadItems = async () => {
        try {
          setLoading(true);
          const res = await documentItemService.getByListId(listId);
          const all: DocumentItem[] = res.data ?? [];
  
          const selected = shuffleArray(all).slice(0, 6);
  
          const rawCards: MatchCard[] = [];
          selected.forEach((item) => {
            rawCards.push({
              id: `front-${item.wordId}`,
              pairId: item.wordId,
              text: item.word,
            });
            rawCards.push({
              id: `back-${item.wordId}`,
              pairId: item.wordId,
              text: item.meaning,
            });
          });
  
          setCards(shuffleArray(rawCards));
          setMatchedPairIds(new Set());
          setSelectedIndices([]);
          setWrongIndices([]);
          setSeconds(0);
        } catch (e) {
          console.log("Load two-side items error:", e);
        } finally {
          setLoading(false);
        }
      };
  
      loadItems();
    }, [listId]);
  
    // ===== Timer =====
    useEffect(() => {
      timerRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
  
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }, []);
  
    const allMatched = useMemo(
      () => cards.length > 0 && matchedPairIds.size === cards.length / 2,
      [cards, matchedPairIds]
    );
  
    // Dừng đồng hồ khi chơi xong
    useEffect(() => {
      if (allMatched && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, [allMatched]);
  
    const handleCardPress = (index: number) => {
      if (loading) return;
      if (wrongIndices.length > 0) return;
  
      const card = cards[index];
  
      if (matchedPairIds.has(card.pairId)) return;
      if (selectedIndices.includes(index)) return;
  
      if (selectedIndices.length === 0) {
        setSelectedIndices([index]);
      } else if (selectedIndices.length === 1) {
        const firstIndex = selectedIndices[0];
        const firstCard = cards[firstIndex];
  
        if (firstCard.pairId === card.pairId) {
          // đúng
          setSelectedIndices([firstIndex, index]);
          setTimeout(() => {
            setMatchedPairIds((prev) => {
              const next = new Set(prev);
              next.add(card.pairId);
              return next;
            });
            setSelectedIndices([]);
          }, 200);
        } else {
          // sai
          const wrong = [firstIndex, index];
          setWrongIndices(wrong);
          setSelectedIndices(wrong);
          setTimeout(() => {
            setWrongIndices([]);
            setSelectedIndices([]);
          }, 2000);
        }
      }
    };
  
    const formatTime = (s: number) => `${s.toFixed(1)} giây`;
  
    return (
      <SafeAreaView style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close-outline" size={26} color="#111827" />
          </TouchableOpacity>
  
          <Text style={styles.headerTitle}>{formatTime(seconds)}</Text>
  
          <View style={styles.headerRight}>
            <TouchableOpacity style={{ marginRight: 12 }}>
              <Ionicons name="volume-high-outline" size={22} color="#4B5563" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="settings-outline" size={22} color="#4B5563" />
            </TouchableOpacity>
          </View>
        </View>
  
        {/* BODY */}
        <View style={styles.body}>
          {loading ? (
            <Text style={{ color: "#6B7280" }}>Đang tải...</Text>
          ) : (
            <FlatList
              data={cards}
              keyExtractor={(item) => item.id}
              numColumns={3}
              columnWrapperStyle={styles.row}
              contentContainerStyle={styles.gridContainer}
              renderItem={({ item, index }) => (
                <CardItem
                  card={item}
                  isMatched={matchedPairIds.has(item.pairId)}
                  isSelected={selectedIndices.includes(index)}
                  isWrong={wrongIndices.includes(index)}
                  onPress={() => handleCardPress(index)}
                />
              )}
            />
          )}
        </View>
  
        {/* OVERLAY KHI CHƠI XONG */}
        {allMatched && (
          <View style={styles.overlay}>
            <View style={styles.overlayBox}>
              <Text style={styles.overlayTitle}>{formatTime(seconds)}</Text>
              <Text style={styles.overlayText}>
                Bạn đã ghép xong trong {formatTime(seconds)} 🎉
              </Text>
  
              <TouchableOpacity
                style={styles.overlayButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.overlayButtonText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    );
  };
  
  export default TwoSideSpeakScreen;
  
  // ===== Styles =====
  const CARD_MARGIN = 8;
  const CARD_WIDTH = (SCREEN_WIDTH - CARD_MARGIN * 2 * 3 - 32) / 3;
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#F9FAFB",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingTop: 4,
      paddingBottom: 8,
      justifyContent: "space-between",
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: "#111827",
    },
    headerRight: {
      flexDirection: "row",
      alignItems: "center",
    },
    body: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 8,
    },
    gridContainer: {
      paddingTop: 8,
      paddingBottom: 24,
    },
    row: {
      justifyContent: "space-between",
      marginBottom: CARD_MARGIN * 2,
    },
    card: {
      width: CARD_WIDTH,
      minHeight: CARD_WIDTH * 1.3,
      backgroundColor: "#FFFFFF",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: "#E5E7EB",
      paddingHorizontal: 8,
      paddingVertical: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    cardText: {
      fontSize: 15,
      color: "#111827",
      textAlign: "center",
    },
  
    // overlay
    overlay: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: "rgba(0,0,0,0.35)",
      justifyContent: "center",
      alignItems: "center",
    },
    overlayBox: {
      width: "80%",
      backgroundColor: "#FFFFFF",
      borderRadius: 20,
      paddingVertical: 24,
      paddingHorizontal: 20,
      alignItems: "center",
    },
    overlayTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: "#111827",
      marginBottom: 8,
    },
    overlayText: {
      fontSize: 15,
      color: "#16A34A",
      textAlign: "center",
      marginBottom: 16,
    },
    overlayButton: {
      marginTop: 8,
      backgroundColor: "#3B82F6",
      borderRadius: 999,
      paddingHorizontal: 24,
      paddingVertical: 10,
    },
    overlayButtonText: {
      color: "#FFFFFF",
      fontWeight: "600",
      fontSize: 15,
    },
  });
  