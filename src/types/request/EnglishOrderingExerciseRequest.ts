export interface EnglishParagraphSegmentRequest {
  content: string;
  correctOrder: number; 
}

export interface EnglishOrderingExerciseRequest {
  title: string;
  hint: string;
  paragraphs: EnglishParagraphSegmentRequest[]; 
}