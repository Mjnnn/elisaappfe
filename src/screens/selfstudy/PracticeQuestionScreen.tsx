// src/screens/selfstudy/PracticeQuestionScreen.tsx

import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { AuthStackParamList } from "../../navigation/AuthStack";
import documentItemService from "../../services/documentItemService";

import QuestionHeader from "../../components/quiz/QuestionHeader";
import AnswerOption from "../../components/quiz/AnswerOption";
import QuizSummaryModal from "../../components/quiz/QuizSummaryModal";

type RouteP = RouteProp<AuthStackParamList, "PracticeQuestionScreen">;
type NavP = NativeStackNavigationProp<
  AuthStackParamList,
  "PracticeQuestionScreen"
>;

interface DocumentItem {
  wordId: number;
  listId: number;
  word: string;
  meaning: string;
  example?: string;
  vocabImage?: string;
}

interface WrongItem {
  question: string;
  correctAnswer: string;
  chosenAnswer: string;
}

const PracticeQuestionScreen: React.FC = () => {
  const navigation = useNavigation<NavP>();
  const route = useRoute<RouteP>();
  const { listId } = route.params;

  const [items, setItems] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [optionIds, setOptionIds] = useState<number[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [wrongItems, setWrongItems] = useState<WrongItem[]>([]);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await documentItemService.getByListId(listId);
        const arr: DocumentItem[] = res.data ?? [];
        setItems(arr);
        setCurrentIndex(0);
        setSelectedId(null);
        setShowResult(false);
        if (arr.length > 0) {
          buildOptions(arr, 0);
        }
      } catch (e) {
        console.log("Load practice items error:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [listId]);

  const currentItem = useMemo(
    () => (items.length > 0 ? items[currentIndex] : undefined),
    [items, currentIndex]
  );

  const total = items.length;

  const buildOptions = (data: DocumentItem[], idx: number) => {
    const current = data[idx];
    if (!current) {
      setOptionIds([]);
      return;
    }
    const others = data.filter((it) => it.wordId !== current.wordId);
    const shuffledOthers = [...others].sort(() => Math.random() - 0.5);
    const candidates = [current, ...shuffledOthers.slice(0, 3)];
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    setOptionIds(shuffled.map((it) => it.wordId));
  };

  const handleSelectOption = (id: number) => {
    if (showResult) return;
    setSelectedId(id);
    setShowResult(true);

    if (!currentItem) return;
    const isCorrect = id === currentItem.wordId;

    if (isCorrect) {
      setCorrectCount((c) => c + 1);
    } else {
      setWrongCount((c) => c + 1);
      const chosen = items.find((it) => it.wordId === id);
      setWrongItems((prev) => [
        ...prev,
        {
          question: currentItem.meaning || currentItem.word,
          correctAnswer: currentItem.word,
          chosenAnswer: chosen?.word || "",
        },
      ]);
    }
  };

  const handleContinue = () => {
    if (!showResult) return;

    if (currentIndex < total - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      buildOptions(items, newIndex);
      setSelectedId(null);
      setShowResult(false);
    } else {
      setShowSummary(true);
    }
  };

  const getOptionText = (id: number) => {
    const it = items.find((x) => x.wordId === id);
    return it?.word || "";
  };

  const isCorrectOption = (id: number) =>
    !!currentItem && id === currentItem.wordId;

  const renderFeedback = () => {
    if (!showResult || !currentItem || selectedId == null) return null;
    const isCorrect = selectedId === currentItem.wordId;
    return (
      <Text
        style={[
          styles.feedbackText,
          { color: isCorrect ? "#16A34A" : "#EA580C" },
        ]}
      >
        {isCorrect ? "Chính xác! Tiếp tục nhé 💪" : "Chưa đúng, hãy cố gắng nhé!"}
      </Text>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <QuestionHeader
        currentIndex={currentIndex}
        total={total}
        onClose={() => navigation.goBack()}
        onOpenSettings={() => {}}
      />

      {/* CONTENT: câu hỏi phía trên, đáp án “dồn” xuống dưới */}
      <View style={styles.content}>
        {/* Câu hỏi */}
        <View style={styles.questionBox}>
          {loading ? (
            <Text style={{ color: "#6B7280" }}>Đang tải...</Text>
          ) : !currentItem ? (
            <Text style={{ color: "#6B7280" }}>Chưa có câu hỏi nào.</Text>
          ) : (
            <>
              <Text style={styles.questionText}>
                {currentItem.meaning || currentItem.word}
              </Text>
            </>
          )}
        </View>

        {/* Block đáp án: marginTop: "auto" để dính xuống gần nút Tiếp tục */}
        <View style={styles.optionsBox}>
          {currentItem && (
            <>
              <Text style={styles.answerLabel}>Chọn câu trả lời</Text>

              {optionIds.map((id) => (
                <AnswerOption
                  key={id}
                  text={getOptionText(id)}
                  onPress={() => handleSelectOption(id)}
                  isSelected={selectedId === id}
                  isCorrect={isCorrectOption(id)}
                  showResult={showResult}
                />
              ))}

              {renderFeedback()}
            </>
          )}
        </View>
      </View>

      {/* Nút tiếp tục */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.continueBtn,
            { opacity: showResult ? 1 : 0.4 },
          ]}
          disabled={!showResult}
          onPress={handleContinue}
        >
          <Text style={styles.continueText}>
            {currentIndex < total - 1 ? "Tiếp tục" : "Xem kết quả"}
          </Text>
        </TouchableOpacity>
      </View>

      <QuizSummaryModal
        visible={showSummary}
        correctCount={correctCount}
        wrongCount={wrongCount}
        wrongItems={wrongItems}
        onClose={() => {
          setShowSummary(false);
          navigation.goBack();
        }}
      />
    </SafeAreaView>
  );
};

export default PracticeQuestionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  questionBox: {
    marginTop: 24,
  },
  questionText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#111827",
  },
  optionsBox: {
    marginTop: "auto", // 👈 đẩy block đáp án xuống dưới
    paddingBottom: 12, // chừa khoảng trống so với nút Tiếp tục
  },
  answerLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
  },
  feedbackText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "500",
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  continueBtn: {
    borderRadius: 999,
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    alignItems: "center",
  },
  continueText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
