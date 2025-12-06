
export interface EnglishSentenceRewritingResponse {
  questionId: number;
  originalSentence: string;
  rewrittenSentence: string;
  hint?: string;      
  linkMedia?: string;
}