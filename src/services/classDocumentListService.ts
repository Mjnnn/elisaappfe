// src/services/classDocumentListService.ts
import axios from "axios";
import apiService from "./apiService";

const BASE_URL = "/class-document-lists";

const classDocumentListService = {
  // Lấy tất cả mapping class–list
  getAll: () => apiService.get(`${BASE_URL}`),

  // Lấy theo id
  getById: (id: number) => apiService.get(`${BASE_URL}/${id}`),

  // Tạo mapping mới
  create: (data: any) => apiService.post(`${BASE_URL}`, data),

  // Xóa mapping theo id
  delete: (id: number) => apiService.delete(`${BASE_URL}/${id}`),

  // Lấy các list trong 1 class
  getByClassId: (classId: number) =>
    apiService.get(`${BASE_URL}/class/${classId}`),

  // Lấy các class chứa 1 list
  getByListId: (listId: number) =>
    apiService.get(`${BASE_URL}/list/${listId}`),
};

export default classDocumentListService;
