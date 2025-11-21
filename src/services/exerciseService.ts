import apiService from "./apiService";
import { AxiosResponse } from "axios";
import {PracticeResponse} from "../types/response/ExerciseResponse";

const BASE_URL = "/english-exercise";

const exerciseService = {

  // Lấy danh sách từ vựng có phân trang
  getExercisesByLesson: (lessonId: number): Promise<AxiosResponse<PracticeResponse>> =>
    apiService.get(`${BASE_URL}/${lessonId}`),
};

export default exerciseService;