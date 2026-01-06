// src/screens/selfstudy/ClassScreen.tsx

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { AuthStackParamList } from "../../navigation/AuthStack";
import SelfStudyBottomBar from "../../components/SelfStudyBottomBar";
import MyClassesTab from "./tabs/MyClassesTab";
import JoinedClassesTab from "./tabs/JoinedClassesTab";

import { SelfStudyTabName } from "./selfStudyBottomTabs"; // ✅ FIX TYPE

type NavProp = NativeStackNavigationProp<AuthStackParamList, "ClassScreen">;

type TabKey = "MY" | "JOINED";

const ClassScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();

  const [activeTab, setActiveTab] = useState<TabKey>("MY");

  // ✅ FIX: bottom tab đúng type
  const [bottomTab, setBottomTab] = useState<SelfStudyTabName>("Class");

  const [userId, setUserId] = useState<number | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);

  useEffect(() => {
    const loadUserId = async () => {
      try {
        setLoadingUser(true);

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
      } finally {
        setLoadingUser(false);
      }
    };

    loadUserId();
  }, [navigation]);

  // ✅ FIX: tabName SelfStudyTabName
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

    if (tabName === "Library") {
      navigation.navigate("LibraryScreen");
      return;
    }

    if (tabName === "Class") return;

    if (tabName === "Logout") {
      // Logout đã xử lý bên SelfStudyBottomBar
      return;
    }
  };

  if (loadingUser || !userId) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <View style={{ padding: 16, flexDirection: "row", alignItems: "center", gap: 10 }}>
          <ActivityIndicator size="small" />
          <Text style={{ color: "#6B7280" }}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Lớp học</Text>

        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => navigation.navigate("CreateClass")}
          activeOpacity={0.9}
        >
          <Ionicons name="add" size={18} color="#2563EB" />
          <Text style={styles.createBtnText}>Tạo lớp</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "MY" && styles.tabBtnActive]}
          onPress={() => setActiveTab("MY")}
          activeOpacity={0.9}
        >
          <Text style={[styles.tabText, activeTab === "MY" && styles.tabTextActive]}>
            Lớp học của tôi
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "JOINED" && styles.tabBtnActive]}
          onPress={() => setActiveTab("JOINED")}
          activeOpacity={0.9}
        >
          <Text style={[styles.tabText, activeTab === "JOINED" && styles.tabTextActive]}>
            Lớp học tham gia
          </Text>
        </TouchableOpacity>
      </View>

      {/* Body */}
      {activeTab === "MY" ? <MyClassesTab userId={userId} /> : <JoinedClassesTab userId={userId} />}

      {/* ✅ FIX: không còn lỗi type */}
      <SelfStudyBottomBar activeTab={bottomTab} onTabPress={handleBottomTabPress} />
    </SafeAreaView>
  );
};

export default ClassScreen;

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

  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
  },
  createBtnText: { color: "#2563EB", fontWeight: "800" },

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
  tabText: { color: "#111", fontWeight: "700", fontSize: 13 },
  tabTextActive: { color: "#2563EB" },
});
