import axios from "axios";
import apiService from './apiService';

const BASE_URL = "/auth";

const authService = {
  // Đăng ký
  signUp: (data: {
    fullName: string;
    email: string;
    password: string;
  }) => apiService.post(`${BASE_URL}/signup`, data),

  // Đăng nhập
  login: async (payload: { email: string; password: string }) => {
    return await apiService.post(`${BASE_URL}/signin`, payload);
  },

  // Đăng nhập với Google
  googleSignIn: (data: { idToken: string }) =>
    apiService.post(`${BASE_URL}/google-signin`, data),

  // Quên mật khẩu – gửi email reset
  forgotPassword: (email: string) =>
    apiService.post(`${BASE_URL}/forgot-password`, { email }),

  // Reset mật khẩu
  resetPassword: (token: string, newPassword: string) =>
    apiService.post(`${BASE_URL}/reset-password`, {
      token,
      newPassword,
    }),

  // Test Google endpoint
  testGoogle: () => apiService.get(`${BASE_URL}/test-google`),
};

export default authService;
