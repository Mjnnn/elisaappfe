import apiService from "./apiService";
import { AxiosResponse } from "axios";
import { VocabularyPageResponse } from "../types/response/VocabularyResponse";

const BASE_URL = "/english-vocabulary-theories";

const vocabularyService = {

  // Lấy danh sách từ vựng có phân trang
  getVocabularyTheoriesByLesson: (lessonId: number, page: number = 0, size: number = 10): Promise<AxiosResponse<VocabularyPageResponse>> =>
    apiService.get(`${BASE_URL}/${lessonId}`, { params: { page, size } }),
};

export default vocabularyService;