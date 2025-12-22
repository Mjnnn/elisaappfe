import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { AuthStackParamList } from "../../navigation/AuthStack";
import classService from "../../services/classService";

type NavProp = NativeStackNavigationProp<AuthStackParamList, "CreateClass">;

const CreateClassScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();

  const [userId, setUserId] = useState<number | null>(null);
  const [className, setClassName] = useState("");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadUserId = async () => {
      const stored = await AsyncStorage.getItem("userId");
      const parsed = Number(stored);
      if (!stored || Number.isNaN(parsed) || parsed <= 0) {
        Alert.alert("Thông báo", "Bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
        navigation.navigate("Login");
        return;
      }
      setUserId(parsed);
    };
    loadUserId();
  }, [navigation]);

  const validate = () => {
    if (!className.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tên lớp học.");
      return false;
    }
    if (!password.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập mật khẩu tham gia.");
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (!userId) return;
    if (!validate()) return;

    try {
      setSubmitting(true);
      const payload = {
        className: className.trim(),
        description: description.trim(),
        userId,
        password: password.trim(),
      };

      const res = await classService.create(payload);
      const created = res.data;
      const classId = created?.classId ?? created?.id;

      if (!classId) {
        Alert.alert("Lỗi", "Không lấy được classId từ API.");
        return;
      }

      Alert.alert("OK", "Đã tạo lớp học!");
      navigation.replace("ClassDetail", { classId, mode: "OWNER" });
    } catch (e: any) {
      console.error(e);
      Alert.alert("Lỗi", e?.response?.data?.message ?? "Tạo lớp thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#111" />
        </TouchableOpacity>

        <Text style={styles.title}>Tạo lớp học</Text>

        <TouchableOpacity
          style={[styles.saveBtn, submitting && { opacity: 0.6 }]}
          disabled={submitting}
          onPress={handleCreate}
        >
          <Text style={styles.saveText}>Tạo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Tên lớp học *</Text>
        <TextInput
          value={className}
          onChangeText={setClassName}
          placeholder="Ví dụ: Toán 10A1"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
        />

        <Text style={styles.label}>Mô tả lớp học</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Mô tả ngắn gọn..."
          placeholderTextColor="#9CA3AF"
          style={[styles.input, styles.textArea]}
          multiline
        />

        <Text style={styles.label}>Mật khẩu tham gia *</Text>
        <View style={styles.passRow}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Nhập mật khẩu"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showPass}
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
          />
          <TouchableOpacity onPress={() => setShowPass((p) => !p)} style={styles.eyeBtn}>
            <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={18} color="#111" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, submitting && { opacity: 0.7 }]}
          onPress={handleCreate}
          disabled={submitting}
        >
          <Text style={styles.primaryText}>{submitting ? "Đang tạo..." : "Tạo lớp học"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CreateClassScreen;

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
  title: { fontSize: 18, fontWeight: "900", color: "#111" },
  saveBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
  },
  saveText: { color: "#2563EB", fontWeight: "900" },

  form: { paddingHorizontal: 16, paddingTop: 10 },
  label: { color: "#111", fontWeight: "800", marginBottom: 6 },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    color: "#111",
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  textArea: { minHeight: 90, textAlignVertical: "top" },

  passRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  eyeBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  primaryBtn: {
    marginTop: 6,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryText: { color: "#fff", fontWeight: "900" },
});
