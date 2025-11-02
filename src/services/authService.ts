import axios from "axios";

const BASE_URL = "http://192.168.0.6:8080/api/auth";

const authService = {
  // Đăng ký
  signUp: (data: {
    fullName: string;
    email: string;
    password: string;
  }) => axios.post(`${BASE_URL}/signup`, data),

  // Đăng nhập
  login: async (payload: { email: string; password: string }) => {
    return await axios.post(`${BASE_URL}/signin`, payload);
  },

  // Đăng nhập với Google
  googleSignIn: (data: { idToken: string }) =>
    axios.post(`${BASE_URL}/google-signin`, data),

  // Quên mật khẩu – gửi email reset
  forgotPassword: (email: string) =>
    axios.post(`${BASE_URL}/forgot-password`, { email }),

  // Reset mật khẩu
  resetPassword: (token: string, newPassword: string) =>
    axios.post(`${BASE_URL}/reset-password`, {
      token,
      newPassword,
    }),

  // Test Google endpoint
  testGoogle: () => axios.get(`${BASE_URL}/test-google`),
};

export default authService;
