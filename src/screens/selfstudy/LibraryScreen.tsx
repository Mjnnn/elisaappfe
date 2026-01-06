// src/screens/selfstudy/LibraryScreen.tsx

import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  GestureResponderEvent,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { AuthStackParamList } from "../../navigation/AuthStack";
import SelfStudyBottomBar from "../../components/SelfStudyBottomBar";
import documentListService from "../../services/documentListService";
import documentItemService from "../../services/documentItemService";
import favoriteDocumentListService from "../../services/favoriteDocumentListService";

import { SelfStudyTabName } from "./selfStudyBottomTabs"; // ✅ FIX TYPE

type NavProp = NativeStackNavigationProp<AuthStackParamList, "LibraryScreen">;

type TabKey = "DOCS" | "FAVORITES";

type DocumentListItem = {
  listId: number;
  userId: number;
  fullName?: string;
  title: string;
  description?: string;
  type: string;
  createdAt?: string;
  isPublic: number; // BE: 0 = public, 1 = private
};

const formatDateTime = (iso?: string) => {
  if (!iso) return "";
  // nếu BE trả "2026-01-06T10:20:30" -> "2026-01-06 10:20:30"
  return iso.replace("T", " ").slice(0, 19);
};

const LibraryScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();

  const [activeTab, setActiveTab] = useState<TabKey>("DOCS");

  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const [myLists, setMyLists] = useState<DocumentListItem[]>([]);
  const [favoriteLists, setFavoriteLists] = useState<DocumentListItem[]>([]);

  // ✅ FIX TYPE: bottom tab phải là SelfStudyTabName
  const [bottomTab, setBottomTab] = useState<SelfStudyTabName>("Library");

  useEffect(() => {
    const loadUserId = async () => {
      try {
        const stored = await AsyncStorage.getItem("userId");
        if (!stored) {
          Alert.alert("Thông báo", "Bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
          navigation.navigate("Login");
          return;
        }
        const parsed = Number(stored);
        if (Number.isNaN(parsed) || parsed <= 0) {
          Alert.alert("Lỗi", "userId lưu trong máy không hợp lệ.");
          navigation.navigate("Login");
          return;
        }
        setUserId(parsed);
      } catch (e) {
        console.log("Load userId error:", e);
        Alert.alert("Lỗi", "Không đọc được session đăng nhập.");
      }
    };

    loadUserId();
  }, [navigation]);

  const loadMyLists = async (uid: number) => {
    const res = await documentListService.getByUser(uid);
    const data = res?.data;
    const lists: DocumentListItem[] = Array.isArray(data) ? data : data?.content ?? [];
    setMyLists(lists);
  };

  const loadFavorites = async (uid: number) => {
    const favRes = await favoriteDocumentListService.getByUser(uid);
    const favData = favRes?.data;
    const favArr: any[] = Array.isArray(favData) ? favData : favData?.content ?? [];

    const listIds = favArr
      .map((x) => x?.listId)
      .filter((x) => typeof x === "number");

    const uniqueIds = Array.from(new Set(listIds));

    const lists = await Promise.all(
      uniqueIds.map(async (id) => {
        try {
          const r = await documentListService.getById(id);
          return r.data as DocumentListItem;
        } catch {
          return null;
        }
      })
    );

    setFavoriteLists(lists.filter(Boolean) as DocumentListItem[]);
  };

  const reload = async (tab?: TabKey) => {
    if (!userId) return;

    try {
      setLoading(true);
      if ((tab ?? activeTab) === "DOCS") await loadMyLists(userId);
      else await loadFavorites(userId);
    } catch (e) {
      console.log("Load library error:", e);
      Alert.alert("Lỗi", "Không tải được dữ liệu Thư viện.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    reload("DOCS");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const onChangeTab = async (tab: TabKey) => {
    setActiveTab(tab);
    await reload(tab);
  };

  // ✅ click card -> vào detail
  const handleOpenDetail = async (item: DocumentListItem) => {
    try {
      setLoading(true);

      const itemsRes = await documentItemService.getByListId(item.listId);
      const arr = Array.isArray(itemsRes.data) ? itemsRes.data : itemsRes.data?.content ?? [];
      const count = Array.isArray(arr) ? arr.length : 0;

      navigation.navigate("DocumentListDetail", {
        listId: item.listId,
        title: item.title,
        author: item.fullName ?? "",
        itemCount: count,
      });
    } catch (err) {
      console.log("Open detail error:", err);
      Alert.alert("Lỗi", "Không mở được chi tiết tài liệu.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ icon mắt chỉ có ở tab DOCS
  const handleToggleVisibility = async (e: GestureResponderEvent, listId: number) => {
    e.stopPropagation();
    try {
      setLoading(true);
      await documentListService.toggleVisibility(listId);
      await reload("DOCS");
    } catch (err) {
      console.log("toggleVisibility error:", err);
      Alert.alert("Lỗi", "Không đổi được trạng thái công khai.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (e: GestureResponderEvent, listId: number) => {
    e.stopPropagation();
    navigation.navigate("EditDocumentList", { listId });
  };

  // ✅ Tab DOCS: bấm thùng rác -> Alert xác nhận
  const handleDeleteList = (e: GestureResponderEvent, listId: number, title: string) => {
    e.stopPropagation();

    Alert.alert(
      "Xoá tài liệu",
      `Bạn có chắc chắn muốn xoá "${title}" không?\n(Lưu ý: sẽ xoá luôn toàn bộ thẻ trong tài liệu)`,
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
              await reload("DOCS");
            } catch (err) {
              console.log("delete list error:", err);
              Alert.alert("Lỗi", "Xoá thất bại.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const dataToRender = useMemo(() => {
    return activeTab === "DOCS" ? myLists : favoriteLists;
  }, [activeTab, myLists, favoriteLists]);

  // ✅ FIX TYPE: tabName SelfStudyTabName
  const handleBottomTabPress = (tabName: SelfStudyTabName) => {
    setBottomTab(tabName);

    if (tabName === "Home") {
      navigation.navigate("SelfStudyScreen");
      return;
    }

    if (tabName === "Create") {
      navigation.navigate("CreateDocumentList");
      return;
    }

    if (tabName === "Library") return;

    if (tabName === "Class") {
      Alert.alert("Thông báo", "Bạn chưa tạo màn Class.");
      return;
    }

    if (tabName === "Logout") {
      // SelfStudyBottomBar đã xử lý logout bên trong,
      // nhưng nếu bạn muốn xử lý tại đây thì thêm logic.
      return;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Thư viện</Text>

        <TouchableOpacity onPress={() => reload()} style={styles.refreshBtn} activeOpacity={0.9}>
          <Ionicons name="refresh-outline" size={20} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "DOCS" && styles.tabBtnActive]}
          onPress={() => onChangeTab("DOCS")}
          activeOpacity={0.9}
        >
          <Text style={[styles.tabText, activeTab === "DOCS" && styles.tabTextActive]}>
            Tài liệu của tôi
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "FAVORITES" && styles.tabBtnActive]}
          onPress={() => onChangeTab("FAVORITES")}
          activeOpacity={0.9}
        >
          <Text style={[styles.tabText, activeTab === "FAVORITES" && styles.tabTextActive]}>
            Yêu thích
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        {loading && (
          <View style={{ paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 10 }}>
            <ActivityIndicator size="small" />
            <Text style={{ color: "#6B7280" }}>Đang tải...</Text>
          </View>
        )}

        {!loading && dataToRender.length === 0 && (
          <Text style={{ paddingHorizontal: 16, color: "#6B7280" }}>
            {activeTab === "DOCS"
              ? "Bạn chưa có tài liệu nào."
              : "Bạn chưa có tài liệu yêu thích nào."}
          </Text>
        )}

        {!loading &&
          dataToRender.map((item) => (
            <TouchableOpacity
              key={item.listId}
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => handleOpenDetail(item)}
            >
              <View style={styles.cardTop}>
                <Text style={styles.dateText}>{formatDateTime(item.createdAt)}</Text>

                <View style={styles.actions}>
                  {/* Eye toggle CHỈ ở DOCS */}
                  {activeTab === "DOCS" && (
                    <TouchableOpacity
                      onPress={(e) => handleToggleVisibility(e, item.listId)}
                      style={styles.iconBtn}
                      activeOpacity={0.9}
                    >
                      <Ionicons
                        name={item.isPublic === 0 ? "eye-outline" : "eye-off-outline"}
                        size={18}
                        color="#111"
                      />
                    </TouchableOpacity>
                  )}

                  {/* Edit + Delete CHỈ ở DOCS */}
                  {activeTab === "DOCS" && (
                    <>
                      <TouchableOpacity
                        onPress={(e) => handleEdit(e, item.listId)}
                        style={styles.iconBtn}
                        activeOpacity={0.9}
                      >
                        <Ionicons name="create-outline" size={18} color="#2563EB" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={(e) => handleDeleteList(e, item.listId, item.title)}
                        style={styles.iconBtn}
                        activeOpacity={0.9}
                      >
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.titleText}>{item.title}</Text>
                <Text style={styles.subText}>
                  {item.type}
                  {item.fullName ? ` · ${item.fullName}` : ""}
                  {activeTab === "DOCS" ? ` · ${item.isPublic === 0 ? "Công khai" : "Riêng tư"}` : ""}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
      </ScrollView>

      {/* ✅ FIX: activeTab / onTabPress đúng type => hết lỗi */}
      <SelfStudyBottomBar activeTab={bottomTab} onTabPress={handleBottomTabPress} />
    </SafeAreaView>
  );
};

export default LibraryScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  headerRow: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#111" },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },

  tabRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    gap: 10,
  },
  tabBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  tabBtnActive: {
    backgroundColor: "#EEF2FF",
    borderColor: "#BFDBFE",
  },
  tabText: { color: "#111", fontWeight: "700" },
  tabTextActive: { color: "#2563EB" },

  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    padding: 12,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: { color: "#6B7280", fontSize: 12 },
  actions: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBtn: { padding: 4 },

  cardBody: { marginTop: 8 },
  titleText: { fontSize: 16, fontWeight: "800", color: "#111" },
  subText: { marginTop: 4, color: "#6B7280" },
});
