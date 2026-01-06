// src/screens/selfstudy/SelfStudyScreen.tsx

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import SelfStudyBottomBar from "../../components/SelfStudyBottomBar";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import documentListService from "../../services/documentListService";
import documentItemService from "../../services/documentItemService";
import { AuthStackParamList } from "../../navigation/AuthStack";

import foxImage from "../../../assets/images/logo/Elisa.png";
import { SelfStudyTabName } from "./selfStudyBottomTabs";

interface DocumentListItem {
  listId: number;
  userId: number;
  fullName: string;
  avatarImage?: string | null;
  title: string;
  description?: string;
  type: string;
  createdAt: string;
  isPublic: number;
  itemCount?: number;
}

type SelfStudyNavProp = NativeStackNavigationProp<
  AuthStackParamList,
  "SelfStudyScreen"
>;

const PAGE_SIZE = 10;

// Chiều cao ước lượng để chừa chỗ cho pagination + bottom bar
const PAGINATION_HEIGHT = 56;
const BOTTOM_BAR_HEIGHT = 60;

const SelfStudyScreen: React.FC = () => {
  const navigation = useNavigation<SelfStudyNavProp>();

  // bottom tab
  const [activeTab, setActiveTab] = useState<SelfStudyTabName>("Home");

  // header name
  const [name, setName] = useState<string>("");

  // search
  const [showClearButton, setShowClearButton] = useState(false);
  const searchTextRef = useRef("");
  const searchInputRef = useRef<TextInput>(null);

  // data + paging
  const [lists, setLists] = useState<DocumentListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);

  const isSearching = useRef<boolean>(false);

  useEffect(() => {
    const loadUser = async () => {
      const storedName = await AsyncStorage.getItem("fullName");
      if (storedName) setName(storedName);
    };
    loadUser();
  }, []);

  const addCountsForPage = useCallback(async (pageLists: DocumentListItem[]) => {
    // ⚠️ Nếu backend có itemCount sẵn => bỏ đoạn này để giảm call
    const listsWithCounts = await Promise.all(
      pageLists.map(async (list) => {
        try {
          const itemsRes = await documentItemService.getByListId(list.listId);
          const count = Array.isArray(itemsRes.data) ? itemsRes.data.length : 0;
          return { ...list, itemCount: count };
        } catch (err) {
          console.log("Failed to load items for list", list.listId, err);
          return { ...list, itemCount: 0 };
        }
      })
    );
    return listsWithCounts;
  }, []);

  const fetchPagedLists = useCallback(
    async (pageIndex: number, keyword?: string) => {
      try {
        setLoading(true);

        const trimmed = (keyword ?? "").trim();
        isSearching.current = !!trimmed;

        let res;
        if (!trimmed) {
          res = await documentListService.getPublicLists(pageIndex, PAGE_SIZE);
        } else {
          res = await documentListService.searchPublicByTitleOrType(
            trimmed,
            pageIndex,
            PAGE_SIZE
          );
        }

        // Spring Pageable thường:
        // { content, number, size, totalPages, totalElements, first, last, ... }
        const pageData = res?.data ?? {};
        const content: DocumentListItem[] = Array.isArray(pageData.content)
          ? pageData.content
          : [];

        const contentWithCounts = await addCountsForPage(content);

        setLists(contentWithCounts);
        setPage(Number(pageData.number ?? pageIndex));
        setTotalPages(Number(pageData.totalPages ?? 0));
        setTotalElements(Number(pageData.totalElements ?? 0));
      } catch (error) {
        console.log("Failed to load document lists:", error);
      } finally {
        setLoading(false);
      }
    },
    [addCountsForPage]
  );

  useEffect(() => {
    fetchPagedLists(0, "");
  }, [fetchPagedLists]);

  // search handlers
  const handleChangeText = (text: string) => {
    searchTextRef.current = text;

    if (text.length > 0 && !showClearButton) setShowClearButton(true);
    else if (text.length === 0 && showClearButton) setShowClearButton(false);
  };

  const handleSearch = () => {
    fetchPagedLists(0, searchTextRef.current);
  };

  const handleClearSearch = () => {
    searchTextRef.current = "";
    setShowClearButton(false);
    searchInputRef.current?.clear();
    fetchPagedLists(0, "");
  };

  // pagination actions
  const canPrev = page > 0;
  const canNext = totalPages > 0 && page < totalPages - 1;

  const handlePrevPage = () => {
    if (!canPrev || loading) return;
    fetchPagedLists(page - 1, searchTextRef.current);
  };

  const handleNextPage = () => {
    if (!canNext || loading) return;
    fetchPagedLists(page + 1, searchTextRef.current);
  };

  const handleTabPress = (tabName: SelfStudyTabName) => {
    setActiveTab(tabName);

    if (tabName === "Home") return;

    if (tabName === "Create") {
      navigation.navigate("CreateDocumentList");
      return;
    }

    if (tabName === "Library") {
      Alert.alert("Thông báo", "Chưa có màn Library. Bạn tạo route sau nhé.");
      return;
    }

    if (tabName === "Class") {
      Alert.alert("Thông báo", "Chưa có màn Class. Bạn tạo route sau nhé.");
      return;
    }
  };

  const renderItem = ({ item }: { item: DocumentListItem }) => (
    <TouchableOpacity
      style={styles.recentItem}
      onPress={() =>
        navigation.navigate("DocumentListDetail", {
          listId: item.listId,
          title: item.title,
          author: item.fullName,
          itemCount: item.itemCount ?? 0,
        })
      }
      activeOpacity={0.9}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="layers-outline" size={20} color="#555" />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.lessonName}>{item.title}</Text>
        <Text style={styles.lessonAuthor}>
          {(item.itemCount ?? 0) + " thẻ · " + (item.fullName ?? "")}
        </Text>
      </View>

      <Ionicons name="duplicate-outline" size={20} color="#888" />
    </TouchableOpacity>
  );

  const ListEmpty = () => {
    if (loading) return null;

    const keyword = searchTextRef.current.trim();
    return (
      <Text style={styles.emptyText}>
        Không tìm thấy kết quả{keyword ? ` cho "${keyword}"` : "."}
      </Text>
    );
  };

  const currentPageDisplay = totalPages === 0 ? 0 : page + 1;

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* HEADER */}
      <View style={styles.header}>
        <Image source={foxImage} style={styles.avatar} resizeMode="contain" />

        <View style={styles.centerBox}>
          <Text style={styles.welcomeText}>Xin chào,</Text>
          <Text style={styles.username}>{name || "Học viên"}</Text>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate("AppTabs")}>
          <Ionicons name="book-outline" size={30} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* SEARCH */}
      <View style={styles.searchContainer}>
        <TouchableOpacity onPress={handleSearch}>
          <Ionicons name="search" size={22} color="#6B7280" />
        </TouchableOpacity>

        <TextInput
          ref={searchInputRef}
          style={styles.searchInput}
          placeholder="Tìm tài liệu..."
          placeholderTextColor="#9CA3AF"
          defaultValue=""
          onChangeText={handleChangeText}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
          autoCorrect={false}
          spellCheck={false}
        />

        {showClearButton && (
          <TouchableOpacity onPress={handleClearSearch}>
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* LIST + PAGINATION */}
      <View style={{ flex: 1 }}>
        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        )}

        <FlatList
          data={lists}
          keyExtractor={(item) => String(item.listId)}
          renderItem={renderItem}
          ListEmptyComponent={ListEmpty}
          contentContainerStyle={{
            paddingTop: 10,
            // ✅ chừa chỗ để list không bị che bởi pagination + bottom bar
            paddingBottom: PAGINATION_HEIGHT + BOTTOM_BAR_HEIGHT + 40,
          }}
          showsVerticalScrollIndicator={false}
        />

        {/* Pagination footer */}
        <View style={styles.paginationBar}>
          <TouchableOpacity
            onPress={handlePrevPage}
            disabled={!canPrev || loading}
            style={[styles.pageBtn, (!canPrev || loading) && styles.pageBtnDisabled]}
          >
            <Ionicons name="chevron-back" size={18} color="#111827" />
            <Text style={styles.pageBtnText}>Trước</Text>
          </TouchableOpacity>

          {/* ✅ CHỈ 1 DÒNG để nằm ngang hàng với 2 nút */}
          <View style={styles.pageInfo}>
            <Text style={styles.pageInfoText}>
              Trang {currentPageDisplay}/{totalPages}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleNextPage}
            disabled={!canNext || loading}
            style={[styles.pageBtn, (!canNext || loading) && styles.pageBtnDisabled]}
          >
            <Text style={styles.pageBtnText}>Sau</Text>
            <Ionicons name="chevron-forward" size={18} color="#111827" />
          </TouchableOpacity>
        </View>
      </View>

      <SelfStudyBottomBar activeTab={activeTab} onTabPress={handleTabPress} />
    </SafeAreaView>
  );
};

export default SelfStudyScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    alignItems: "center",
  },
  centerBox: { alignItems: "center", flex: 1 },
  welcomeText: { fontSize: 16, color: "#6B7280" },
  username: { fontSize: 26, fontWeight: "bold", color: "#111827" },
  avatar: { width: 50, height: 50 },

  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    marginHorizontal: 20,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  searchInput: { marginLeft: 10, fontSize: 16, flex: 1, color: "#111" },

  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8FA",
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  iconContainer: {
    backgroundColor: "#EDEEF2",
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
  },
  lessonName: { color: "#111", fontSize: 15, fontWeight: "600" },
  lessonAuthor: { color: "#777", fontSize: 13 },

  emptyText: { paddingHorizontal: 20, color: "#777" },

  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 6,
  },
  loadingText: { color: "#777" },

  // ✅ Pagination bar: height cố định + căn giữa dọc
  paginationBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 70, // chừa chỗ cho bottom bar
    height: PAGINATION_HEIGHT,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center", // ✅ nút + text cùng hàng
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },

  pageBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    minWidth: 88, // ✅ giúp 2 nút đều nhau, trang ở giữa nhìn cân
    justifyContent: "center",
  },
  pageBtnDisabled: { opacity: 0.5 },

  pageBtnText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
  },

  // ✅ 1 dòng “Trang 1/2” luôn chính giữa, không bị lệch
  pageInfo: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pageInfoText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 18,
  },
});
