import apiService from "./apiService";
import { AxiosResponse } from "axios";
import { VocabularyPageResponse } from "../types/response/VocabularyResponse";

const BASE_URL = "/english-vocabulary-theories";

const vocabularyService = {

  // Lấy danh sách từ vựng có phân trang
  getVocabularyTheoriesByLesson: (lessonId: number, page: number = 0, size: number = 10): Promise<AxiosResponse<VocabularyPageResponse>> =>
    apiService.get(`${BASE_URL}/${lessonId}`, { params: { page, size } }),

  createVocabularyByLesson: (lessonId: number, data: FormData) =>
    apiService.post(`${BASE_URL}/create/${lessonId}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  updateVocabulary: (vocabId: number, data: FormData) =>
    apiService.put(`${BASE_URL}/update/${vocabId}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  deleteVocabulary: (vocabId: number) =>
    apiService.delete(`${BASE_URL}/delete/${vocabId}`),
};

export default vocabularyService;