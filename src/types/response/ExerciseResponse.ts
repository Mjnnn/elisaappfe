// types/ExerciseTypes.ts

export interface MultipleChoiceQuestion {
    questionId: number;
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: string;
    linkMedia: string;
}

export interface SentenceRewritingQuestion {
    questionId: number;
    originalSentence: string; // "a, I, am, teacher"
    rewrittenSentence: string; // "I am a teacher"
    hint: string;
    linkMedia: string;      
}

export interface PracticeResponse {
    listMultipleChoice: MultipleChoiceQuestion[];
    listSentenceRewriting: SentenceRewritingQuestion[];
}

// Type hợp nhất để dùng chung trong mảng state
export type ExerciseType = 'MULTIPLE_CHOICE' | 'SENTENCE_REWRITING';

export interface CombinedQuestion {
    type: ExerciseType;
    data: MultipleChoiceQuestion | SentenceRewritingQuestion;
    id: string; // Unique ID để key extractor
}

export interface EnglishListeningDictationResponse {
  id: number;
  title: string;
  audioUrl: string;
  transcript: string;
  hintText: string;
}

export interface EnglishClozeBlankResponse {
  id: number;
  blankIndex: number;
  correctAnswer: string;
  hint: string | null; 
}

export interface EnglishClozeExerciseResponse {
  id: number;
  title: string;
  content: string; 
  blanks: EnglishClozeBlankResponse[]; 
}

export interface EnglishParagraphSegmentResponse {
  id: number;
  content: string;     
  correctOrder: number; 
}

export interface EnglishOrderingExerciseResponse {
  id: number;
  title: string;
  hint: string | null;  
  paragraphs: EnglishParagraphSegmentResponse[]; 
}