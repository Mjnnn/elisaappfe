import axios from 'axios';
import { Platform } from 'react-native';

let hostname: string;
const BACKEND_PORT = 8080; 

if (__DEV__) {
    // Môi trường Phát triển (Development)
    if (Platform.OS === 'android') {
        // Android Emulator -> truy cập máy host qua IP đặc biệt
        hostname = '192.168.0.3'; 
    } else {
        // iOS Simulator -> có thể dùng localhost/127.0.0.1
        hostname = 'localhost'; 
    }
} else {
    // Môi trường Sản phẩm (Production)
    // Thay thế bằng domain thực tế của server (phải là HTTPS)
    hostname = 'api.your-production-domain.com'; 
}

const BASE_URL = `http${__DEV__ ? '' : 's'}://${hostname}:${BACKEND_PORT}/api`; 
// Lưu ý: Trong Production, bạn phải dùng HTTPS, nên BASE_URL nên bỏ port 8080 
// và dùng 'https' nếu bạn đã cấu hình Domain/Proxy Server.

const apiService = axios.create({
    baseURL: BASE_URL,
    timeout: 10000, // Thời gian chờ (10 giây)
    headers: {
        'Content-Type': 'application/json',
    },
});

// Bạn có thể thêm Interceptor (xử lý token, lỗi) ở đây

export default apiService;