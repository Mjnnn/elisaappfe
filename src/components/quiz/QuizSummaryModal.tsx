// src/components/quiz/QuizSummaryModal.tsx

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";

interface WrongItem {
  question: string;
  correctAnswer: string;
  chosenAnswer: string;
}

interface QuizSummaryModalProps {
  visible: boolean;
  correctCount: number;
  wrongCount: number;
  wrongItems: WrongItem[];
  onClose: () => void;
}

const QuizSummaryModal: React.FC<QuizSummaryModalProps> = ({
  visible,
  correctCount,
  wrongCount,
  wrongItems,
  onClose,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.modalBox}>
          <Text style={styles.title}>Kết quả</Text>
          <Text style={styles.summaryText}>
            Đúng: {correctCount} – Sai: {wrongCount}
          </Text>

          <Text style={styles.sectionTitle}>Các câu sai</Text>

          <ScrollView style={{ maxHeight: 260 }}>
            {wrongItems.length === 0 ? (
              <Text style={{ color: "#6B7280" }}>Bạn không sai câu nào 🎉</Text>
            ) : (
              wrongItems.map((it, idx) => (
                <View key={idx} style={styles.wrongItem}>
                  <Text style={styles.question}>{it.question}</Text>
                  <Text style={styles.correct}>
                    Đáp án đúng: {it.correctAnswer}
                  </Text>
                  <Text style={styles.chosen}>
                    Bạn chọn: {it.chosenAnswer}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default QuizSummaryModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  summaryText: {
    textAlign: "center",
    color: "#374151",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
  },
  wrongItem: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 8,
  },
  question: {
    fontWeight: "600",
    color: "#111827",
  },
  correct: {
    color: "#16A34A",
  },
  chosen: {
    color: "#DC2626",
  },
  closeBtn: {
    marginTop: 14,
    borderRadius: 999,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    paddingVertical: 10,
  },
  closeText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
