import apiService from "./apiService";
import { AxiosResponse } from "axios";
import {CreateNotification} from "../types/request/NotificationRequest";
import {NotificationResponse} from "../types/response/NotificationResponse";

const BASE_URL = "/english-notification";

const userProgressService = {

  // Lấy danh sách từ vựng có phân trang
    getNotificationByUserId: (userId: number): Promise<AxiosResponse<NotificationResponse[]>> =>
    apiService.get(`${BASE_URL}/${userId}`),

    createNotification: (data: CreateNotification): Promise<AxiosResponse<NotificationResponse>> =>
    apiService.post(`${BASE_URL}/create`, data),

    updateNotification: (userId: number): Promise<AxiosResponse<NotificationResponse[]>> =>
    apiService.put(`${BASE_URL}/update/${userId}`, { userId }),
};

export default userProgressService;