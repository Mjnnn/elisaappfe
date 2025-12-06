// src/services/favoriteDocumentListService.ts
import axios from "axios";
import apiService from "./apiService";

const BASE_URL = "/favorite-lists";

const favoriteDocumentListService = {
  // Lấy tất cả favorite
  getAll: () => apiService.get(`${BASE_URL}`),

  // Lấy theo id
  getById: (id: number) => apiService.get(`${BASE_URL}/${id}`),

  // Tạo mới favorite
  create: (data: any) => apiService.post(`${BASE_URL}`, data),

  // Xóa favorite theo id
  delete: (id: number) => apiService.delete(`${BASE_URL}/${id}`),

  // Lấy theo user
  getByUser: (userId: number) =>
    apiService.get(`${BASE_URL}/user/${userId}`),

  // Lấy theo list
  getByList: (listId: number) =>
    apiService.get(`${BASE_URL}/list/${listId}`),

  // Kiểm tra 1 list đã được user favorite chưa
  checkFavorite: (userId: number, listId: number) =>
    apiService.get(`${BASE_URL}/user/${userId}/list/${listId}`),
};

export default favoriteDocumentListService;
