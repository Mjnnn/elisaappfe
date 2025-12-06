// src/screens/selfstudy/SelfStudyScreen.tsx

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ProgressBar } from "react-native-paper";
import SelfStudyBottomBar from "../../components/SelfStudyBottomBar";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import documentListService from "../../services/documentListService";
import documentItemService from "../../services/documentItemService";
import { AuthStackParamList } from "../../navigation/AuthStack";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_MARGIN_RIGHT = 14;
const CARD_WIDTH = Math.round(SCREEN_WIDTH * 0.8);

// Kiểu cho 1 document list
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
  itemCount?: number; // số item (cards) trong list
}

// Kiểu navigation cho màn hình này
type NavProp = NativeStackNavigationProp<AuthStackParamList, "SelfStudyScreen">;

type SelfStudyNavProp = NativeStackNavigationProp<
  AuthStackParamList,
  "SelfStudyScreen"
>;

const SelfStudyScreen: React.FC = () => {
  const navigation = useNavigation<SelfStudyNavProp>();

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>("Home");
  const scrollRef = useRef<ScrollView | null>(null);

  // Danh sách list public (Recent)
  const [recentPublicLists, setRecentPublicLists] = useState<DocumentListItem[]>([]);
  const [loadingRecent, setLoadingRecent] = useState<boolean>(false);
  const [searchKeyword, setSearchKeyword] = useState<string>("");

  // Dummy cho phần "Continue from where you left off"
  const lessons = [
    { title: "Pass in One Go - Round 3", progress: 0.78, done: "22/28" },
    { title: "Daily Vocabulary - 24/10", progress: 0.55, done: "15/27" },
    { title: "Listening Practice - 2", progress: 0.32, done: "9/28" },
  ];

  // Hàm load danh sách public hoặc search + đếm số item
  const loadLists = async (keyword?: string) => {
    try {
      setLoadingRecent(true);
      let res;

      const trimmed = (keyword ?? "").trim();

      if (!trimmed) {
        // Không nhập keyword → lấy tất cả public (paged)
        res = await documentListService.getPublicLists(0, 10);
      } else {
        // Có keyword → search theo title/type
        res = await documentListService.searchPublicByTitleOrType(
          trimmed,
          0,
          10
        );
      }

      const pageData = res.data; // Page<DocumentListResponse>
      const lists: DocumentListItem[] = pageData.content ?? [];

      // Lấy số item cho từng list
      const listsWithCounts = await Promise.all(
        lists.map(async (list) => {
          try {
            const itemsRes = await documentItemService.getByListId(list.listId);
            const count = Array.isArray(itemsRes.data)
              ? itemsRes.data.length
              : 0;
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

  // Lần đầu vào màn hình → load public list
  useEffect(() => {
    loadLists();
  }, []);

  // Khi nhấn Enter trong ô search hoặc bấm icon search
  const handleSearch = () => {
    loadLists(searchKeyword);
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const step = CARD_WIDTH + CARD_MARGIN_RIGHT;
    const index = Math.round(offsetX / step);
    if (index !== activeIndex) setActiveIndex(index);
  };

  const goToIndex = (index: number) => {
    const x = index * (CARD_WIDTH + CARD_MARGIN_RIGHT);
    scrollRef.current?.scrollTo({ x, animated: true });
    setActiveIndex(index);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* TOP BAR */}
      <View style={styles.topBar}>
        {/* Search bar */}
        <View style={styles.searchBar}>
          <TouchableOpacity onPress={handleSearch}>
            <Ionicons name="search-outline" size={20} color="#888" />
          </TouchableOpacity>

          <TextInput
            placeholder="Search"
            placeholderTextColor="#888"
            style={styles.searchInput}
            value={searchKeyword}
            onChangeText={setSearchKeyword}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>

        {/* Icon vở có bút */}
        <TouchableOpacity
          onPress={() => navigation.navigate("AppTabs")}
          style={styles.guideButton}
        >
          <View style={styles.iconWrapper}>
            <Ionicons name="book-outline" size={24} color="#3B82F6" />
            <Ionicons
              name="create-outline"
              size={16}
              color="#3B82F6"
              style={styles.penIcon}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* BODY */}
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Continue Studying (dummy) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Continue from where you left off</Text>

          <ScrollView
            horizontal
            ref={scrollRef}
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + CARD_MARGIN_RIGHT}
            decelerationRate="fast"
            snapToAlignment="start"
            onScroll={onScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingHorizontal: 20, paddingRight: 20 }}
          >
            {lessons.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.lessonCard,
                  {
                    width: CARD_WIDTH,
                    marginRight: CARD_MARGIN_RIGHT,
                  },
                ]}
              >
                <Text style={styles.lessonTitle}>{item.title}</Text>
                <ProgressBar
                  progress={item.progress}
                  color="#10B981"
                  style={styles.progressBar}
                />
                <Text style={styles.progressText}>
                  {item.done} cards reviewed
                </Text>

                <TouchableOpacity style={styles.continueButton}>
                  <Text style={styles.continueText}>Continue</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* Dots indicator */}
          <View style={styles.dots}>
            {lessons.map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => goToIndex(i)}
                activeOpacity={0.8}
              >
                <View
                  style={[styles.dot, activeIndex === i && styles.dotActive]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent – Đổ từ API + itemCount */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent</Text>

          {loadingRecent && (
            <Text style={{ paddingHorizontal: 20, color: "#777" }}>
              Loading...
            </Text>
          )}

          {!loadingRecent && recentPublicLists.length === 0 && (
            <Text style={{ paddingHorizontal: 20, color: "#777" }}>
              No results found
              {searchKeyword.trim() ? ` for "${searchKeyword.trim()}"` : "."}
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
                    {(lesson.itemCount ?? 0) +
                      " cards · " +
                      (lesson.fullName ?? "")}
                  </Text>
                </View>

                <Ionicons name="duplicate-outline" size={20} color="#888" />
              </TouchableOpacity>
            ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <SelfStudyBottomBar activeTab={activeTab} onTabPress={setActiveTab} />
    </SafeAreaView>
  );
};

export default SelfStudyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F1F3",
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  searchInput: {
    color: "#000",
    marginLeft: 8,
    flex: 1,
  },
  guideButton: {
    marginLeft: 10,
  },
  iconWrapper: {
    position: "relative",
  },
  penIcon: {
    position: "absolute",
    bottom: -2,
    right: -4,
  },
  section: {
    marginTop: 18,
  },
  sectionTitle: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 14,
    paddingHorizontal: 20,
  },
  lessonCard: {
    backgroundColor: "#F8F8FA",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  lessonTitle: {
    color: "#111",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  progressBar: {
    height: 10,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
  },
  progressText: {
    color: "#555",
    fontSize: 13,
    marginVertical: 8,
  },
  continueButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 14,
    alignItems: "center",
    paddingVertical: 10,
    marginTop: 6,
  },
  continueText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: "#C7C7D1",
    marginHorizontal: 6,
  },
  dotActive: {
    width: 10,
    height: 10,
    backgroundColor: "#111",
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
  lessonName: {
    color: "#111",
    fontSize: 15,
    fontWeight: "600",
  },
  lessonAuthor: {
    color: "#777",
    fontSize: 13,
  },
});
