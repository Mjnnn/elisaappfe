// src/components/FlashcardSettingsModal.tsx

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export type FrontSideType = "word" | "meaning";

interface FlashcardSettingsModalProps {
  visible: boolean;
  onClose: () => void;

  shuffleEnabled: boolean;
  onToggleShuffle: (value: boolean) => void;

  ttsEnabled: boolean;
  onToggleTts: (value: boolean) => void;

  stackEnabled: boolean;
  onToggleStack: (value: boolean) => void;

  frontSide: FrontSideType;
  onChangeFrontSide: (side: FrontSideType) => void;

  onResetDeck: () => void;
}

const FlashcardSettingsModal: React.FC<FlashcardSettingsModalProps> = ({
  visible,
  onClose,
  shuffleEnabled,
  onToggleShuffle,
  ttsEnabled,
  onToggleTts,
  stackEnabled,
  onToggleStack,
  frontSide,
  onChangeFrontSide,
  onResetDeck,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-outline" size={26} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Tùy chọn</Text>
            <View style={{ width: 26 }} />
          </View>

          <ScrollView>
            {/* Chung */}
            <Text style={styles.sectionTitle}>Chung</Text>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Trộn thẻ</Text>
              <Switch value={shuffleEnabled} onValueChange={onToggleShuffle} />
            </View>

            {/* Thiết lập thẻ ghi nhớ */}
            <Text style={styles.sectionTitle}>Thiết lập thẻ ghi nhớ</Text>

            <View style={styles.segmentWrapper}>
              <TouchableOpacity
                style={[
                  styles.segmentItem,
                  frontSide === "word" && styles.segmentItemActive,
                ]}
                onPress={() => onChangeFrontSide("word")}
              >
                <Text
                  style={[
                    styles.segmentText,
                    frontSide === "word" && styles.segmentTextActive,
                  ]}
                >
                  Tiếng Anh
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentItem,
                  frontSide === "meaning" && styles.segmentItemActive,
                ]}
                onPress={() => onChangeFrontSide("meaning")}
              >
                <Text
                  style={[
                    styles.segmentText,
                    frontSide === "meaning" && styles.segmentTextActive,
                  ]}
                >
                  Tiếng Việt
                </Text>
              </TouchableOpacity>
            </View>

            {/* Đặt lại deck */}
            <TouchableOpacity style={styles.resetButton} onPress={onResetDeck}>
              <Text style={styles.resetText}>Đặt lại Thẻ ghi nhớ</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default FlashcardSettingsModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-end",
  },
  modalContent: {
    maxHeight: SCREEN_HEIGHT * 0.8,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    justifyContent: "space-between",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  sectionTitle: {
    marginTop: 16,
    marginHorizontal: 16,
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 10,
  },
  settingLabel: {
    fontSize: 15,
    color: "#111827",
  },
  settingDescription: {
    marginHorizontal: 16,
    marginTop: 4,
    fontSize: 13,
    color: "#6B7280",
  },
  segmentWrapper: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    padding: 2,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentItemActive: {
    backgroundColor: "#FFFFFF",
  },
  segmentText: {
    fontSize: 14,
    color: "#6B7280",
  },
  segmentTextActive: {
    color: "#111827",
    fontWeight: "600",
  },
  resetButton: {
    marginTop: 24,
    marginHorizontal: 16,
    paddingVertical: 12,
  },
  resetText: {
    fontSize: 15,
    color: "#DC2626",
    fontWeight: "600",
  },
});
