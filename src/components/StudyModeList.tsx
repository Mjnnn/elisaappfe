import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type StudyMode =
  | "flashcard"
  | "practice_question"
  | "two_side_speak";

interface StudyModeListProps {
  onSelectMode?: (mode: StudyMode) => void;
}

const modes: { id: StudyMode; label: string; icon: string }[] = [
  { id: "flashcard",        label: "Flashcard",       icon: "albums-outline" },
  { id: "practice_question",label: "Câu hỏi ôn tập", icon: "reload-outline" },
  { id: "two_side_speak",   label: "Nối 2 mặt thẻ",   icon: "chatbubbles-outline" },
];

const StudyModeList: React.FC<StudyModeListProps> = ({ onSelectMode }) => {
  return (
    <View style={styles.container}>
      {modes.map((mode) => (
        <TouchableOpacity
          key={mode.id}
          style={styles.item}
          activeOpacity={0.8}
          onPress={() => onSelectMode && onSelectMode(mode.id)}
        >
          <View style={styles.iconBox}>
            <Ionicons name={mode.icon as any} size={20} color="#2563EB" />
          </View>
          <Text style={styles.label}>{mode.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default StudyModeList;

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#E0ECFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  label: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "500",
  },
});
