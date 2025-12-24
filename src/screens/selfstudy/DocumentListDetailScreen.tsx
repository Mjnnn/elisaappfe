// src/screens/selfstudy/DocumentListDetailScreen.tsx

import React, { useEffect, useMemo, useState } from "react";
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
  Modal,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
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
import documentReportService from "../../services/documentReportService"; // ✅ bạn cần tạo service này như mình đã viết
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

type ReportReasonType = "EMPTY" | "INVALID" | "CUSTOM";

const REPORT_REASON_TEXT: Record<Exclude<ReportReasonType, "CUSTOM">, string> = {
  EMPTY: "Nội dung rỗng",
  INVALID: "Nội dung không hợp lệ",
};

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

  // ✅ report state
  const [isReported, setIsReported] = useState<boolean>(false);
  const [reportId, setReportId] = useState<number | null>(null);
  const [reportLoading, setReportLoading] = useState<boolean>(false);

  // ✅ modal report
  const [reportModalVisible, setReportModalVisible] =
    useState<boolean>(false);
  const [selectedReasonType, setSelectedReasonType] =
    useState<ReportReasonType>("EMPTY");
  const [customReason, setCustomReason] = useState<string>("");

  const resolvedReasonText = useMemo(() => {
    if (selectedReasonType === "CUSTOM") return customReason?.trim() ?? "";
    return REPORT_REASON_TEXT[selectedReasonType];
  }, [selectedReasonType, customReason]);

  const requireLogin = () => {
    Alert.alert("Thông báo", "Bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
    navigation.navigate("Login" as never);
  };

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

  // Load items + check favorite + check report (khi đã có userId)
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
        setIsFavorite(true);
        const favId = res?.data?.favoriteId ?? res?.data?.id;
        setFavoriteId(typeof favId === "number" ? favId : null);
      } catch (error: any) {
        if (error?.response?.status === 404) {
          setIsFavorite(false);
          setFavoriteId(null);
        } else {
          console.error("Check favorite failed:", error);
        }
      }
    };

    // ✅ check report: BE của bạn không có endpoint "check" riêng,
    // nên mình lấy tất cả report theo userId rồi tìm report có listId
    const fetchReport = async (uid: number) => {
      try {
        const res = await documentReportService.getReportsByUserId(uid);
        const arr = (res?.data ?? []) as any[];

        const found = arr.find((r) => Number(r?.listId) === Number(listId));
        if (found) {
          setIsReported(true);
          const rid = found?.reportId ?? found?.id;
          setReportId(typeof rid === "number" ? rid : null);

          // nếu muốn hiển thị reason cũ, có thể set lại:
          // setSelectedReasonType("CUSTOM");
          // setCustomReason(found?.reason ?? "");
        } else {
          setIsReported(false);
          setReportId(null);
        }
      } catch (error) {
        console.error("Check report failed:", error);
        setIsReported(false);
        setReportId(null);
      }
    };

    fetchItems();

    if (typeof userId === "number") {
      fetchFavorite(userId);
      fetchReport(userId);
    } else {
      setIsFavorite(false);
      setFavoriteId(null);
      setIsReported(false);
      setReportId(null);
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
      requireLogin();
      return;
    }

    try {
      setFavoriteLoading(true);

      if (!isFavorite) {
        const res = await favoriteDocumentListService.create({
          userId,
          listId,
        });

        setIsFavorite(true);
        const favId = res?.data?.favoriteId ?? res?.data?.id;
        setFavoriteId(typeof favId === "number" ? favId : null);
      } else {
        if (favoriteId != null) {
          await favoriteDocumentListService.delete(favoriteId);
        } else {
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

  // ✅ mở modal báo cáo
  const openReportModal = () => {
    if (typeof userId !== "number") {
      requireLogin();
      return;
    }

    // nếu đã report -> bấm lại để xoá report (toggle)
    if (isReported) {
      Alert.alert(
        "Xoá báo cáo?",
        "Bạn đã báo cáo tài liệu này. Bạn muốn xoá báo cáo không?",
        [
          { text: "Huỷ", style: "cancel" },
          {
            text: "Xoá",
            style: "destructive",
            onPress: () => deleteReport(),
          },
        ]
      );
      return;
    }

    // reset form
    setSelectedReasonType("EMPTY");
    setCustomReason("");
    setReportModalVisible(true);
  };

  const closeReportModal = () => {
    setReportModalVisible(false);
  };

  const submitReport = async () => {
    if (reportLoading) return;

    if (typeof userId !== "number") {
      requireLogin();
      return;
    }

    const reason = resolvedReasonText;
    if (!reason || reason.length === 0) {
      Alert.alert("Thiếu lý do", "Vui lòng chọn hoặc nhập lý do báo cáo.");
      return;
    }

    if (selectedReasonType === "CUSTOM" && reason.length < 5) {
      Alert.alert("Lý do quá ngắn", "Vui lòng nhập lý do ít nhất 5 ký tự.");
      return;
    }

    try {
      setReportLoading(true);

      const res = await documentReportService.createReport({
        userId,
        listId,
        reason,
      });

      const rid = res?.data?.reportId; // Assuming 'id' is not a valid property
      setIsReported(true);
      setReportId(typeof rid === "number" ? rid : null);

      setReportModalVisible(false);
      Alert.alert("Thành công", "Báo cáo của bạn đã được ghi nhận.");
    } catch (error: any) {
      console.error("Create report failed:", error);
      Alert.alert(
        "Lỗi",
        error?.response?.data?.message ??
          "Không thể gửi báo cáo. Vui lòng thử lại."
      );
    } finally {
      setReportLoading(false);
    }
  };

  const deleteReport = async () => {
    if (reportLoading) return;

    if (typeof userId !== "number") {
      requireLogin();
      return;
    }

    try {
      setReportLoading(true);

      if (reportId != null) {
        await documentReportService.deleteReport(reportId);
      } else {
        // fallback: tìm lại reportId theo userId rồi xoá
        const res = await documentReportService.getReportsByUserId(userId);
        const arr = (res?.data ?? []) as any[];
        const found = arr.find((r) => Number(r?.listId) === Number(listId));
        const rid = found?.reportId ?? found?.id;
        if (typeof rid === "number") {
          await documentReportService.deleteReport(rid);
        } else {
          throw new Error("Không tìm thấy reportId để xoá.");
        }
      }

      setIsReported(false);
      setReportId(null);
      Alert.alert("Đã xoá", "Bạn đã xoá báo cáo cho tài liệu này.");
    } catch (error: any) {
      console.error("Delete report failed:", error);
      Alert.alert(
        "Lỗi",
        error?.response?.data?.message ??
          "Không thể xoá báo cáo. Vui lòng thử lại."
      );
    } finally {
      setReportLoading(false);
    }
  };

  const ReasonRow = ({
    type,
    label,
  }: {
    type: ReportReasonType;
    label: string;
  }) => {
    const checked = selectedReasonType === type;
    return (
      <TouchableOpacity
        style={styles.reasonRow}
        onPress={() => setSelectedReasonType(type)}
        activeOpacity={0.8}
      >
        <View style={[styles.radio, checked && styles.radioChecked]}>
          {checked && <View style={styles.radioDot} />}
        </View>
        <Text style={styles.reasonText}>{label}</Text>
      </TouchableOpacity>
    );
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

          {/* INFO + ACTION ICONS */}
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

            {/* ✅ REPORT ICON (bên trái trái tim) */}
            <TouchableOpacity
              style={styles.iconActionBtn}
              onPress={openReportModal}
              disabled={reportLoading}
            >
              <Ionicons
                name={isReported ? "flag" : "flag-outline"}
                size={22}
                color={isReported ? "#F97316" : "#9CA3AF"}
              />
            </TouchableOpacity>

            {/* FAVORITE ICON */}
            <TouchableOpacity
              style={styles.iconActionBtn}
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

      {/* ✅ REPORT MODAL */}
      <Modal
        visible={reportModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeReportModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeReportModal}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
              <Text style={styles.modalTitle}>Báo cáo tài liệu</Text>
              <Text style={styles.modalSubTitle}>
                Chọn lý do hoặc nhập lý do của bạn.
              </Text>

              <ReasonRow type="EMPTY" label="Nội dung rỗng" />
              <ReasonRow type="INVALID" label="Nội dung không hợp lệ" />
              <ReasonRow type="CUSTOM" label="Lý do khác (tự nhập)" />

              {selectedReasonType === "CUSTOM" && (
                <View style={{ marginTop: 10 }}>
                  <TextInput
                    value={customReason}
                    onChangeText={setCustomReason}
                    placeholder="Nhập lý do báo cáo..."
                    placeholderTextColor="#9CA3AF"
                    style={styles.textArea}
                    multiline
                    maxLength={300}
                  />
                  <Text style={styles.counterText}>
                    {customReason.length}/300
                  </Text>
                </View>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.btn, styles.btnGhost]}
                  onPress={closeReportModal}
                  disabled={reportLoading}
                >
                  <Text style={[styles.btnText, styles.btnGhostText]}>
                    Huỷ
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.btnPrimary]}
                  onPress={submitReport}
                  disabled={reportLoading}
                >
                  <Text style={styles.btnText}>
                    {reportLoading ? "Đang gửi..." : "Gửi báo cáo"}
                  </Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </Pressable>
        </Pressable>
      </Modal>
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

  iconActionBtn: { marginLeft: 12 },

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

  // ✅ modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  modalSubTitle: {
    marginTop: 6,
    fontSize: 13,
    color: "#6B7280",
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  radioChecked: {
    borderColor: "#111827",
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#111827",
  },
  reasonText: {
    fontSize: 14,
    color: "#111827",
  },
  textArea: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
    textAlignVertical: "top",
  },
  counterText: {
    marginTop: 6,
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "right",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 14,
  },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginLeft: 10,
  },
  btnGhost: {
    backgroundColor: "#F3F4F6",
  },
  btnPrimary: {
    backgroundColor: "#111827",
  },
  btnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  btnGhostText: {
    color: "#111827",
  },
});
