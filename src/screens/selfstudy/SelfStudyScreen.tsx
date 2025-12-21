// src/screens/selfstudy/SelfStudyScreen.tsx

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Image,
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

// ✅ Logo giống HomeScreen của bạn
import foxImage from "../../../assets/images/logo/Elisa.png";

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

const SelfStudyScreen: React.FC = () => {
  const navigation = useNavigation<SelfStudyNavProp>();

  // bottom tab
  const [activeTab, setActiveTab] = useState<string>("Home");

  // ✅ header name
  const [name, setName] = useState<string>("");

  // ✅ search: dùng ref để không re-render liên tục
  const [showClearButton, setShowClearButton] = useState(false);
  const searchTextRef = useRef("");
  const searchInputRef = useRef<TextInput>(null);

  // Recent
  const [recentPublicLists, setRecentPublicLists] = useState<DocumentListItem[]>(
    []
  );
  const [loadingRecent, setLoadingRecent] = useState<boolean>(false);

  useEffect(() => {
    const loadUser = async () => {
      const storedName = await AsyncStorage.getItem("fullName");
      if (storedName) setName(storedName);
    };
    loadUser();
  }, []);

  const loadLists = async (keyword?: string) => {
    try {
      setLoadingRecent(true);
      let res;

      const trimmed = (keyword ?? "").trim();

      if (!trimmed) {
        res = await documentListService.getPublicLists(0, 10);
      } else {
        res = await documentListService.searchPublicByTitleOrType(trimmed, 0, 10);
      }

      const pageData = res.data;
      const lists: DocumentListItem[] = pageData.content ?? [];

      const listsWithCounts = await Promise.all(
        lists.map(async (list) => {
          try {
            const itemsRes = await documentItemService.getByListId(list.listId);
            const count = Array.isArray(itemsRes.data) ? itemsRes.data.length : 0;
            return { ...list, itemCount: count };
          } catch (err) {
            console.error("Failed to load items for list", list.listId, err);
            return { ...list, itemCount: 0 };
          }
        })
      );

      setRecentPublicLists(listsWithCounts);
    } catch (error) {
      console.error("Failed to load document lists:", error);
    } finally {
      setLoadingRecent(false);
    }
  };

  useEffect(() => {
    loadLists();
  }, []);

  // ✅ search handlers (giống HomeScreen)
  const handleChangeText = (text: string) => {
    searchTextRef.current = text;

    if (text.length > 0 && !showClearButton) setShowClearButton(true);
    else if (text.length === 0 && showClearButton) setShowClearButton(false);
  };

  const handleSearch = () => {
    loadLists(searchTextRef.current);
  };

  const handleClearSearch = () => {
    searchTextRef.current = "";
    setShowClearButton(false);
    searchInputRef.current?.clear();
    loadLists(""); // reset về all
  };

  const handleTabPress = (tabName: string) => {
    setActiveTab(tabName);

    if (tabName === "Home") return;

    if (tabName === "Create") {
      navigation.navigate("CreateDocumentList");
      return;
    }

    if (tabName === "Library") {
      // nếu bạn đã có LibraryScreen thì đổi sang navigate("LibraryScreen")
      Alert.alert("Thông báo", "Chưa có màn Library. Bạn tạo route sau nhé.");
      return;
    }

    if (tabName === "Class") {
      Alert.alert("Thông báo", "Chưa có màn Class. Bạn tạo route sau nhé.");
      return;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* ✅ HEADER giống hình */}
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

      {/* ✅ SEARCH giống hình + có nút X */}
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

      {/* BODY */}
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        <View style={styles.section}>
         

          {loadingRecent && (
            <Text style={{ paddingHorizontal: 20, color: "#777" }}>Loading...</Text>
          )}

          {!loadingRecent && recentPublicLists.length === 0 && (
            <Text style={{ paddingHorizontal: 20, color: "#777" }}>
              No results found
              {searchTextRef.current.trim()
                ? ` for "${searchTextRef.current.trim()}"`
                : "."}
            </Text>
          )}

          {!loadingRecent &&
            recentPublicLists.map((lesson, index) => (
              <TouchableOpacity
                key={lesson.listId ?? index}
                style={styles.recentItem}
                onPress={() =>
                  navigation.navigate("DocumentListDetail", {
                    listId: lesson.listId,
                    title: lesson.title,
                    author: lesson.fullName,
                    itemCount: lesson.itemCount ?? 0,
                  })
                }
              >
                <View style={styles.iconContainer}>
                  <Ionicons name="layers-outline" size={20} color="#555" />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.lessonName}>{lesson.title}</Text>
                  <Text style={styles.lessonAuthor}>
                    {(lesson.itemCount ?? 0) + " cards · " + (lesson.fullName ?? "")}
                  </Text>
                </View>

                <Ionicons name="duplicate-outline" size={20} color="#888" />
              </TouchableOpacity>
            ))}
        </View>
      </ScrollView>

      <SelfStudyBottomBar activeTab={activeTab} onTabPress={handleTabPress} />
    </SafeAreaView>
  );
};

export default SelfStudyScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  // ✅ header giống HomeScreen
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

  // ✅ search giống HomeScreen
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

  section: { marginTop: 10 },
  sectionTitle: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 14,
    paddingHorizontal: 20,
  },
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
});
