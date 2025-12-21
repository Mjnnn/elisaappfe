import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { AuthStackParamList } from "../../../navigation/AuthStack";
import classUserService from "../../../services/classUserService";

type NavProp = NativeStackNavigationProp<AuthStackParamList, "ClassScreen">;

export type ClassUserResponse = {
  classUserId: number;
  classId: number;
  className: string;
  userId: number;
  userFullName?: string;
  joinedAt?: string;
  email?: string;
  avatarImage?: string;
};

const formatDateTime = (iso?: string) => {
  if (!iso) return "";
  return iso.replace("T", " ").slice(0, 19);
};

const JoinedClassesTab: React.FC<{ userId: number }> = ({ userId }) => {
  const navigation = useNavigation<NavProp>();
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState<ClassUserResponse[]>([]);

  const [joinClassId, setJoinClassId] = useState<string>("");
  const [joinPassword, setJoinPassword] = useState<string>("");
  const [showPass, setShowPass] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await classUserService.getByUser(userId);
      const data = res.data;
      const arr: ClassUserResponse[] = Array.isArray(data) ? data : data?.content ?? [];
      // loại những record có thể là owner nếu BE trả ở đây — giữ nguyên cũng ok
      setJoined(arr);
    } catch (e) {
      console.error(e);
      Alert.alert("Lỗi", "Không tải được lớp tham gia.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleJoin = async () => {
    const cid = Number(joinClassId);
    if (!cid || Number.isNaN(cid) || cid <= 0) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập Class ID hợp lệ.");
      return;
    }
    if (!joinPassword.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập mật khẩu lớp.");
      return;
    }

    try {
      setLoading(true);
      await classUserService.joinClass(cid, userId, joinPassword.trim());
      Alert.alert("OK", "Tham gia lớp thành công!");
      setJoinClassId("");
      setJoinPassword("");
      await load();
    } catch (e: any) {
      console.error(e);
      Alert.alert("Lỗi", e?.response?.data?.message ?? "Tham gia lớp thất bại (sai password hoặc không tồn tại).");
    } finally {
      setLoading(false);
    }
  };

  const confirmLeave = (cu: ClassUserResponse) => {
    Alert.alert("Rời lớp", `Bạn chắc chắn muốn rời lớp "${cu.className}"?`, [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Rời lớp",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            await classUserService.delete(cu.classUserId);
            Alert.alert("OK", "Đã rời lớp.");
            await load();
          } catch (e) {
            console.error(e);
            Alert.alert("Lỗi", "Rời lớp thất bại.");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
      {/* Join box */}
      <View style={styles.joinBox}>
        <Text style={styles.joinTitle}>Tham gia lớp</Text>

        <View style={styles.joinRow}>
          <TextInput
            value={joinClassId}
            onChangeText={setJoinClassId}
            placeholder="Nhập Class ID"
            keyboardType="numeric"
            style={[styles.input, { flex: 1 }]}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.passRow}>
          <TextInput
            value={joinPassword}
            onChangeText={setJoinPassword}
            placeholder="Mật khẩu lớp"
            secureTextEntry={!showPass}
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity onPress={() => setShowPass((p) => !p)} style={styles.eyeBtn}>
            <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={18} color="#111" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.joinBtn} onPress={handleJoin} activeOpacity={0.9} disabled={loading}>
          <Text style={styles.joinBtnText}>{loading ? "Đang xử lý..." : "Tham gia"}</Text>
        </TouchableOpacity>
      </View>

      {/* Joined list */}
      <View style={styles.rowHeader}>
        <Text style={styles.sectionTitle}>Lớp bạn đang tham gia</Text>
        <TouchableOpacity onPress={load} style={styles.refreshBtn}>
          <Ionicons name="refresh-outline" size={18} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {loading && <Text style={styles.muted}>Loading...</Text>}

      {!loading && joined.length === 0 && (
        <Text style={styles.muted}>Bạn chưa tham gia lớp học nào.</Text>
      )}

      {!loading &&
        joined.map((cu) => (
          <TouchableOpacity
            key={cu.classUserId}
            style={styles.card}
            activeOpacity={0.9}
            onPress={() =>
              navigation.navigate("ClassDetail", {
                classId: cu.classId,
                mode: "JOINED",
                classUserId: cu.classUserId,
              })
            }
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{cu.className}</Text>
              <Text style={styles.cardSub}>Tham gia: {formatDateTime(cu.joinedAt)}</Text>
            </View>

            <TouchableOpacity onPress={() => confirmLeave(cu)} style={styles.leaveBtn}>
              <Text style={styles.leaveText}>Rời lớp</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
    </ScrollView>
  );
};

export default JoinedClassesTab;

const styles = StyleSheet.create({
  joinBox: {
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 14,
    backgroundColor: "#fff",
  },
  joinTitle: { fontSize: 16, fontWeight: "900", color: "#111", marginBottom: 10 },
  joinRow: { flexDirection: "row", gap: 10 },

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

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#111",
    marginBottom: 12,
  },

  joinBtn: {
    marginTop: 10,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  joinBtnText: { color: "#fff", fontWeight: "900" },

  rowHeader: {
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { color: "#111", fontWeight: "900", fontSize: 16 },
  refreshBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  muted: { paddingHorizontal: 16, color: "#6B7280" },

  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: "900", color: "#111" },
  cardSub: { marginTop: 8, color: "#6B7280", fontSize: 12 },

  leaveBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
  },
  leaveText: { color: "#EF4444", fontWeight: "900" },
});
