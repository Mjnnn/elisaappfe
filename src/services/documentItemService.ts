// src/services/documentItemService.ts
import axios from "axios";
import apiService from "./apiService";

const BASE_URL = "/document-items";

const documentItemService = {
  // Lấy tất cả các mục từ vựng
  getAll: () => apiService.get(`${BASE_URL}`),

  // Lấy mục từ vựng theo ID
  getById: (wordId: number) => apiService.get(`${BASE_URL}/${wordId}`),

  // Lấy danh sách mục từ vựng theo ListID
  getByListId: (listId: number) =>
    apiService.get(`${BASE_URL}/list/${listId}`),

  // Tạo mới mục từ vựng
  create: (data: any) => apiService.post(`${BASE_URL}`, data),

  // Cập nhật mục từ vựng
  update: (wordId: number, data: any) =>
    apiService.put(`${BASE_URL}/${wordId}`, data),

  // Xóa mục từ vựng theo WordID
  delete: (wordId: number) => apiService.delete(`${BASE_URL}/${wordId}`),

  // Xóa toàn bộ mục từ vựng theo ListID
  deleteByListId: (listId: number) =>
    apiService.delete(`${BASE_URL}/list/${listId}`),

  // admin: lấy theo listId, có keyword + phân trang
  getByListPaged: (
    listId: number,
    keyword: string = "",
    page: number = 0,
    size: number = 10
  ) =>
    apiService.get(`${BASE_URL}/list/${listId}/paged`, {
      params: { keyword, page, size },
    }),
};

export default documentItemService;
