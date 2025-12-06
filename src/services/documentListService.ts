// src/services/documentListService.ts
import axios from "axios";
import apiService from "./apiService";

const BASE_URL = "/document-lists";

const documentListService = {
  // 1) Lấy tất cả các bộ public (is_public = 0) – có phân trang
  getPublicLists: (page: number = 0, size: number = 8) =>
    apiService.get(`${BASE_URL}/public`, {
      params: { page, size },
    }),

  // 3) Lấy grouped theo type, mỗi type tối đa 4 items
  getGroupedByType: () =>
    apiService.get(`${BASE_URL}/grouped`),

  // 4) Lấy theo type, filter isPublic (mặc định 0 = public)
  getByTypeAndPublic: (type: string, isPublic: number = 0) =>
    apiService.get(`${BASE_URL}/type/${type}`, {
      params: { isPublic },
    }),

  // 5) Lấy theo userId (tất cả bộ của user)
  getByUser: (userId: number) =>
    apiService.get(`${BASE_URL}/user/${userId}`),

  // 6) Lấy chi tiết theo id
  getById: (id: number) =>
    apiService.get(`${BASE_URL}/${id}`),

  // 7) Tạo mới DocumentList
  createDocumentList: (data: any) =>
    apiService.post(`${BASE_URL}`, data),

  // 8) Cập nhật DocumentList theo id
  updateDocumentList: (id: number, data: any) =>
    apiService.put(`${BASE_URL}/${id}`, data),

  // 9) Xóa DocumentList theo id
  deleteDocumentList: (id: number) =>
    apiService.delete(`${BASE_URL}/${id}`),

    // 10) Tìm kiếm theo title hoặc type (public) – 1 ô input
    searchPublicByTitleOrType: (
        keyword: string,
        page: number = 0,
        size: number = 10
      ) =>
        apiService.get(`${BASE_URL}/search`, {
          params: { keyword, page, size },
        }),

  // admin: Tìm kiếm tất cả tài liệu public theo title / author (paged)
  searchPublicPaged: (
    keyword: string = "",
    page: number = 0,
    size: number = 10
  ) =>
    apiService.get(`${BASE_URL}/public/paged`, {
      params: { keyword, page, size },
    }),

  // admin: Lấy tất cả tài liệu của user (paged)
  getByUserPaged: (
    userId: number,
    page: number = 0,
    size: number = 10
  ) =>
    apiService.get(`${BASE_URL}/user/${userId}/paged`, {
      params: { page, size },
    }),

  // 11) Đảo ngược trạng thái công khai (visibility)
  toggleVisibility: (id: number) =>
    apiService.patch(`${BASE_URL}/${id}/visibility`),

  // 12) Lấy tất cả DocumentList mà user này đã đánh dấu favorite
  getFavoritedByUser: (userId: number) =>
    apiService.get(`${BASE_URL}/favorited/${userId}`),

  // 13) Lấy các bộ flashcard của user mà chưa gán vào lớp nào
  getUnassignedByUser: (userId: number) =>
    apiService.get(`${BASE_URL}/user/${userId}/unassigned`),
};

export default documentListService;
