import apiService from "./apiService";
import { AxiosResponse } from "axios";
import {EnglishGrammarResponse} from "../types/response/GrammarResponse";

const BASE_URL = "/english-grammar-theories";

const grammarService = {

  // Lấy danh sách từ vựng có phân trang
  getGrammarTheoriesByLesson: (lessonId: number): Promise<AxiosResponse<EnglishGrammarResponse[]>> =>
    apiService.get(`${BASE_URL}/${lessonId}`),

  createGrammarOfLessonL: (lessonId: number, data: FormData) =>
    apiService.post(`${BASE_URL}/create/${lessonId}`, data),

  updateGrammar: (grammarId: number, data: FormData) =>
    apiService.put(`${BASE_URL}/update/${grammarId}`, data),

  deleteGrammar: (grammarId: number) =>
    apiService.delete(`${BASE_URL}/delete/${grammarId}`),
};

export default grammarService;