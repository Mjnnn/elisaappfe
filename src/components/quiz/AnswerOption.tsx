// src/components/quiz/AnswerOption.tsx

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface AnswerOptionProps {
  text: string;
  onPress: () => void;
  isSelected: boolean;
  isCorrect: boolean;
  showResult: boolean; // đã chọn xong, đang hiển thị đúng/sai
}

const AnswerOption: React.FC<AnswerOptionProps> = ({
  text,
  onPress,
  isSelected,
  isCorrect,
  showResult,
}) => {
  let borderColor = "#E5E7EB";
  let backgroundColor = "#FFFFFF";
  let textColor = "#111827";

  if (showResult && isSelected && isCorrect) {
    borderColor = "#16A34A"; // xanh đúng
  } else if (showResult && isSelected && !isCorrect) {
    borderColor = "#F97316"; // cam sai
  } else if (showResult && !isSelected && isCorrect) {
    borderColor = "#16A34A";
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.container, { borderColor, backgroundColor }]}
      onPress={onPress}
    >
      <Text style={[styles.text, { color: textColor }]}>{text}</Text>
    </TouchableOpacity>
  );
};

export default AnswerOption;

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
  },
});
