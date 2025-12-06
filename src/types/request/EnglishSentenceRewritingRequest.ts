export interface EnglishSentenceRewritingRequest {
  originalSentence: string;
  rewrittenSentence: string;
  hint?: string;
  linkMedia?: string;
}