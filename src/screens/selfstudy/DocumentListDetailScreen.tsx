// src/screens/selfstudy/DocumentListDetailScreen.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";

import documentItemService from "../../services/documentItemService";
import favoriteDocumentListService from "../../services/favoriteDocumentListService";
import StudyModeList, { StudyMode } from "../../components/StudyModeList";
import { AuthStackParamList } from "../../navigation/AuthStack";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_HORIZONTAL_MARGIN = 16;
const FLASHCARD_WIDTH = SCREEN_WIDTH - CARD_HORIZONTAL_MARGIN * 2;

type DetailRouteProp = RouteProp<AuthStackParamList, "DocumentListDetail">;
type DetailNavProp = NativeStackNavigationProp<
  AuthStackParamList,
  "DocumentListDetail"
>;

interface DocumentItem {
  wordId: number;
  listId: number;
  word: string;
  meaning: string;
  example?: string;
  vocabImage?: string;
}

const DocumentListDetailScreen: React.FC = () => {
  const navigation = useNavigation<DetailNavProp>();
  const route = useRoute<DetailRouteProp>();
  const { listId, title, author, itemCount } = route.params;

  const [items, setItems] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // ✅ userId từ AsyncStorage
  const [userId, setUserId] = useState<number | null>(null);

  // favorite state
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [favoriteId, setFavoriteId] = useState<number | null>(null);
  const [favoriteLoading, setFavoriteLoading] = useState<boolean>(false);

  // ✅ Load userId (đã lưu lúc login)
  useEffect(() => {
    const loadUserId = async () => {
      try {
        const stored = await AsyncStorage.getItem("userId");
        if (!stored) {
          setUserId(null);
          return;
        }
        const parsed = Number(stored);
        setUserId(Number.isNaN(parsed) ? null : parsed);
      } catch (e) {
        console.error("Load userId error:", e);
        setUserId(null);
      }
    };

    loadUserId();
  }, []);

  // Load items + check favorite (khi đã có userId)
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const res = await documentItemService.getByListId(listId);
        setItems(res.data ?? []);
      } catch (error) {
        console.error("Failed to load items:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchFavorite = async (uid: number) => {
      try {
        const res = await favoriteDocumentListService.checkFavorite(uid, listId);

        // ✅ nếu BE trả object favorite
        // ví dụ { favoriteId: 123, userId:..., listId:... }
        setIsFavorite(true);
        const favId = res?.data?.favoriteId ?? res?.data?.id;
        setFavoriteId(typeof favId === "number" ? favId : null);
      } catch (error: any) {
        // 404 = chưa favorite
        if (error?.response?.status === 404) {
          setIsFavorite(false);
          setFavoriteId(null);
        } else {
          console.error("Check favorite failed:", error);
        }
      }
    };

    fetchItems();

    // ✅ chỉ check favorite khi có userId
    if (typeof userId === "number") {
      fetchFavorite(userId);
    } else {
      // chưa login / chưa lấy được userId -> coi như chưa favorite
      setIsFavorite(false);
      setFavoriteId(null);
    }
  }, [listId, userId]);

  const handleSelectMode = (mode: StudyMode) => {
    if (mode === "flashcard") {
      navigation.navigate("FlashcardScreen", { listId, title });
    } else if (mode === "practice_question") {
      navigation.navigate("PracticeQuestionScreen", { listId, title });
    } else if (mode === "two_side_speak") {
      navigation.navigate("TwoSideSpeakScreen", { listId, title });
    }
  };

  const handleFlashcardScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / FLASHCARD_WIDTH);
    if (index !== activeIndex) setActiveIndex(index);
  };

  const speakWord = async (text: string) => {
    if (!text) return;

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        playThroughEarpieceAndroid: false,
      });

      Speech.stop();
      Speech.speak(text, {
        language: "en-US",
        pitch: 1.0,
        rate: 0.85,
      });
    } catch (e) {
      console.log("Speak error:", e);
    }
  };

  // ✅ Toggle favorite dùng userId thật từ AsyncStorage
  const toggleFavorite = async () => {
    if (favoriteLoading) return;

    if (typeof userId !== "number") {
      Alert.alert("Thông báo", "Bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
      navigation.navigate("Login" as never);
      return;
    }

    try {
      setFavoriteLoading(true);

      if (!isFavorite) {
        // ✅ tạo favorite: DTO = { userId, listId }
        const res = await favoriteDocumentListService.create({
          userId,
          listId,
        });

        setIsFavorite(true);
        const favId = res?.data?.favoriteId ?? res?.data?.id;
        setFavoriteId(typeof favId === "number" ? favId : null);
      } else {
        // ✅ đã favorite -> xoá theo favoriteId
        if (favoriteId != null) {
          await favoriteDocumentListService.delete(favoriteId);
        } else {
          // fallback: nếu không có favoriteId (BE không trả), check lại rồi xoá
          try {
            const check = await favoriteDocumentListService.checkFavorite(
              userId,
              listId
            );
            const fid = check?.data?.favoriteId ?? check?.data?.id;
            if (typeof fid === "number") {
              await favoriteDocumentListService.delete(fid);
            }
          } catch (e) {
            // ignore
          }
        }

        setIsFavorite(false);
        setFavoriteId(null);
      }
    } catch (error) {
      console.error("Toggle favorite failed:", error);
      Alert.alert("Lỗi", "Không thể cập nhật yêu thích. Vui lòng thử lại.");
    } finally {
      setFavoriteLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>

        <TouchableOpacity onPress={() => navigation.navigate("SelfStudyScreen")}>
          <Ionicons name="home-outline" size={22} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.topCardWrapper}>
          <View style={styles.flashcardPreview}>
            {items.length === 0 ? (
              <>
                <Text style={styles.previewText}>Flashcard preview</Text>
                <Text style={styles.previewSubText}>Bắt đầu học bộ này</Text>
              </>
            ) : (
              <>
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScroll={handleFlashcardScroll}
                  scrollEventThrottle={16}
                >
                  {items.map((item) => (
                    <View
                      key={item.wordId}
                      style={[styles.flashcardCard, { width: FLASHCARD_WIDTH }]}
                    >
                      <Text style={styles.flashcardWord}>{item.word}</Text>
                      <Text style={styles.flashcardMeaning}>{item.meaning}</Text>
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.dots}>
                  {items.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        activeIndex === index && styles.dotActive,
                      ]}
                    />
                  ))}
                </View>
              </>
            )}
          </View>

          {/* INFO + FAVORITE ICON */}
          <View style={styles.listInfoRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.listTitle}>{title}</Text>

              <View style={styles.authorRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {author?.charAt(0)?.toUpperCase() ?? "U"}
                  </Text>
                </View>

                <Text style={styles.authorName}>{author}</Text>
                <Text style={styles.dotSeparator}>·</Text>
                <Text style={styles.termCount}>
                  {(itemCount ?? items.length) || 0} thuật ngữ
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={toggleFavorite}
              disabled={favoriteLoading}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={22}
                color={isFavorite ? "#EF4444" : "#9CA3AF"}
              />
            </TouchableOpacity>
          </View>
        </View>

        <StudyModeList onSelectMode={handleSelectMode} />

        <View style={styles.vocabHeaderRow}>
          <Text style={styles.vocabHeader}>Thuật ngữ</Text>
        </View>

        {loading && (
          <Text style={{ paddingHorizontal: 16, color: "#6B7280" }}>
            Đang tải...
          </Text>
        )}

        {!loading &&
          items.map((item) => (
            <View key={item.wordId} style={styles.vocabItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.word}>{item.word}</Text>
                <Text style={styles.meaning}>{item.meaning}</Text>
              </View>

              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => speakWord(item.word)}
              >
                <Ionicons
                  name="volume-high-outline"
                  size={20}
                  color="#4B5563"
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="star-outline" size={20} color="#4B5563" />
              </TouchableOpacity>
            </View>
          ))}

        {!loading && items.length === 0 && (
          <Text
            style={{
              paddingHorizontal: 16,
              color: "#6B7280",
              marginTop: 8,
            }}
          >
            Chưa có thuật ngữ nào.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DocumentListDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: "space-between",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  topCardWrapper: { paddingHorizontal: CARD_HORIZONTAL_MARGIN, marginTop: 4 },
  flashcardPreview: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 0,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  previewText: { fontSize: 18, fontWeight: "600", color: "#111827" },
  previewSubText: { marginTop: 6, fontSize: 13, color: "#6B7280" },
  flashcardCard: {
    paddingVertical: 30,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  flashcardWord: { fontSize: 20, fontWeight: "700", color: "#111827" },
  flashcardMeaning: { marginTop: 8, fontSize: 15, color: "#374151" },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 4,
  },
  dotActive: { backgroundColor: "#111827" },
  listInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  authorRow: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FCD34D",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  avatarText: { fontSize: 14, fontWeight: "700", color: "#111827" },
  authorName: { fontSize: 13, color: "#111827" },
  dotSeparator: { marginHorizontal: 4, color: "#6B7280" },
  termCount: { fontSize: 13, color: "#6B7280" },
  favoriteButton: { marginLeft: 12 },
  vocabHeaderRow: {
    marginTop: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  vocabHeader: { fontSize: 15, fontWeight: "600", color: "#111827" },
  vocabItem: {
    marginTop: 8,
    marginHorizontal: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
  },
  word: { fontSize: 15, fontWeight: "600", color: "#111827" },
  meaning: { fontSize: 13, color: "#4B5563", marginTop: 2 },
  iconButton: { marginLeft: 8 },
});
