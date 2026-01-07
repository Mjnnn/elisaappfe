// src/screens/selfstudy/ClassDetailScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { AuthStackParamList } from "../../navigation/AuthStack";
import classService from "../../services/classService";
import classUserService from "../../services/classUserService";
import classDocumentListService from "../../services/classDocumentListService";
import documentListService from "../../services/documentListService";
import userService from "../../services/userService";

type NavProp = NativeStackNavigationProp<AuthStackParamList, "ClassDetail">;
type R = RouteProp<AuthStackParamList, "ClassDetail">;

type ClassResponse = {
  classId: number;
  className: string;
  description?: string;
  userId: number;
  userFullName?: string;
  createdAt?: string;
  password?: string;
};

type ClassUserResponse = {
  classUserId: number;
  classId: number;
  className: string;
  userId: number;
  userFullName?: string;
  joinedAt?: string;
  email?: string;
  avatarImage?: string;
};

type ClassDocumentListResponse = {
  classDocumentListId: number;
  classId: number;
  className?: string;
  listId: number;
  listTitle: string;
  assignedAt?: string;
  fullName?: string; // người gán / giảng viên
  avatarImage?: string;
  description?: string;
  type?: string;
  // itemCount?: number; // nếu BE có trả thì bạn thêm vào đây
};

const formatDateTime = (iso?: string) => {
  if (!iso) return "";
  return iso.replace("T", " ").slice(0, 19);
};

const AccordionHeader: React.FC<{
  title: string;
  subtitle?: string;
  open: boolean;
  onToggle: () => void;
}> = ({ title, subtitle, open, onToggle }) => {
  return (
    <TouchableOpacity
      style={styles.accHeader}
      onPress={onToggle}
      activeOpacity={0.9}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.accTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.accSub}>{subtitle}</Text>}
      </View>
      <Ionicons
        name={open ? "chevron-up" : "chevron-down"}
        size={18}
        color="#111"
      />
    </TouchableOpacity>
  );
};

const ClassDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<R>();
  const { classId, mode, classUserId } = route.params;

  const [meId, setMeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const [klass, setKlass] = useState<ClassResponse | null>(null);
  const [members, setMembers] = useState<ClassUserResponse[]>([]);
  const [lists, setLists] = useState<ClassDocumentListResponse[]>([]);

  // accordion states
  const [openInfo, setOpenInfo] = useState(true);
  const [openMembers, setOpenMembers] = useState(false);
  const [openDocs, setOpenDocs] = useState(false);

  // edit class (owner)
  const [className, setClassName] = useState("");
  const [description, setDescription] = useState("");

  // owner: show pass
  const [showPass, setShowPass] = useState(false);

  // add member by email (owner)
  const [addEmail, setAddEmail] = useState<string>("");

  // add document list (owner)
  const [myDocLists, setMyDocLists] = useState<any[]>([]);
  const [pickedListId, setPickedListId] = useState<number | null>(null);

  useEffect(() => {
    const loadMe = async () => {
      try {
        const stored = await AsyncStorage.getItem("userId");
        const parsed = Number(stored);
        if (!stored || Number.isNaN(parsed) || parsed <= 0) {
          Alert.alert(
            "Thông báo",
            "Bạn chưa đăng nhập. Vui lòng đăng nhập lại."
          );
          navigation.navigate("Login" as never);
          return;
        }
        setMeId(parsed);
      } catch (e) {
        console.log(e);
        Alert.alert("Lỗi", "Không đọc được userId. Vui lòng đăng nhập lại.");
        navigation.navigate("Login" as never);
      }
    };
    loadMe();
  }, [navigation]);

  const isOwner = useMemo(() => {
    if (!klass || !meId) return mode === "OWNER";
    return Number(klass.userId) === Number(meId);
  }, [klass, meId, mode]);

  const loadAll = async () => {
    try {
      setLoading(true);

      const classRes = await classService.getById(classId);
      const c: ClassResponse = classRes.data;
      setKlass(c);

      setClassName(c?.className ?? "");
      setDescription(c?.description ?? "");

      const memRes = await classUserService.getByClass(classId);
      const memData = memRes.data;
      const memArr: ClassUserResponse[] = Array.isArray(memData)
        ? memData
        : memData?.content ?? [];
      setMembers(memArr);

      const listRes = await classDocumentListService.getByClassId(classId);
      const listData = listRes.data;
      const listArr: ClassDocumentListResponse[] = Array.isArray(listData)
        ? listData
        : listData?.content ?? [];
      setLists(listArr);

      if (meId) {
        const my = await documentListService.getByUser(meId);
        const myData = my.data;
        const myArr = Array.isArray(myData) ? myData : myData?.content ?? [];
        setMyDocLists(myArr);
      }
    } catch (e) {
      console.log(e);
      Alert.alert("Lỗi", "Không tải được dữ liệu lớp học.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!meId) return;
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meId, classId]);

  const handleSaveClassInfo = async () => {
    if (!isOwner) return;
    if (!className.trim()) {
      Alert.alert("Thiếu thông tin", "Tên lớp học không được trống.");
      return;
    }

    try {
      setLoading(true);

      await classService.update(classId, {
        className: className.trim(),
        description: description.trim(),
        userId: klass?.userId ?? meId,
        password: klass?.password ?? "",
      });

      Alert.alert("OK", "Đã lưu thông tin lớp.");
      await loadAll();
    } catch (e) {
      console.log(e);
      Alert.alert("Lỗi", "Lưu thông tin lớp thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMemberByEmail = async () => {
    if (!isOwner) return;

    const email = addEmail.trim().toLowerCase();
    if (!email) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập email.");
      return;
    }

    try {
      setLoading(true);

      const uRes = await userService.getByEmail(email);
      const u = uRes.data;

      const uid: number | undefined = u?.userId ?? u?.id;

      if (!uid || Number.isNaN(Number(uid)) || Number(uid) <= 0) {
        Alert.alert("Lỗi", "Không tìm thấy userId từ email này.");
        return;
      }

      if (members.some((m) => Number(m.userId) === Number(uid))) {
        Alert.alert("Thông báo", "User này đã ở trong lớp.");
        return;
      }

      await classUserService.create({ classId, userId: uid });

      Alert.alert("OK", "Đã thêm thành viên vào lớp.");
      setAddEmail("");
      await loadAll();
    } catch (e: any) {
      console.log(e);
      Alert.alert(
        "Lỗi",
        e?.response?.data?.message ??
          "Thêm thành viên thất bại (email không tồn tại hoặc lỗi hệ thống)."
      );
    } finally {
      setLoading(false);
    }
  };

  const confirmRemoveMember = (m: ClassUserResponse) => {
    if (!isOwner) return;

    Alert.alert(
      "Xoá thành viên",
      `Bạn chắc chắn muốn xoá "${m.userFullName ?? "User"}" khỏi lớp?`,
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xoá",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await classUserService.delete(m.classUserId);
              Alert.alert("OK", "Đã xoá thành viên.");
              await loadAll();
            } catch (e) {
              console.log(e);
              Alert.alert("Lỗi", "Xoá thành viên thất bại.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleAssignList = async () => {
    if (!isOwner) return;
    if (!pickedListId) {
      Alert.alert(
        "Thiếu thông tin",
        "Vui lòng chọn 1 tài liệu để thêm vào lớp."
      );
      return;
    }
    if (lists.some((x) => Number(x.listId) === Number(pickedListId))) {
      Alert.alert("Thông báo", "Tài liệu này đã có trong lớp.");
      return;
    }

    try {
      setLoading(true);
      await classDocumentListService.create({ classId, listId: pickedListId });
      Alert.alert("OK", "Đã thêm tài liệu vào lớp.");
      setPickedListId(null);
      await loadAll();
    } catch (e: any) {
      console.log(e);
      Alert.alert("Lỗi", e?.response?.data?.message ?? "Thêm tài liệu thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const confirmRemoveList = (x: ClassDocumentListResponse) => {
    if (!isOwner) return;

    Alert.alert(
      "Xoá tài liệu khỏi lớp",
      `Bạn chắc chắn muốn xoá "${x.listTitle}" khỏi lớp?`,
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xoá",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await classDocumentListService.delete(x.classDocumentListId);
              Alert.alert("OK", "Đã xoá tài liệu khỏi lớp.");
              await loadAll();
            } catch (e) {
              console.log(e);
              Alert.alert("Lỗi", "Xoá tài liệu thất bại.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const confirmLeaveClass = async () => {
    if (!meId) return;

    let myRecordId = classUserId ?? null;
    if (!myRecordId) {
      const found = members.find((m) => Number(m.userId) === Number(meId));
      myRecordId = found?.classUserId ?? null;
    }

    if (!myRecordId) {
      Alert.alert("Lỗi", "Không tìm thấy bản ghi tham gia lớp (classUserId).");
      return;
    }

    Alert.alert("Rời lớp", "Bạn chắc chắn muốn rời khỏi lớp này?", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Rời lớp",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            await classUserService.delete(myRecordId!);
            Alert.alert("OK", "Đã rời lớp.");
            navigation.goBack();
          } catch (e) {
            console.log(e);
            Alert.alert("Lỗi", "Rời lớp thất bại.");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const confirmDeleteClass = () => {
    if (!isOwner) return;

    Alert.alert("Xoá lớp", "Bạn chắc chắn muốn xoá lớp này?", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);

            try {
              await Promise.all(
                members.map((m) =>
                  m?.classUserId
                    ? classUserService.delete(m.classUserId)
                    : Promise.resolve()
                )
              );
            } catch {}
            try {
              await Promise.all(
                lists.map((x) =>
                  x?.classDocumentListId
                    ? classDocumentListService.delete(x.classDocumentListId)
                    : Promise.resolve()
                )
              );
            } catch {}

            await classService.delete(classId);
            Alert.alert("OK", "Đã xoá lớp.");
            navigation.goBack();
          } catch (e) {
            console.log(e);
            Alert.alert("Lỗi", "Xoá lớp thất bại.");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  // ✅ CLICK DOC -> navigate sang DocumentListDetail
  const openDocumentDetail = (doc: ClassDocumentListResponse) => {
    navigation.navigate("DocumentListDetail", {
      listId: doc.listId,
      title: doc.listTitle,
      author: doc.fullName ?? klass?.userFullName ?? "Unknown",
      itemCount: 0, // nếu BE có itemCount thì đổi: doc.itemCount ?? 0
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={22} color="#111" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {klass?.className ?? "Chi tiết lớp"}
        </Text>

        {isOwner ? (
          <TouchableOpacity style={styles.dangerBtn} onPress={confirmDeleteClass}>
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.dangerBtn} onPress={confirmLeaveClass}>
            <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {loading && <Text style={styles.muted}>Loading...</Text>}

        {/* Accordion: Thông tin lớp học */}
        <View style={styles.accBox}>
          <AccordionHeader
            title="Thông tin lớp học"
            subtitle={
              klass?.createdAt ? `Tạo ngày ${formatDateTime(klass.createdAt)}` : undefined
            }
            open={openInfo}
            onToggle={() => setOpenInfo((p) => !p)}
          />

          {openInfo && (
            <View style={styles.accContent}>
              {/* OWNER: hiện Class ID + Password */}
              {isOwner && (
                <View style={styles.metaRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.metaLabel}>Class ID</Text>
                    <Text style={styles.metaValue}>{klass?.classId ?? classId}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.metaLabel}>Mật khẩu lớp</Text>

                    <View style={styles.passWrap}>
                      <Text style={styles.passText} numberOfLines={1}>
                        {showPass ? (klass?.password ?? "") : "••••••••"}
                      </Text>

                      <TouchableOpacity
                        onPress={() => setShowPass((p) => !p)}
                        style={styles.eyeBtn}
                      >
                        <Ionicons
                          name={showPass ? "eye-off-outline" : "eye-outline"}
                          size={18}
                          color="#111"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

              <Text style={styles.label}>Tên lớp</Text>
              <TextInput
                value={className}
                onChangeText={setClassName}
                editable={isOwner}
                placeholder="Tên lớp"
                placeholderTextColor="#9CA3AF"
                style={[styles.input, !isOwner && styles.inputDisabled]}
              />

              <Text style={styles.label}>Mô tả</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                editable={isOwner}
                placeholder="Mô tả"
                placeholderTextColor="#9CA3AF"
                style={[styles.input, styles.textArea, !isOwner && styles.inputDisabled]}
                multiline
              />

              <Text style={styles.boxSub2}>
                Giảng viên: {klass?.userFullName ?? "-"}
              </Text>

              {isOwner && (
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={handleSaveClassInfo}
                  activeOpacity={0.9}
                >
                  <Text style={styles.primaryText}>Lưu thông tin lớp</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Accordion: Thành viên */}
        <View style={styles.accBox}>
          <AccordionHeader
            title={`Thành viên (${members.length})`}
            open={openMembers}
            onToggle={() => setOpenMembers((p) => !p)}
          />

          {openMembers && (
            <View style={styles.accContent}>
              {isOwner && (
                <View style={styles.inlineBox}>
                  <TextInput
                    value={addEmail}
                    onChangeText={setAddEmail}
                    placeholder="Nhập email để thêm"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  />
                  <TouchableOpacity
                    style={styles.smallBtn}
                    onPress={handleAddMemberByEmail}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.smallBtnText}>Thêm</Text>
                  </TouchableOpacity>
                </View>
              )}

              {members.length === 0 ? (
                <Text style={styles.muted}>Chưa có thành viên.</Text>
              ) : (
                members.map((m) => (
                  <View key={m.classUserId} style={styles.rowItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle}>
                        {m.userFullName ?? `User ${m.userId}`}
                      </Text>
                      <Text style={styles.rowSub}>
                        {m.email ? m.email + " · " : ""}
                        Tham gia: {formatDateTime(m.joinedAt)}
                      </Text>
                    </View>

                    {isOwner && (
                      <TouchableOpacity
                        onPress={() => confirmRemoveMember(m)}
                        style={[styles.tagBtn, { backgroundColor: "#FEF2F2" }]}
                      >
                        <Text style={[styles.tagText, { color: "#EF4444" }]}>
                          Xoá
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              )}
            </View>
          )}
        </View>

        {/* Accordion: Tài liệu trong lớp */}
        <View style={styles.accBox}>
          <AccordionHeader
            title="Tài liệu trong lớp"
            subtitle={lists.length ? `${lists.length} tài liệu` : "Chưa có tài liệu"}
            open={openDocs}
            onToggle={() => setOpenDocs((p) => !p)}
          />

          {openDocs && (
            <View style={styles.accContent}>
              {isOwner && (
                <View style={styles.assignBox}>
                  <Text style={styles.miniLabel}>
                    Chọn tài liệu của bạn để thêm vào lớp
                  </Text>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 10 }}
                  >
                    {myDocLists.map((d: any) => {
                      const active = Number(d.listId) === Number(pickedListId);
                      return (
                        <TouchableOpacity
                          key={d.listId}
                          onPress={() => setPickedListId(d.listId)}
                          style={[styles.chip, active && styles.chipActive]}
                        >
                          <Text
                            style={[styles.chipText, active && styles.chipTextActive]}
                            numberOfLines={1}
                          >
                            {d.title}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  <TouchableOpacity
                    style={styles.smallPrimary}
                    onPress={handleAssignList}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.smallPrimaryText}>Thêm tài liệu</Text>
                  </TouchableOpacity>
                </View>
              )}

              {lists.length === 0 ? (
                <Text style={styles.muted}>Chưa có tài liệu nào trong lớp.</Text>
              ) : (
                lists.map((x) => (
                  <TouchableOpacity
                    key={x.classDocumentListId}
                    style={styles.docCard}
                    activeOpacity={0.9}
                    onPress={() => openDocumentDetail(x)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.docTitle}>{x.listTitle}</Text>
                      <Text style={styles.docSub}>
                        {x.type ? x.type : ""} {x.fullName ? `· ${x.fullName}` : ""}
                      </Text>
                      <Text style={styles.docSub2}>
                        Gán lúc: {formatDateTime(x.assignedAt)}
                      </Text>
                    </View>

                    {isOwner ? (
                      <TouchableOpacity
                        onPress={() => confirmRemoveList(x)}
                        style={styles.trashSmall}
                        activeOpacity={0.9}
                      >
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    ) : (
                      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ClassDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  muted: { paddingHorizontal: 16, color: "#6B7280" },

  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: "900", color: "#111" },
  dangerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },

  // accordion
  accBox: {
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  accHeader: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
  },
  accTitle: { fontSize: 16, fontWeight: "900", color: "#111" },
  accSub: { marginTop: 6, color: "#6B7280", fontSize: 12 },
  accContent: { paddingHorizontal: 14, paddingBottom: 14 },

  // meta (classId + pass)
  metaRow: { flexDirection: "row", gap: 12, marginTop: 4, marginBottom: 10 },
  metaLabel: { color: "#6B7280", fontWeight: "800", fontSize: 12 },
  metaValue: { color: "#111", fontWeight: "900", fontSize: 16, marginTop: 6 },

  passWrap: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  passText: { color: "#111", fontWeight: "900", flex: 1, marginRight: 10 },
  eyeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },

  label: { color: "#111", fontWeight: "800", marginBottom: 6, marginTop: 6 },
  boxSub2: { marginTop: 6, color: "#111", fontWeight: "700" },

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
  inputDisabled: { backgroundColor: "#F9FAFB", color: "#6B7280" },
  textArea: { minHeight: 80, textAlignVertical: "top" },

  primaryBtn: {
    marginTop: 6,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryText: { color: "#fff", fontWeight: "900" },

  inlineBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },

  smallBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#DCFCE7",
  },
  smallBtnText: { color: "#111", fontWeight: "900" },

  rowItem: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowTitle: { fontWeight: "900", color: "#111" },
  rowSub: { marginTop: 6, color: "#6B7280", fontSize: 12 },

  tagBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  tagText: { fontWeight: "900" },

  assignBox: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 12,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  miniLabel: { color: "#111", fontWeight: "800", marginBottom: 10 },

  chip: {
    maxWidth: 220,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  chipActive: { backgroundColor: "#EEF2FF", borderColor: "#BFDBFE" },
  chipText: { color: "#111", fontWeight: "800" },
  chipTextActive: { color: "#2563EB" },

  smallPrimary: {
    marginTop: 10,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  smallPrimaryText: { color: "#fff", fontWeight: "900" },

  docCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  docTitle: { fontWeight: "900", color: "#111" },
  docSub: { marginTop: 6, color: "#6B7280" },
  docSub2: { marginTop: 6, color: "#9CA3AF", fontSize: 12 },

  trashSmall: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },
});
