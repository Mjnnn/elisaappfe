import apiService from "./apiService";
import { AxiosResponse } from "axios";
import {EnglishGrammarResponse} from "../types/response/GrammarResponse";

const BASE_URL = "/english-grammar-theories";

const grammarService = {

  // Lấy danh sách từ vựng có phân trang
  getGrammarTheoriesByLesson: (lessonId: number): Promise<AxiosResponse<EnglishGrammarResponse[]>> =>
    apiService.get(`${BASE_URL}/${lessonId}`),
};

export default grammarService;