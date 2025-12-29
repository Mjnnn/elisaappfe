// src/screens/selfstudy/CreateDocumentListScreen.tsx

import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Alert,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";

import SelfStudyBottomBar from "../../components/SelfStudyBottomBar";
import documentListService from "../../services/documentListService";
import { AuthStackParamList } from "../../navigation/AuthStack";

type NavProp = NativeStackNavigationProp<AuthStackParamList, "CreateDocumentList">;

type CardDraft = {
  term: string;
  definition: string;
  example: string;
  vocabImage?: string;       // link cloudinary
  uploading?: boolean;       // local UI state
};

const EMPTY_CARD: CardDraft = { term: "", definition: "", example: "", vocabImage: "", uploading: false };

// ✅ bỏ SQL
const DOCUMENT_TYPES = [
  { label: "Từ vựng", value: "VOCAB" },
  { label: "Ngữ pháp", value: "GRAMMAR" },
  { label: "Khác", value: "OTHER" },
];

// ====== Cloudinary config (bạn đổi đúng của bạn) ======
const CLOUD_NAME = "dfeefsbap";           // ví dụ: "ba0344d1eef9e8b6e6b5128b99e36"
const UPLOAD_PRESET = "ktiger_unsigned";        // theo ảnh bạn gửi
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

async function uploadToCloudinary(localUri: string): Promise<string> {
  const filename = localUri.split("/").pop() || `image_${Date.now()}.jpg`;
  const match = /\.(\w+)$/.exec(filename);
  const fileType = match ? `image/${match[1]}` : `image`;

  const form = new FormData();
  form.append("file", {
    uri: localUri,
    name: filename,
    type: fileType,
  } as any);
  form.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: "POST",
    body: form,
  });

  const json = await res.json();
  if (!res.ok) {
    // Cloudinary hay trả error.message
    const msg = json?.error?.message ?? "Upload ảnh thất bại.";
    throw new Error(msg);
  }

  // bạn có thể dùng secure_url cho https
  return json.secure_url || json.url;
}

const CreateDocumentListScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();

  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const loadUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (!storedUserId) {
          Alert.alert("Thông báo", "Bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
          navigation.navigate("Login");
          return;
        }

        const parsed = Number(storedUserId);
        if (Number.isNaN(parsed) || parsed <= 0) {
          Alert.alert("Lỗi", "userId lưu trong máy không hợp lệ.");
          navigation.navigate("Login");
          return;
        }

        setUserId(parsed);
      } catch (err) {
        console.log("Load userId error:", err);
        Alert.alert("Lỗi", "Không đọc được session đăng nhập.");
      }
    };

    loadUserId();
  }, [navigation]);

  // ===== state form =====
  const [title, setTitle] = useState("");
  const [type, setType] = useState<string>("");
  const [description, setDescription] = useState("");
  const [onlyMe, setOnlyMe] = useState(false);

  const [cards, setCards] = useState<CardDraft[]>([{ ...EMPTY_CARD }]);
  const [submitting, setSubmitting] = useState(false);

  // ===== bulk modal =====
  const [bulkVisible, setBulkVisible] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkMode, setBulkMode] = useState<"comma" | "tab">("comma");
  const [previewVisible, setPreviewVisible] = useState(false);

  const [activeTab, setActiveTab] = useState<string>("Create");

  const parsedPreview = useMemo(() => {
    const lines = bulkText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const sep = bulkMode === "comma" ? "," : "\t";
    const parsed: CardDraft[] = [];

    for (const line of lines) {
      const parts = line.split(sep).map((p) => p.trim());
      const term = parts[0] ?? "";
      const definition = parts[1] ?? "";
      const example = parts.slice(2).join(sep) ?? "";
      if (!term && !definition && !example) continue;

      parsed.push({ term, definition, example, vocabImage: "", uploading: false });
    }

    return parsed;
  }, [bulkText, bulkMode]);

  const addCard = () => setCards((prev) => [...prev, { ...EMPTY_CARD }]);

  const updateCard = (index: number, patch: Partial<CardDraft>) => {
    setCards((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const removeCard = (index: number) => {
    setCards((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const buildValidCards = () => {
    return cards
      .map((c) => ({
        term: c.term.trim(),
        definition: c.definition.trim(),
        example: c.example.trim(),
        vocabImage: (c.vocabImage ?? "").trim(),
      }))
      .filter((c) => c.term || c.definition || c.example || c.vocabImage);
  };

  const validate = () => {
    if (!userId) {
      Alert.alert("Lỗi", "Không có userId. Vui lòng đăng nhập lại.");
      return false;
    }
    if (!title.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tiêu đề.");
      return false;
    }
    if (!type) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn loại tài liệu.");
      return false;
    }

    const validCards = buildValidCards();
    if (validCards.length === 0) {
      Alert.alert("Thiếu thẻ", "Vui lòng thêm ít nhất 1 thẻ.");
      return false;
    }

    for (let i = 0; i < validCards.length; i++) {
      const c = validCards[i];
      if (!c.term) {
        Alert.alert("Thiếu dữ liệu", `Thẻ #${i + 1} đang thiếu "Thuật ngữ (word)".`);
        return false;
      }
      if (!c.definition) {
        Alert.alert("Thiếu dữ liệu", `Thẻ #${i + 1} đang thiếu "Định nghĩa (meaning)".`);
        return false;
      }
    }

    return true;
  };

  const appendParsedCards = () => {
    if (parsedPreview.length === 0) {
      Alert.alert("Thông báo", "Không có dữ liệu hợp lệ để nhập.");
      return;
    }
    setCards((prev) => [...prev, ...parsedPreview]);
    setBulkVisible(false);
    setPreviewVisible(false);
    setBulkText("");
  };

  const handleTabPress = (tabName: string) => {
    setActiveTab(tabName);

    if (tabName === "Home") {
      navigation.navigate("SelfStudyScreen");
      return;
    }
    if (tabName === "Create") return;
    if (tabName === "Library") {
      navigation.navigate("LibraryScreen");
      return;
    }
    if (tabName === "Class") {
      Alert.alert("Thông báo", "Bạn chưa tạo màn Class.");
      return;
    }
  };

  // ✅ chọn ảnh + upload cloudinary -> set link vào vocabImage
  const handlePickImage = async (index: number) => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Thiếu quyền", "Bạn cần cấp quyền truy cập thư viện ảnh.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.85,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (result.canceled) return;

      const uri = result.assets?.[0]?.uri;
      if (!uri) return;

      updateCard(index, { uploading: true });

      const url = await uploadToCloudinary(uri);

      updateCard(index, { vocabImage: url, uploading: false });
      Alert.alert("OK", "Đã tải ảnh lên thành công!");
    } catch (e: any) {
      console.log("Upload image error:", e);
      updateCard(index, { uploading: false });
      Alert.alert("Lỗi", e?.message ?? "Upload ảnh thất bại.");
    }
  };

  const handleRemoveImage = (index: number) => {
    Alert.alert("Xoá ảnh", "Bạn muốn xoá ảnh của thẻ này?", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: () => updateCard(index, { vocabImage: "" }),
      },
    ]);
  };

  const handleCreate = async () => {
    if (!validate()) return;

    // chặn nếu đang upload ảnh
    const uploadingIndex = cards.findIndex((c) => c.uploading);
    if (uploadingIndex !== -1) {
      Alert.alert("Đang tải ảnh", `Thẻ #${uploadingIndex + 1} đang upload ảnh. Vui lòng chờ.`);
      return;
    }

    try {
      setSubmitting(true);

      const isPublic = onlyMe ? 1 : 0;
      const validCards = buildValidCards();

      const payload = {
        userId,
        title: title.trim(),
        description: description.trim(),
        type,
        isPublic,
        items: validCards.map((c) => ({
          word: c.term,
          meaning: c.definition,
          example: c.example || null,
          vocabImage: c.vocabImage || null, // ✅ gửi link cloudinary về BE
        })),
      };

      const createRes = await documentListService.createDocumentList(payload);
      const created = createRes?.data;

      const listId: number | undefined =
        created?.listId ?? created?.id ?? created?.documentListId;

      if (!listId) {
        console.log("Create list response:", created);
        Alert.alert("Lỗi", "Không lấy được listId từ API.");
        return;
      }

      Alert.alert("Thành công", "Đã tạo tài liệu học tập!");

      navigation.navigate("DocumentListDetail", {
        listId,
        title: title.trim(),
        author: created?.fullName ?? "",
        itemCount: validCards.length,
      });
    } catch (e: any) {
      console.log("Create document list error:", e);
      Alert.alert(
        "Lỗi",
        e?.response?.data?.message ?? e?.message ?? "Tạo tài liệu thất bại. Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#111" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Create</Text>

        <TouchableOpacity onPress={handleCreate} disabled={submitting} style={styles.headerAction}>
          <Text style={[styles.headerActionText, submitting && { opacity: 0.6 }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        {/* FORM */}
        <View style={styles.formWrap}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder='Nhập tiêu đề, ví dụ "Sinh học - Chương 22: Tiến hóa"'
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />

          {/* ✅ FIX Picker mất chữ */}
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={type}
              onValueChange={(v: string) => setType(v)}
              style={styles.picker}
              dropdownIconColor="#111"
              itemStyle={Platform.OS === "ios" ? { fontSize: 15, color: "#111" } : undefined}
            >
              <Picker.Item label="-- Chọn loại tài liệu --" value="" color="#6B7280" />
              {DOCUMENT_TYPES.map((t) => (
                <Picker.Item key={t.value} label={t.label} value={t.value} color="#111" />
              ))}
            </Picker>
          </View>

          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Thêm mô tả..."
            placeholderTextColor="#9CA3AF"
            style={[styles.input, styles.textArea]}
            multiline
          />

          {/* checkbox only me */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setOnlyMe((p) => !p)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, onlyMe && styles.checkboxChecked]}>
              {onlyMe && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <Text style={styles.checkboxText}>Chỉ mình tôi</Text>
          </TouchableOpacity>

          {/* actions */}
          <View style={styles.actionsRow}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnBlue]}
                onPress={() => setBulkVisible(true)}
                activeOpacity={0.9}
              >
                <Text style={styles.actionBtnText}>+ Nhập</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnGreen]}
                onPress={addCard}
                activeOpacity={0.9}
              >
                <Text style={styles.actionBtnText}>+ Thêm thẻ</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, submitting && { opacity: 0.7 }]}
              onPress={handleCreate}
              disabled={submitting}
              activeOpacity={0.9}
            >
              <Text style={styles.primaryBtnText}>
                {submitting ? "Đang tạo..." : "Tạo và ôn luyện"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* CARDS */}
        <View style={styles.cardsWrap}>
          {cards.map((c, idx) => (
            <View key={idx} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Thẻ #{idx + 1}</Text>

                <TouchableOpacity onPress={() => removeCard(idx)} activeOpacity={0.8}>
                  <Ionicons name="trash-outline" size={18} color="#111" />
                </TouchableOpacity>
              </View>

              <View style={styles.row2}>
                <TextInput
                  value={c.term}
                  onChangeText={(v) => updateCard(idx, { term: v })}
                  placeholder="Thuật ngữ (word) *"
                  placeholderTextColor="#9CA3AF"
                  style={[styles.input, styles.half]}
                />

                <TextInput
                  value={c.definition}
                  onChangeText={(v) => updateCard(idx, { definition: v })}
                  placeholder="Định nghĩa (meaning) *"
                  placeholderTextColor="#9CA3AF"
                  style={[styles.input, styles.half]}
                />
              </View>

              <TextInput
                value={c.example}
                onChangeText={(v) => updateCard(idx, { example: v })}
                placeholder="Ví dụ"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />

              {/* ✅ Upload ảnh */}
              <View style={styles.imageRow}>
                <TouchableOpacity
                  style={[styles.imageBtn, c.uploading && { opacity: 0.7 }]}
                  onPress={() => handlePickImage(idx)}
                  disabled={c.uploading}
                  activeOpacity={0.9}
                >
                  <Ionicons name="image-outline" size={18} color="#2563EB" />
                  <Text style={styles.imageBtnText}>
                    {c.vocabImage ? "Đổi hình" : "Thêm hình"}
                  </Text>
                  {c.uploading && (
                    <View style={{ marginLeft: 8 }}>
                      <ActivityIndicator />
                    </View>
                  )}
                </TouchableOpacity>

                {!!c.vocabImage && (
                  <TouchableOpacity onPress={() => handleRemoveImage(idx)} style={styles.removeImageBtn}>
                    <Ionicons name="close-circle" size={20} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>

              {!!c.vocabImage && (
                <Image
                  source={{ uri: c.vocabImage }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* MODAL: BULK INPUT */}
      <Modal
        visible={bulkVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setBulkVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Nhập dữ liệu</Text>

            <TextInput
              value={bulkText}
              onChangeText={setBulkText}
              placeholder="word,meaning,example (cách nhau bằng dấu phẩy hoặc tab)"
              placeholderTextColor="#9CA3AF"
              multiline
              style={styles.modalTextArea}
            />

            <View style={styles.radioRow}>
              <TouchableOpacity
                style={styles.radioItem}
                onPress={() => setBulkMode("comma")}
                activeOpacity={0.8}
              >
                <View style={[styles.radio, bulkMode === "comma" && styles.radioActive]} />
                <Text style={styles.radioText}>Phẩy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioItem}
                onPress={() => setBulkMode("tab")}
                activeOpacity={0.8}
              >
                <View style={[styles.radio, bulkMode === "tab" && styles.radioActive]} />
                <Text style={styles.radioText}>Tab</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnOutline]}
                onPress={() => setBulkVisible(false)}
              >
                <Text style={styles.modalBtnOutlineText}>Huỷ</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnOutline]}
                onPress={() => setPreviewVisible(true)}
              >
                <Text style={styles.modalBtnOutlineText}>Xem trước</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnPrimary]}
                onPress={appendParsedCards}
              >
                <Text style={styles.modalBtnPrimaryText}>Nhập</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL: PREVIEW */}
      <Modal
        visible={previewVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { maxHeight: "75%" }]}>
            <Text style={styles.modalTitle}>Xem trước ({parsedPreview.length} thẻ)</Text>

            <ScrollView style={{ marginTop: 10 }}>
              {parsedPreview.length === 0 ? (
                <Text style={{ color: "#6B7280" }}>Chưa có dòng hợp lệ.</Text>
              ) : (
                parsedPreview.map((c, i) => (
                  <View key={i} style={styles.previewItem}>
                    <Text style={styles.previewTerm}>
                      {i + 1}. {c.term || "(trống)"}
                    </Text>
                    <Text style={styles.previewSub}>Định nghĩa: {c.definition || "-"}</Text>
                    <Text style={styles.previewSub}>Ví dụ: {c.example || "-"}</Text>
                  </View>
                ))
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnOutline]}
                onPress={() => setPreviewVisible(false)}
              >
                <Text style={styles.modalBtnOutlineText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <SelfStudyBottomBar activeTab={activeTab} onTabPress={handleTabPress} />
    </SafeAreaView>
  );
};

export default CreateDocumentListScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
  headerAction: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
  },
  headerActionText: { color: "#2563EB", fontWeight: "700" },

  formWrap: { paddingHorizontal: 16, paddingTop: 8 },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    color: "#111",
    marginBottom: 12,
  },
  textArea: { minHeight: 90, textAlignVertical: "top" },

  // ✅ FIX picker
  pickerWrap: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    height: Platform.OS === "ios" ? 180 : 52, // iOS picker cao, Android vừa đủ
    justifyContent: "center",
  },
  picker: {
    width: "100%",
    height: Platform.OS === "ios" ? 180 : 52,
    color: "#111",
  },

  checkboxRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkboxChecked: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  checkboxText: { color: "#111", fontWeight: "600" },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 10,
  },
  actionBtn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  actionBtnBlue: { backgroundColor: "#DBEAFE" },
  actionBtnGreen: { backgroundColor: "#DCFCE7" },
  actionBtnText: { color: "#111", fontWeight: "700" },

  primaryBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  primaryBtnText: { color: "#fff", fontWeight: "800" },

  cardsWrap: { paddingHorizontal: 16, paddingTop: 6, gap: 12 },
  card: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    backgroundColor: "#fff",
    padding: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: { fontSize: 14, fontWeight: "800", color: "#111" },
  row2: { flexDirection: "row", gap: 10 },
  half: { flex: 1 },

  imageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
    marginBottom: 10,
  },
  imageBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    flex: 1,
  },
  imageBtnText: { color: "#2563EB", fontWeight: "800" },
  removeImageBtn: { marginLeft: 10 },

  previewImage: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modalBox: { width: "100%", backgroundColor: "#fff", borderRadius: 14, padding: 14 },
  modalTitle: { fontSize: 16, fontWeight: "800", color: "#111" },
  modalTextArea: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    marginTop: 12,
    padding: 12,
    minHeight: 140,
    textAlignVertical: "top",
    color: "#111",
  },

  radioRow: { flexDirection: "row", gap: 16, marginTop: 12 },
  radioItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  radioActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  radioText: { color: "#111", fontWeight: "600" },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 14,
  },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  modalBtnOutline: { backgroundColor: "#F3F4F6" },
  modalBtnOutlineText: { color: "#111", fontWeight: "800" },
  modalBtnPrimary: { backgroundColor: "#2563EB" },
  modalBtnPrimaryText: { color: "#fff", fontWeight: "900" },

  previewItem: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#FAFAFB",
  },
  previewTerm: { color: "#111", fontWeight: "800" },
  previewSub: { color: "#374151", marginTop: 4 },
});
