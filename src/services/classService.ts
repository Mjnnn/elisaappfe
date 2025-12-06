// src/services/classService.ts
import axios from "axios";
import apiService from "./apiService";

const BASE_URL = "/classes";

const classService = {
  // Lấy tất cả class
  getAll: () => apiService.get(`${BASE_URL}`),

  // Lấy theo id
  getById: (id: number) => apiService.get(`${BASE_URL}/${id}`),

  // Tạo class mới
  create: (data: any) => apiService.post(`${BASE_URL}`, data),

  // Cập nhật class
  update: (id: number, data: any) =>
    apiService.put(`${BASE_URL}/${id}`, data),

  // Xóa class
  delete: (id: number) => apiService.delete(`${BASE_URL}/${id}`),

  // Lấy các class của 1 user
  getByUser: (userId: number) =>
    apiService.get(`${BASE_URL}/user/${userId}`),
};

export default classService;
