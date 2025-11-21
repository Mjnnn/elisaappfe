import apiService from "./apiService";
import { AxiosResponse } from "axios";
import {UserXPResponse} from "../types/response/UserXPResponse";
import {UserXPRequest} from "../types/request/UserXPRequest";

const BASE_URL = "/english-user-xp";

const userXPService = {

  // Lấy danh sách từ vựng có phân trang
  getUserXPByUserId: (userId: number): Promise<AxiosResponse<UserXPResponse>> =>
    apiService.get(`${BASE_URL}/${userId}`),

  updateUserXP: (data: UserXPRequest): Promise<AxiosResponse<UserXPResponse>> =>
    apiService.post(`${BASE_URL}/update`, data),

  createUserXP: (userId: number): Promise<AxiosResponse<UserXPResponse>> =>
    apiService.post(`${BASE_URL}/create/${userId}`, { userId }),
};

export default userXPService;