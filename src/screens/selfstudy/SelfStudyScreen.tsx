import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ProgressBar } from "react-native-paper";
import SelfStudyBottomBar from "../../components/SelfStudyBottomBar";
import { useNavigation } from "@react-navigation/native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_MARGIN_RIGHT = 14;
const CARD_WIDTH = Math.round(SCREEN_WIDTH * 0.8);

const SelfStudyScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>("Home");
  const scrollRef = useRef<ScrollView | null>(null);

  const lessons = [
    { title: "Pass in One Go - Round 3", progress: 0.78, done: "22/28" },
    { title: "Daily Vocabulary - 24/10", progress: 0.55, done: "15/27" },
    { title: "Listening Practice - 2", progress: 0.32, done: "9/28" },
  ];

  const recentLessons = [
    { title: "Pass in One Go - Round 3", cards: 28, author: "QuynhOnThiTopik" },
    { title: "Listening Vocabulary 24/10", cards: 34, author: "PhanVanLe" },
  ];

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
      <View style={styles.topBar}>
        {/* 🔍 Search bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#888" />
          <TextInput
            placeholder="Search"
            placeholderTextColor="#888"
            style={styles.searchInput}
          />
        </View>

        {/* 📘✏️ Icon vở có bút */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
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

      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        {/* 📚 Continue Studying */}
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
                <Text style={styles.progressText}>{item.done} cards reviewed</Text>

                <TouchableOpacity style={styles.continueButton}>
                  <Text style={styles.continueText}>Continue</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* ⏺ Dots indicator */}
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

        {/* 🕒 Recent Lessons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent</Text>

          {recentLessons.map((lesson, index) => (
            <TouchableOpacity key={index} style={styles.recentItem}>
              <View style={styles.iconContainer}>
                <Ionicons name="layers-outline" size={20} color="#555" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.lessonName}>{lesson.title}</Text>
                <Text style={styles.lessonAuthor}>
                  {lesson.cards} cards · {lesson.author}
                </Text>
              </View>
              <Ionicons name="duplicate-outline" size={20} color="#888" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* ✅ Bottom Navigation */}
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
