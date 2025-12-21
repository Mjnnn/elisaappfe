import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { AuthStackParamList } from "../../../navigation/AuthStack";
import classService from "../../../services/classService";
import classUserService from "../../../services/classUserService";
import classDocumentListService from "../../../services/classDocumentListService";

type NavProp = NativeStackNavigationProp<AuthStackParamList, "ClassScreen">;

export type ClassResponse = {
  classId: number;
  className: string;
  description?: string;
  userId: number;
  userFullName?: string;
  createdAt?: string;
  password?: string;
};

const formatDateTime = (iso?: string) => {
  if (!iso) return "";
  return iso.replace("T", " ").slice(0, 19);
};

const MyClassesTab: React.FC<{ userId: number }> = ({ userId }) => {
  const navigation = useNavigation<NavProp>();
  const [loading, setLoading] = useState(false);
  const [myClasses, setMyClasses] = useState<ClassResponse[]>([]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await classService.getByUser(userId);
      const data = res.data;
      const arr: ClassResponse[] = Array.isArray(data) ? data : data?.content ?? [];
      const onlyMine = arr.filter((c) => Number(c.userId) === Number(userId));
      setMyClasses(onlyMine);
    } catch (e) {
      console.error(e);
      Alert.alert("Lỗi", "Không tải được danh sách lớp của bạn.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const confirmDeleteClass = (c: ClassResponse) => {
    Alert.alert(
      "Xoá lớp học",
      `Bạn chắc chắn muốn xoá lớp "${c.className}"?\n(Lưu ý: sẽ xoá quan hệ thành viên & tài liệu trong lớp)`,
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xoá",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);

              // best-effort cleanup: nếu BE cho phép xoá mapping/member trước
              try {
                const mem = await classUserService.getByClass(c.classId);
                const memArr = Array.isArray(mem.data) ? mem.data : mem.data?.content ?? [];
                await Promise.all(
                  memArr.map((m: any) => (m?.classUserId ? classUserService.delete(m.classUserId) : Promise.resolve()))
                );
              } catch {}

              try {
                const maps = await classDocumentListService.getByClassId(c.classId);
                const mapArr = Array.isArray(maps.data) ? maps.data : maps.data?.content ?? [];
                await Promise.all(
                  mapArr.map((m: any) =>
                    m?.classDocumentListId ? classDocumentListService.delete(m.classDocumentListId) : Promise.resolve()
                  )
                );
              } catch {}

              await classService.delete(c.classId);

              Alert.alert("OK", "Đã xoá lớp.");
              await load();
            } catch (e) {
              console.error(e);
              Alert.alert("Lỗi", "Xoá lớp thất bại. Kiểm tra BE/permission.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
      <View style={styles.rowHeader}>
        <Text style={styles.sectionTitle}>Danh sách lớp bạn tạo</Text>
        <TouchableOpacity onPress={load} style={styles.refreshBtn}>
          <Ionicons name="refresh-outline" size={18} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {loading && <Text style={styles.muted}>Loading...</Text>}

      {!loading && myClasses.length === 0 && (
        <Text style={styles.muted}>Bạn chưa tạo lớp nào.</Text>
      )}

      {!loading &&
        myClasses.map((c) => (
          <TouchableOpacity
            key={c.classId}
            style={styles.card}
            activeOpacity={0.9}
            onPress={() =>
              navigation.navigate("ClassDetail", {
                classId: c.classId,
                mode: "OWNER",
              })
            }
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{c.className}</Text>
              {!!c.description && <Text style={styles.cardDesc}>{c.description}</Text>}
              <Text style={styles.cardSub}>Tạo ngày {formatDateTime(c.createdAt)}</Text>
            </View>

            <TouchableOpacity onPress={() => confirmDeleteClass(c)} style={styles.trashBtn}>
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
    </ScrollView>
  );
};

export default MyClassesTab;

const styles = StyleSheet.create({
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
  cardDesc: { marginTop: 6, color: "#374151" },
  cardSub: { marginTop: 8, color: "#6B7280", fontSize: 12 },

  trashBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },
});
