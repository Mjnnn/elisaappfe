// src/screens/selfstudy/EditDocumentListScreen.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";

import { AuthStackParamList } from "../../navigation/AuthStack";
import documentListService from "../../services/documentListService";
import documentItemService from "../../services/documentItemService";

type NavProp = NativeStackNavigationProp<AuthStackParamList, "EditDocumentList">;
type R = RouteProp<AuthStackParamList, "EditDocumentList">;

type Item = {
  wordId?: number;
  listId: number;
  word: string;
  meaning: string;
  example?: string;
  vocabImage?: string;

  // local
  saving?: boolean;
  uploadingImage?: boolean;
};

const DOCUMENT_TYPES = [
  { label: "Từ vựng", value: "VOCAB" },
  { label: "Ngữ pháp", value: "GRAMMAR" },
  { label: "Khác", value: "OTHER" },
];

// ✅ Cloudinary config (điền của bạn)
const CLOUD_NAME = "dfeefsbap"; // ✅ Cloud name của bạn
const UPLOAD_PRESET = "ktiger_unsigned"; // ✅ preset Unsigned bạn tạo
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

const EditDocumentListScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<R>();
  const { listId } = route.params;

  const [loading, setLoading] = useState(false);

  // list info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("VOCAB");
  // BE: isPublic 0=public, 1=private
  const [isPublic, setIsPublic] = useState<number>(0);

  const [items, setItems] = useState<Item[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);

      const listRes = await documentListService.getById(listId);
      const list = listRes.data;

      setTitle(list?.title ?? "");
      setDescription(list?.description ?? "");
      setType(list?.type ?? "VOCAB");
      setIsPublic(typeof list?.isPublic === "number" ? list.isPublic : 0);

      const itemsRes = await documentItemService.getByListId(listId);
      const arr = Array.isArray(itemsRes.data)
        ? itemsRes.data
        : itemsRes.data?.content ?? [];

      const mapped: Item[] = arr.map((x: any) => ({
        wordId: x.wordId ?? x.id,
        listId,
        word: x.word ?? "",
        meaning: x.meaning ?? "",
        example: x.example ?? "",
        vocabImage: x.vocabImage ?? "",
      }));

      setItems(mapped);
    } catch (e) {
      console.log("Load edit list error:", e);
      Alert.alert("Lỗi", "Không tải được dữ liệu danh sách.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listId]);

  const updateItemLocal = (index: number, patch: Partial<Item>) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const validateList = () => {
    if (!title.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tên danh sách.");
      return false;
    }
    if (!type) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn loại.");
      return false;
    }
    return true;
  };

  const handleSaveList = async () => {
    if (!validateList()) return;

    try {
      setLoading(true);

      await documentListService.updateDocumentList(listId, {
        title: title.trim(),
        description: description.trim(),
        type,
        isPublic,
      });

      Alert.alert("Thành công", "Đã lưu danh sách.");
      navigation.navigate("LibraryScreen");
    } catch (e) {
      console.log("Update list error:", e);
      Alert.alert("Lỗi", "Lưu danh sách thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { listId, word: "", meaning: "", example: "", vocabImage: "" },
    ]);
  };

  // ✅ xin quyền truy cập thư viện ảnh
  const ensureMediaPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Thiếu quyền", "Bạn cần cấp quyền truy cập ảnh để chọn hình.");
      return false;
    }
    return true;
  };

  // ✅ upload ảnh lên Cloudinary, trả về secure_url
  const uploadToCloudinary = async (localUri: string) => {
    const formData = new FormData();

    // đoán extension
    const filename = localUri.split("/").pop() ?? `upload_${Date.now()}.jpg`;
    const match = /\.(\w+)$/.exec(filename);
    const ext = match?.[1]?.toLowerCase();
    const mimeType =
      ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

    formData.append("file", {
      uri: localUri,
      name: filename,
      type: mimeType,
    } as any);

    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      console.log("Cloudinary upload failed:", data);
      throw new Error(data?.error?.message ?? "Upload Cloudinary thất bại");
    }

    return data?.secure_url as string;
  };

  // ✅ chọn ảnh + upload + set vocabImage cho item
  const handlePickAndUploadImage = async (index: number) => {
    const ok = await ensureMediaPermission();
    if (!ok) return;

    try {
      updateItemLocal(index, { uploadingImage: true });

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.85,
      });

      if (result.canceled) return;

      const uri = result.assets?.[0]?.uri;
      if (!uri) return;

      const url = await uploadToCloudinary(uri);

      // ✅ lưu link vào item
      updateItemLocal(index, { vocabImage: url });

      Alert.alert("OK", "Đã upload ảnh.");
    } catch (e: any) {
      console.log("Pick/upload image error:", e);
      Alert.alert("Lỗi", e?.message ?? "Upload ảnh thất bại.");
    } finally {
      updateItemLocal(index, { uploadingImage: false });
    }
  };

  const handleSaveItem = async (index: number) => {
    const it = items[index];

    if (!it.word.trim()) {
      Alert.alert("Thiếu dữ liệu", `Mục #${index + 1} thiếu word.`);
      return;
    }
    if (!it.meaning.trim()) {
      Alert.alert("Thiếu dữ liệu", `Mục #${index + 1} thiếu meaning.`);
      return;
    }

    try {
      updateItemLocal(index, { saving: true });

      const payload = {
        listId,
        word: it.word.trim(),
        meaning: it.meaning.trim(),
        example: (it.example ?? "").trim(),
        vocabImage: (it.vocabImage ?? "").trim(), // ✅ gửi link cloudinary về BE
      };

      if (it.wordId) {
        await documentItemService.update(it.wordId, payload);
      } else {
        const res = await documentItemService.create(payload);
        const created = res.data;
        const newId = created?.wordId ?? created?.id;
        if (newId) updateItemLocal(index, { wordId: newId });
      }

      Alert.alert("OK", `Đã lưu mục #${index + 1}`);
    } catch (e) {
      console.log("Save item error:", e);
      Alert.alert("Lỗi", "Lưu mục thất bại.");
    } finally {
      updateItemLocal(index, { saving: false });
    }
  };

  const handleDeleteItem = async (index: number) => {
    const it = items[index];

    if (!it.wordId) {
      setItems((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    Alert.alert("Xoá mục", `Bạn chắc chắn muốn xoá mục #${index + 1}?`, [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            await documentItemService.delete(it.wordId!);
            setItems((prev) => prev.filter((_, i) => i !== index));
          } catch (e) {
            console.log("Delete item error:", e);
            Alert.alert("Lỗi", "Xoá mục thất bại.");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleDeleteList = async () => {
    Alert.alert(
      "Xoá tài liệu",
      "Bạn chắc chắn muốn xoá tài liệu này?\n(Lưu ý: sẽ xoá luôn toàn bộ items)",
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xoá",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await documentItemService.deleteByListId(listId);
              await documentListService.deleteDocumentList(listId);
              Alert.alert("OK", "Đã xoá tài liệu.");
              navigation.navigate("LibraryScreen");
            } catch (e) {
              console.log("Delete list error:", e);
              Alert.alert("Lỗi", "Xoá tài liệu thất bại.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#111" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Sửa tài liệu</Text>

        <TouchableOpacity style={styles.trashBtn} onPress={handleDeleteList}>
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {loading && (
          <Text style={{ paddingHorizontal: 16, color: "#6B7280" }}>Loading...</Text>
        )}

        {/* Thông tin danh sách */}
        <View style={styles.box}>
          <Text style={styles.boxTitle}>Thông tin danh sách</Text>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Tên danh sách"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />

          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Mô tả"
            placeholderTextColor="#9CA3AF"
            style={[styles.input, styles.textArea]}
            multiline
          />

          <View style={styles.typeRow}>
            <Text style={styles.typeLabel}>Loại:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {DOCUMENT_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.value}
                  onPress={() => setType(t.value)}
                  style={[styles.typeChip, type === t.value && styles.typeChipActive]}
                >
                  <Text style={[styles.typeChipText, type === t.value && styles.typeChipTextActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity
            style={styles.checkRow}
            onPress={() => setIsPublic((p) => (p === 0 ? 1 : 0))}
            activeOpacity={0.85}
          >
            <View style={[styles.checkbox, isPublic === 0 && styles.checkboxChecked]}>
              {isPublic === 0 && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <Text style={styles.checkText}>Công khai</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveListBtn} onPress={handleSaveList} activeOpacity={0.9}>
            <Text style={styles.saveListText}>Lưu danh sách</Text>
          </TouchableOpacity>
        </View>

        {/* Items */}
        <View style={styles.itemsHeader}>
          <Text style={styles.itemsTitle}>Các mục từ vựng</Text>

          <TouchableOpacity style={styles.addBtn} onPress={addItem} activeOpacity={0.9}>
            <Text style={styles.addBtnText}>+ Thêm mục</Text>
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 16, gap: 12 }}>
          {items.map((it, index) => (
            <View key={it.wordId ?? `new-${index}`} style={styles.itemCard}>
              <View style={styles.itemTop}>
                <Text style={styles.itemLabel}>Mục #{index + 1}</Text>

                <TouchableOpacity onPress={() => handleDeleteItem(index)}>
                  <Text style={styles.deleteText}>Xoá</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                value={it.word}
                onChangeText={(v) => updateItemLocal(index, { word: v })}
                placeholder="word"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />

              <TextInput
                value={it.meaning}
                onChangeText={(v) => updateItemLocal(index, { meaning: v })}
                placeholder="meaning"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />

              <TextInput
                value={it.example ?? ""}
                onChangeText={(v) => updateItemLocal(index, { example: v })}
                placeholder="example"
                placeholderTextColor="#9CA3AF"
                style={[styles.input, styles.textArea]}
                multiline
              />

              {/* ✅ Preview ảnh nếu có */}
              {!!it.vocabImage && (
                <Image source={{ uri: it.vocabImage }} style={styles.previewImg} />
              )}

              {/* ✅ Upload ảnh Cloudinary */}
              <TouchableOpacity
                style={styles.changeImageRow}
                onPress={() => handlePickAndUploadImage(index)}
                disabled={it.uploadingImage}
              >
                {it.uploadingImage ? (
                  <ActivityIndicator />
                ) : (
                  <Ionicons name="image-outline" size={16} color="#2563EB" />
                )}
                <Text style={styles.changeImageText}>
                  {it.uploadingImage ? "Đang upload..." : it.vocabImage ? "Đổi hình" : "Thêm hình"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveItemBtn, (it.saving || it.uploadingImage) && { opacity: 0.7 }]}
                onPress={() => handleSaveItem(index)}
                disabled={it.saving || it.uploadingImage}
              >
                <Text style={styles.saveItemText}>
                  {it.saving ? "Đang lưu..." : "Lưu mục"}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditDocumentListScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#111" },
  trashBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },

  box: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 14,
    backgroundColor: "#fff",
  },
  boxTitle: { fontSize: 16, fontWeight: "800", color: "#111", marginBottom: 12 },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    color: "#111",
    marginBottom: 12,
  },
  textArea: { minHeight: 80, textAlignVertical: "top" },

  typeRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  typeLabel: { color: "#111", fontWeight: "700" },
  typeChip: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#fff",
  },
  typeChipActive: { backgroundColor: "#EEF2FF", borderColor: "#BFDBFE" },
  typeChipText: { color: "#111", fontWeight: "700" },
  typeChipTextActive: { color: "#2563EB" },

  checkRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  checkText: { color: "#111", fontWeight: "700" },

  saveListBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  saveListText: { color: "#fff", fontWeight: "900" },

  itemsHeader: {
    marginTop: 18,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  itemsTitle: { fontSize: 18, fontWeight: "900", color: "#111" },
  addBtn: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addBtnText: { color: "#111", fontWeight: "900" },

  itemCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 14,
    backgroundColor: "#fff",
  },
  itemTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  itemLabel: { color: "#111", fontWeight: "900" },
  deleteText: { color: "#EF4444", fontWeight: "900" },

  previewImg: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    marginTop: 4,
    marginBottom: 10,
    backgroundColor: "#F3F4F6",
  },

  changeImageRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  changeImageText: { color: "#2563EB", fontWeight: "800" },

  saveItemBtn: {
    marginTop: 10,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  saveItemText: { color: "#fff", fontWeight: "900" },
});
