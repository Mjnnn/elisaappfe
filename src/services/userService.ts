// src/services/userService.ts
import axios from "axios";

const BASE_URL = "http://192.168.0.6:8080/api/users";

const userService = {

  // Lấy danh sách user có role = "user" (phân trang)
  getAllLearners: (page: number = 0, size: number = 5) =>
    axios.get(`${BASE_URL}/learners`, { params: { page, size } }),

  // Search learners
  searchLearners: (keyword: string, page: number = 0, size: number = 5) =>
    axios.get(`${BASE_URL}/learners/search`, {
      params: { keyword, page, size },
    }),

  // Lấy user theo id
  getUserById: (id: number) => axios.get(`${BASE_URL}/${id}`),

  // Tạo mới user
  createUser: (data: any) => axios.post(BASE_URL, data),

  // Cập nhật user theo id
  updateUser: (id: number, data: any) => axios.put(`${BASE_URL}/${id}`, data),

  // Xóa user
  deleteUser: (id: number) => axios.delete(`${BASE_URL}/${id}`),

  // Đóng băng user
  freezeUser: (id: number) => axios.post(`${BASE_URL}/${id}/freeze`),

  // Mở băng user
  unfreezeUser: (id: number) => axios.post(`${BASE_URL}/${id}/unfreeze`),

  // Lấy trạng thái user
  getUserStatus: (id: number) => axios.get(`${BASE_URL}/${id}/status`),

  // Đóng băng hàng loạt
  bulkFreezeUsers: (userIds: number[]) =>
    axios.post(`${BASE_URL}/bulk-freeze`, { userIds }),

  // Lấy user theo email
  getByEmail: (email: string) => axios.get(`${BASE_URL}/email/${email}`),

  // Đổi mật khẩu
  changePassword: (data: { email: string; oldPassword: string; newPassword: string }) =>
    axios.post(`${BASE_URL}/change-password`, data),

  // Test endpoint cho admin
  testAdminEndpoint: () => axios.get(`${BASE_URL}/admin/test`),
};

export default userService;
