// src/screens/selfstudy/FlashcardScreen.tsx

import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Speech from "expo-speech";

import { AuthStackParamList } from "../../navigation/AuthStack";
import documentItemService from "../../services/documentItemService";
import FlashcardSettingsModal, {
  FrontSideType,
} from "../../components/FlashcardSettingsModal";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get(
  "window"
);

// mỗi “page” full màn hình, card nhỏ hơn để có khoảng cách giữa các thẻ
const PAGE_WIDTH = SCREEN_WIDTH;
const CARD_WIDTH = SCREEN_WIDTH * 0.8;

type FlashcardRouteProp = RouteProp<AuthStackParamList, "FlashcardScreen">;
type FlashcardNavProp = NativeStackNavigationProp<
  AuthStackParamList,
  "FlashcardScreen"
>;

interface DocumentItem {
  wordId: number;
  listId: number;
  word: string;
  meaning: string;
  example?: string;
  vocabImage?: string;
}

const FlashcardScreen: React.FC = () => {
  const navigation = useNavigation<FlashcardNavProp>();
  const route = useRoute<FlashcardRouteProp>();
  const { listId } = route.params;

  const [baseItems, setBaseItems] = useState<DocumentItem[]>([]);
  const [items, setItems] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [index, setIndex] = useState<number>(0);
  const [showBack, setShowBack] = useState<boolean>(false);

  // cài đặt
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [stackEnabled, setStackEnabled] = useState(true);
  const [frontSide, setFrontSide] = useState<FrontSideType>("word");

  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true);
        const res = await documentItemService.getByListId(listId);
        const data: DocumentItem[] = res.data ?? [];
        setBaseItems(data);
        setItems(data);
        setIndex(0);
        setShowBack(false);
        scrollRef.current?.scrollTo({ x: 0, animated: false });
      } catch (e) {
        console.log("Load flashcard items error:", e);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [listId]);

  const total = items.length;
  const current = items[index];
  const progressText = total > 0 ? `${index + 1} / ${total}` : "0 / 0";

  const getFrontText = (item: DocumentItem) =>
    frontSide === "word" ? item.word : item.meaning;

  const getBackText = (item: DocumentItem) =>
    frontSide === "word" ? item.meaning : item.word;

  const speakWord = (text: string) => {
    if (!ttsEnabled || !text) return;
    Speech.stop();
    Speech.speak(text, {
      language: "en-US",
      rate: 0.85,
      pitch: 1.0,
    });
  };

  const onMomentumScrollEnd = (e: any) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / PAGE_WIDTH);
    if (newIndex !== index) {
      setIndex(newIndex);
      setShowBack(false);
    }
  };

  const goNext = () => {
    if (index < total - 1) {
      const nextIndex = index + 1;
      setIndex(nextIndex);
      setShowBack(false);
      scrollRef.current?.scrollTo({
        x: nextIndex * PAGE_WIDTH,
        animated: true,
      });
    }
  };

  const goPrev = () => {
    if (index > 0) {
      const prevIndex = index - 1;
      setIndex(prevIndex);
      setShowBack(false);
      scrollRef.current?.scrollTo({
        x: prevIndex * PAGE_WIDTH,
        animated: true,
      });
    }
  };

  const shuffleArray = (arr: DocumentItem[]) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const handleToggleShuffle = (value: boolean) => {
    setShuffleEnabled(value);
    if (value) {
      const shuffled = shuffleArray(baseItems);
      setItems(shuffled);
    } else {
      setItems(baseItems);
    }
    setIndex(0);
    setShowBack(false);
    scrollRef.current?.scrollTo({ x: 0, animated: false });
  };

  const handleResetDeck = () => {
    setIndex(0);
    setShowBack(false);
    scrollRef.current?.scrollTo({ x: 0, animated: true });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close-outline" size={26} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.progressText}>{progressText}</Text>

        <TouchableOpacity onPress={() => setSettingsVisible(true)}>
          <Ionicons name="settings-outline" size={22} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Thanh progress */}
      <View style={styles.progressBarWrapper}>
        <View
          style={[
            styles.progressBarFill,
            {
              width:
                total > 0 ? ((index + 1) / total) * (SCREEN_WIDTH - 32) : 0,
            },
          ]}
        />
      </View>

      {/* KHU VỰC THẺ */}
      <View style={styles.cardArea}>
        {loading ? (
          <Text style={{ color: "#6B7280" }}>Đang tải...</Text>
        ) : total === 0 ? (
          <Text style={{ color: "#6B7280" }}>Chưa có thẻ nào.</Text>
        ) : (
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onMomentumScrollEnd}
          >
            {items.map((item, idx) => {
              const frontText = getFrontText(item);
              const backText = getBackText(item);
              const isCurrent = idx === index;

              return (
                <View
                  key={item.wordId}
                  style={{
                    width: PAGE_WIDTH,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={styles.card}
                    onPress={() => isCurrent && setShowBack(!showBack)}
                  >
                    <View style={styles.cardTopRow}>
                      <TouchableOpacity
                        onPress={() =>
                          speakWord(isCurrent ? frontText : getFrontText(item))
                        }
                      >
                        <Ionicons
                          name="volume-high-outline"
                          size={22}
                          color="#4B5563"
                        />
                      </TouchableOpacity>

                      <TouchableOpacity>
                        <Ionicons
                          name="star-outline"
                          size={22}
                          color="#4B5563"
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.cardContent}>
                      {item.vocabImage ? (
                        <Image
                          source={{ uri: item.vocabImage }}
                          style={styles.cardImage}
                          resizeMode="contain"
                        />
                      ) : null}

                      <Text style={styles.cardMainText}>
                        {isCurrent
                          ? showBack
                            ? backText
                            : frontText
                          : frontText}
                      </Text>

                      {isCurrent && showBack && item.example ? (
                        <Text style={styles.exampleText}>{item.example}</Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Nút điều hướng dưới */}
      <View style={styles.bottomRow}>
        <TouchableOpacity
          onPress={goPrev}
          disabled={index === 0}
          style={styles.navButton}
        >
          <Ionicons
            name="play-back-outline"
            size={24}
            color={index === 0 ? "#D1D5DB" : "#4B5563"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={goNext}
          disabled={index === total - 1 || total === 0}
          style={styles.navButton}
        >
          <Ionicons
            name="play-forward-outline"
            size={24}
            color={
              index === total - 1 || total === 0 ? "#D1D5DB" : "#4B5563"
            }
          />
        </TouchableOpacity>
      </View>

      {/* MODAL CÀI ĐẶT – dùng component */}
      <FlashcardSettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        shuffleEnabled={shuffleEnabled}
        onToggleShuffle={handleToggleShuffle}
        ttsEnabled={ttsEnabled}
        onToggleTts={setTtsEnabled}
        stackEnabled={stackEnabled}
        onToggleStack={setStackEnabled}
        frontSide={frontSide}
        onChangeFrontSide={setFrontSide}
        onResetDeck={handleResetDeck}
      />
    </SafeAreaView>
  );
};

export default FlashcardScreen;

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
  progressText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  progressBarWrapper: {
    marginHorizontal: 16,
    height: 3,
    borderRadius: 3,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  progressBarFill: {
    height: 3,
    backgroundColor: "#3B82F6",
  },
  cardArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: CARD_WIDTH,
    height: SCREEN_HEIGHT * 0.6,
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    paddingHorizontal: 22,
    paddingVertical: 18,
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cardImage: {
    width: CARD_WIDTH * 0.55,
    height: SCREEN_HEIGHT * 0.16,
    marginBottom: 12,
    borderRadius: 10,
  },
  cardMainText: {
    fontSize: 26,
    textAlign: "center",
    color: "#111827",
    fontWeight: "600",
  },
  exampleText: {
    marginTop: 10,
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 40,
    paddingBottom: 24,
  },
  navButton: {
    padding: 8,
  },
});
