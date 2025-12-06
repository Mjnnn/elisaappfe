// src/services/classUserService.ts
import axios from "axios";
import apiService from "./apiService";

const BASE_URL = "/class-users";

const classUserService = {
  // Lấy tất cả class-user
  getAll: () => apiService.get(`${BASE_URL}`),

  // Lấy theo id
  getById: (id: number) => apiService.get(`${BASE_URL}/${id}`),

  // Tạo mới (add user vào class)
  create: (data: any) => apiService.post(`${BASE_URL}`, data),

  // Join class (dùng query params classId, userId, password)
  joinClass: (classId: number, userId: number, password: string) =>
    apiService.post(`${BASE_URL}/join`, null, {
      params: { classId, userId, password },
    }),

  // Xóa theo id bản ghi class-user
  delete: (id: number) => apiService.delete(`${BASE_URL}/${id}`),

  // Lấy các bản ghi theo user
  getByUser: (userId: number) =>
    apiService.get(`${BASE_URL}/user/${userId}`),

  // Lấy các bản ghi theo class
  getByClass: (classId: number) =>
    apiService.get(`${BASE_URL}/class/${classId}`),

  // Xóa toàn bộ quan hệ của 1 user (endpoint mới)
  deleteByUser: (userId: number) =>
    apiService.delete(`${BASE_URL}/user/${userId}`),
};

export default classUserService;
