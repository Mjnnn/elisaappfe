export type AnswerOption = {
  text: string;
  isCorrect: boolean;
};

// Định nghĩa kiểu dữ liệu cho Dạng bài Điền vào chỗ trống
export type FillInTheBlankQuestion = {
  id: number;
  type: 'fill_in_the_blank';
  questionText: string; // Câu hỏi hiển thị (có chứa chỗ trống)
  options: AnswerOption[]; // 4 lựa chọn trả lời
  difficulty: 'easy' | 'medium' | 'hard';
};

// Định nghĩa kiểu dữ liệu cho Dạng bài Sắp xếp câu
export type SentenceReorderQuestion = {
  id: number;
  type: 'sentence_reorder';
  sentenceParts: string[]; // Các từ/cụm từ cần sắp xếp
  correctOrder: string; // Thứ tự đúng (câu hoàn chỉnh)
  difficulty: 'easy' | 'medium' | 'hard';
  hint: string; // Gợi ý ngữ pháp hoặc cấu trúc câu
};

export type QuizQuestion = FillInTheBlankQuestion | SentenceReorderQuestion;

export const quizQuestions: QuizQuestion[] = [
  // --- Dạng 1: Điền vào chỗ trống (Fill in the Blank) - 25 CÂU ---
  {
    id: 1,
    type: 'fill_in_the_blank',
    questionText: "She _______ going to the cinema tonight.",
    options: [
      { text: "is", isCorrect: true },
      { text: "am", isCorrect: false },
      { text: "are", isCorrect: false },
      { text: "be", isCorrect: false },
    ],
    difficulty: 'easy',
  },
  {
    id: 2,
    type: 'fill_in_the_blank',
    questionText: "I have lived in this city _______ ten years.",
    options: [
      { text: "since", isCorrect: false },
      { text: "at", isCorrect: false },
      { text: "for", isCorrect: true },
      { text: "during", isCorrect: false },
    ],
    difficulty: 'medium',
  },
  {
    id: 3,
    type: 'fill_in_the_blank',
    questionText: "If I _______ a bird, I would fly everywhere.",
    options: [
      { text: "am", isCorrect: false },
      { text: "was", isCorrect: false },
      { text: "were", isCorrect: true },
      { text: "is", isCorrect: false },
    ],
    difficulty: 'hard',
  },
  {
    id: 4,
    type: 'fill_in_the_blank',
    questionText: "You _______ finish your homework before watching TV.",
    options: [
      { text: "can", isCorrect: false },
      { text: "must", isCorrect: true },
      { text: "may", isCorrect: false },
      { text: "could", isCorrect: false },
    ],
    difficulty: 'easy',
  },
  {
    id: 5,
    type: 'fill_in_the_blank',
    questionText: "_______ Eiffel Tower is in Paris.",
    options: [
      { text: "A", isCorrect: false },
      { text: "An", isCorrect: false },
      { text: "The", isCorrect: true },
      { text: "No article", isCorrect: false },
    ],
    difficulty: 'easy',
  },
  {
    id: 6,
    type: 'fill_in_the_blank',
    questionText: "There are _______ books on the shelf.",
    options: [
      { text: "much", isCorrect: false },
      { text: "little", isCorrect: false },
      { text: "many", isCorrect: true },
      { text: "some", isCorrect: false },
    ],
    difficulty: 'medium',
  },
  {
    id: 7,
    type: 'fill_in_the_blank',
    questionText: "They _______ Rome last summer.",
    options: [
      { text: "visit", isCorrect: false },
      { text: "visiting", isCorrect: false },
      { text: "visited", isCorrect: true },
      { text: "have visited", isCorrect: false },
    ],
    difficulty: 'easy',
  },
  {
    id: 8,
    type: 'fill_in_the_blank',
    questionText: "He _______ his meal yet.",
    options: [
      { text: "doesn't finish", isCorrect: false },
      { text: "hasn't finished", isCorrect: true },
      { text: "didn't finish", isCorrect: false },
      { text: "isn't finishing", isCorrect: false },
    ],
    difficulty: 'medium',
  },
  {
    id: 9,
    type: 'fill_in_the_blank',
    questionText: "The keys are _______ the table.",
    options: [
      { text: "in", isCorrect: false },
      { text: "at", isCorrect: false },
      { text: "on", isCorrect: true },
      { text: "under", isCorrect: false },
    ],
    difficulty: 'easy',
  },
  {
    id: 10,
    type: 'fill_in_the_blank',
    questionText: "I _______ a book when she called.",
    options: [
      { text: "read", isCorrect: false },
      { text: "was reading", isCorrect: true },
      { text: "am reading", isCorrect: false },
      { text: "have read", isCorrect: false },
    ],
    difficulty: 'medium',
  },
  {
    id: 11,
    type: 'fill_in_the_blank',
    questionText: "The letter _______ by the secretary every morning.",
    options: [
      { text: "writes", isCorrect: false },
      { text: "is writing", isCorrect: false },
      { text: "is written", isCorrect: true },
      { text: "has written", isCorrect: false },
    ],
    difficulty: 'hard',
  },
  {
    id: 12,
    type: 'fill_in_the_blank',
    questionText: "My friend and _______ are going to the party together.",
    options: [
      { text: "me", isCorrect: false },
      { text: "I", isCorrect: true },
      { text: "us", isCorrect: false },
      { text: "mine", isCorrect: false },
    ],
    difficulty: 'easy',
  },
  {
    id: 13,
    type: 'fill_in_the_blank',
    questionText: "This car is _______ than the old one.",
    options: [
      { text: "fast", isCorrect: false },
      { text: "faster", isCorrect: true },
      { text: "fastest", isCorrect: false },
      { text: "more fast", isCorrect: false },
    ],
    difficulty: 'medium',
  },
  {
    id: 14,
    type: 'fill_in_the_blank',
    questionText: "She is the _______ intelligent person I know.",
    options: [
      { text: "more", isCorrect: false },
      { text: "much", isCorrect: false },
      { text: "most", isCorrect: true },
      { text: "better", isCorrect: false },
    ],
    difficulty: 'medium',
  },
  {
    id: 15,
    type: 'fill_in_the_blank',
    questionText: "He enjoys _______ in the ocean.",
    options: [
      { text: "swim", isCorrect: false },
      { text: "to swim", isCorrect: false },
      { text: "swimming", isCorrect: true },
      { text: "swims", isCorrect: false },
    ],
    difficulty: 'hard',
  },
  {
    id: 16,
    type: 'fill_in_the_blank',
    questionText: "I think it _______ tomorrow.",
    options: [
      { text: "rains", isCorrect: false },
      { text: "will rain", isCorrect: true },
      { text: "is raining", isCorrect: false },
      { text: "is going rain", isCorrect: false },
    ],
    difficulty: 'easy',
  },
  {
    id: 17,
    type: 'fill_in_the_blank',
    questionText: "It _______ snow later this week, but it's not certain.",
    options: [
      { text: "must", isCorrect: false },
      { text: "should", isCorrect: false },
      { text: "might", isCorrect: true },
      { text: "can", isCorrect: false },
    ],
    difficulty: 'medium',
  },
  {
    id: 18,
    type: 'fill_in_the_blank',
    questionText: "If you study hard, you _______ the exam.",
    options: [
      { text: "pass", isCorrect: false },
      { text: "will pass", isCorrect: true },
      { text: "passed", isCorrect: false },
      { text: "would pass", isCorrect: false },
    ],
    difficulty: 'easy',
  },
  {
    id: 19,
    type: 'fill_in_the_blank',
    questionText: "That is the house _______ I grew up.",
    options: [
      { text: "which", isCorrect: false },
      { text: "where", isCorrect: true },
      { text: "who", isCorrect: false },
      { text: "what", isCorrect: false },
    ],
    difficulty: 'hard',
  },
  {
    id: 20,
    type: 'fill_in_the_blank',
    questionText: "We need to _______ the meaning of this word in the dictionary.",
    options: [
      { text: "look at", isCorrect: false },
      { text: "look up", isCorrect: true },
      { text: "look after", isCorrect: false },
      { text: "look into", isCorrect: false },
    ],
    difficulty: 'medium',
  },
  {
    id: 21,
    type: 'fill_in_the_blank',
    questionText: "She needs _______ advice on her career, so she's seeing a consultant.",
    options: [
      { text: "many", isCorrect: false },
      { text: "a few", isCorrect: false },
      { text: "much", isCorrect: true },
      { text: "several", isCorrect: false },
    ],
    difficulty: 'hard',
  },
  {
    id: 22,
    type: 'fill_in_the_blank',
    questionText: "I saw _______ elephant at the zoo.",
    options: [
      { text: "a", isCorrect: false },
      { text: "an", isCorrect: true },
      { text: "the", isCorrect: false },
      { text: "no article", isCorrect: false },
    ],
    difficulty: 'easy',
  },
  {
    id: 23,
    type: 'fill_in_the_blank',
    questionText: "They _______ dinner before we arrived.",
    options: [
      { text: "ate", isCorrect: false },
      { text: "were eating", isCorrect: false },
      { text: "had eaten", isCorrect: true },
      { text: "have eaten", isCorrect: false },
    ],
    difficulty: 'hard',
  },
  {
    id: 24,
    type: 'fill_in_the_blank',
    questionText: "He is tired _______ he worked late last night.",
    options: [
      { text: "so", isCorrect: false },
      { text: "but", isCorrect: false },
      { text: "although", isCorrect: false },
      { text: "because", isCorrect: true },
    ],
    difficulty: 'medium',
  },
  {
    id: 25,
    type: 'fill_in_the_blank',
    questionText: "You _______ see a doctor if you feel sick.",
    options: [
      { text: "can", isCorrect: false },
      { text: "should", isCorrect: true },
      { text: "might", isCorrect: false },
      { text: "will", isCorrect: false },
    ],
    difficulty: 'easy',
  },

  // --- Dạng 2: Sắp xếp các câu thành câu hoàn chỉnh (Sentence Reorder) - 25 CÂU ---
  {
    id: 26,
    type: 'sentence_reorder',
    sentenceParts: ["to visit", "I would like", "France someday"],
    correctOrder: "I would like to visit France someday",
    difficulty: 'easy',
    hint: "Bắt đầu bằng chủ ngữ, sau đó là động từ khuyết thiếu 'would like'.",
  },
  {
    id: 27,
    type: 'sentence_reorder',
    sentenceParts: ["nearest bus stop", "Where is", "the"],
    correctOrder: "Where is the nearest bus stop",
    difficulty: 'easy',
    hint: "Cấu trúc cơ bản của câu hỏi Wh- question.",
  },
  {
    id: 28,
    type: 'sentence_reorder',
    sentenceParts: ["it was raining", "we decided", "to go hiking", "Although"],
    correctOrder: "Although it was raining, we decided to go hiking",
    difficulty: 'medium',
    hint: "Bắt đầu với liên từ phụ thuộc 'Although'.",
  },
  {
    id: 29,
    type: 'sentence_reorder',
    sentenceParts: ["go to the park", "Do you want", "to"],
    correctOrder: "Do you want to go to the park",
    difficulty: 'easy',
    hint: "Cấu trúc câu hỏi Yes/No với 'Do'.",
  },
  {
    id: 30,
    type: 'sentence_reorder',
    sentenceParts: ["She often goes", "in the morning", "jogging"],
    correctOrder: "She often goes jogging in the morning",
    difficulty: 'medium',
    hint: "Vị trí của trạng từ tần suất 'often' trong câu khẳng định.",
  },
  {
    id: 31,
    type: 'sentence_reorder',
    sentenceParts: ["meet next Friday", "We can", "afternoon"],
    correctOrder: "We can meet next Friday afternoon",
    difficulty: 'easy',
    hint: "Đặt động từ khuyết thiếu 'can' sau chủ ngữ.",
  },
  {
    id: 32,
    type: 'sentence_reorder',
    sentenceParts: ["was built", "The new bridge", "by engineers", "last year"],
    correctOrder: "The new bridge was built by engineers last year",
    difficulty: 'hard',
    hint: "Đây là cấu trúc câu bị động ở thì quá khứ đơn.",
  },
  {
    id: 33,
    type: 'sentence_reorder',
    sentenceParts: ["to buy some milk", "I went", "to the store"],
    correctOrder: "I went to the store to buy some milk",
    difficulty: 'medium',
    hint: "Động từ nguyên thể có 'to' để chỉ mục đích.",
  },
  {
    id: 34,
    type: 'sentence_reorder',
    sentenceParts: ["what time", "the train leaves", "Can you tell me"],
    correctOrder: "Can you tell me what time the train leaves",
    difficulty: 'hard',
    hint: "Trong câu hỏi gián tiếp, phần sau cụm 'what time' phải là cấu trúc câu khẳng định.",
  },
  {
    id: 35,
    type: 'sentence_reorder',
    sentenceParts: ["more time", "I would learn Spanish", "If I had"],
    correctOrder: "If I had more time, I would learn Spanish",
    difficulty: 'medium',
    hint: "Đây là cấu trúc câu điều kiện loại 2 (giả định không có thật ở hiện tại).",
  },
  {
    id: 36,
    type: 'sentence_reorder',
    sentenceParts: ["whose dog", "I spoke to the woman", "bit me"],
    correctOrder: "I spoke to the woman whose dog bit me",
    difficulty: 'hard',
    hint: "Sử dụng đại từ quan hệ 'whose' để chỉ sở hữu.",
  },
  {
    id: 37,
    type: 'sentence_reorder',
    sentenceParts: ["the book", "back on the shelf", "Please put"],
    correctOrder: "Please put the book back on the shelf",
    difficulty: 'medium',
    hint: "Lưu ý vị trí của tân ngữ trong cụm động từ (phrasal verb).",
  },
  {
    id: 38,
    type: 'sentence_reorder',
    sentenceParts: ["to New York", "Have you ever been"],
    correctOrder: "Have you ever been to New York",
    difficulty: 'easy',
    hint: "Thì hiện tại hoàn thành với 'ever'.",
  },
  {
    id: 39,
    type: 'sentence_reorder',
    sentenceParts: ["he had forgotten", "He said that", "his keys"],
    correctOrder: "He said that he had forgotten his keys",
    difficulty: 'hard',
    hint: "Đây là câu tường thuật, cần lùi thì (quá khứ hoàn thành).",
  },
  {
    id: 40,
    type: 'sentence_reorder',
    sentenceParts: ["The sun was shining", "but it was", "very cold"],
    correctOrder: "The sun was shining, but it was very cold",
    difficulty: 'medium',
    hint: "Sử dụng liên từ 'but' để nối hai mệnh đề đối lập.",
  },
  {
    id: 41,
    type: 'sentence_reorder',
    sentenceParts: ["I usually check", "Before I start work", "my email"],
    correctOrder: "Before I start work, I usually check my email",
    difficulty: 'easy',
    hint: "Mệnh đề thời gian thường đứng đầu câu và cách bởi dấu phẩy.",
  },
  {
    id: 42,
    type: 'sentence_reorder',
    sentenceParts: ["pizza for dinner", "Don't you like"],
    correctOrder: "Don't you like pizza for dinner",
    difficulty: 'medium',
    hint: "Cấu trúc câu hỏi phủ định để bày tỏ sự ngạc nhiên hoặc sự thật hiển nhiên.",
  },
  {
    id: 43,
    type: 'sentence_reorder',
    sentenceParts: ["a beautiful", "long, black dress", "She is wearing"],
    correctOrder: "She is wearing a beautiful, long, black dress",
    difficulty: 'hard',
    hint: "Chú ý thứ tự sắp xếp các tính từ (ý kiến, kích thước, màu sắc).",
  },
  {
    id: 44,
    type: 'sentence_reorder',
    sentenceParts: ["the lights", "when you leave", "Turn off", "the room"],
    correctOrder: "Turn off the lights when you leave the room",
    difficulty: 'easy',
    hint: "Đây là một câu mệnh lệnh, bắt đầu bằng động từ.",
  },
  {
    id: 45,
    type: 'sentence_reorder',
    sentenceParts: ["I will be flying", "at this time", "to Tokyo", "Tomorrow"],
    correctOrder: "Tomorrow at this time, I will be flying to Tokyo",
    difficulty: 'medium',
    hint: "Thì tương lai tiếp diễn diễn tả hành động đang xảy ra tại một thời điểm cụ thể trong tương lai.",
  },
  {
    id: 46,
    type: 'sentence_reorder',
    sentenceParts: ["a new bicycle", "My father bought me", "last week"],
    correctOrder: "My father bought me a new bicycle last week",
    difficulty: 'hard',
    hint: "Cấu trúc động từ với hai tân ngữ (trực tiếp và gián tiếp).",
  },
  {
    id: 47,
    type: 'sentence_reorder',
    sentenceParts: ["listening to", "I really enjoy", "classical music"],
    correctOrder: "I really enjoy listening to classical music",
    difficulty: 'medium',
    hint: "Động từ 'enjoy' theo sau là V-ing.",
  },
  {
    id: 48,
    type: 'sentence_reorder',
    sentenceParts: ["alone helps me", "gain confidence", "Traveling"],
    correctOrder: "Traveling alone helps me gain confidence",
    difficulty: 'hard',
    hint: "Sử dụng danh động từ (Gerund) làm chủ ngữ.",
  },
  {
    id: 49,
    type: 'sentence_reorder',
    sentenceParts: ["the vase", "in the kitchen", "Who broke"],
    correctOrder: "Who broke the vase in the kitchen",
    difficulty: 'easy',
    hint: "Đây là câu hỏi Wh- question mà từ hỏi đóng vai trò làm chủ ngữ.",
  },
  {
    id: 50,
    type: 'sentence_reorder',
    sentenceParts: ["Not only did she sing", "but she also", "danced beautifully"],
    correctOrder: "Not only did she sing, but she also danced beautifully",
    difficulty: 'hard',
    hint: "Cấu trúc đảo ngữ với 'Not only... but also...'.",
  },
];