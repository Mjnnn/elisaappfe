// 1. Định nghĩa cho object con (Blank) trước
export interface EnglishClozeBlankRequest {
  blankIndex: number;     
  correctAnswer: string;
  hint: string;            
}

export interface EnglishClozeExerciseRequest {
  title: string;
  content: string;
  blanks: EnglishClozeBlankRequest[]; 
}