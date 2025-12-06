import apiService from "./apiService";
import { AxiosResponse } from "axios";
import {UserProgressResponse} from "../types/response/UserProgressResponse";
import {UpdateUserProgress} from "../types/request/UserProgressRequest";

const BASE_URL = "/english-user-progress";

const userProgressService = {

  // Lấy danh sách từ vựng có phân trang
  getUserProgressByUserId: (userId: number): Promise<AxiosResponse<UserProgressResponse>> =>
    apiService.get(`${BASE_URL}/${userId}`),

  updateUserProgress: (data: UpdateUserProgress): Promise<AxiosResponse<UserProgressResponse>> =>
    apiService.post(`${BASE_URL}/update`, data),

  createUserProgress: (userId: number): Promise<AxiosResponse<UserProgressResponse>> =>
    apiService.post(`${BASE_URL}/create/${userId}`, { userId }),
};

export default userProgressService;