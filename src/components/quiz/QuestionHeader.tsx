// src/components/quiz/QuestionHeader.tsx

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface QuestionHeaderProps {
  currentIndex: number;   // 0-based
  total: number;
  onClose: () => void;
  onOpenSettings: () => void;
}

const QuestionHeader: React.FC<QuestionHeaderProps> = ({
  currentIndex,
  total,
  onClose,
  onOpenSettings,
}) => {
  const currentNumber = total === 0 ? 0 : currentIndex + 1;
  const progressPercent =
    total > 0 ? (currentNumber / total) * (SCREEN_WIDTH - 32) : 0;

  return (
    <>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close-outline" size={26} color="#111827" />
        </TouchableOpacity>


        <TouchableOpacity onPress={onOpenSettings}>
          <Ionicons name="settings-outline" size={22} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.progressRow}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: progressPercent }]} />
        </View>

        <View style={styles.totalCircle}>
          <Text style={styles.totalText}>{total}</Text>
        </View>
      </View>
    </>
  );
};

export default QuestionHeader;

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  progressBarBackground: {
    flex: 1,
    height: 3,
    borderRadius: 3,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  progressBarFill: {
    height: 3,
    backgroundColor: "#3B82F6",
  },
  totalCircle: {
    marginLeft: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  totalText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
});
