export interface EnglishChatbotResponse {
  userText: string;
  answerChatbot: string;
  answerVietnamese: string;
}

export interface EnglishCheckMessageResponse {
  originalSentence: string;
  score: number; 
  editedSentence: string;
  hintText: string;
}