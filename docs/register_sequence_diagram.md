# Sơ Đồ Sequence - Luồng Đăng Ký (Register Flow)

## Tổng quan

Sơ đồ này mô tả luồng đăng ký tài khoản mới trong ứng dụng **Elisa**.

---

## Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 Người dùng
    participant UI as 📱 RegisterScreen
    participant Auth as 🔐 authService
    participant API as 🌐 apiService (Axios)
    participant Backend as 🖥️ Backend Server
    participant Storage as 💾 AsyncStorage
    participant Notify as 🔔 notificationService
    participant Progress as 📊 userProgressService
    participant XP as ⭐ userXPService

    Note over User,XP: LUỒNG ĐĂNG KÝ TÀI KHOẢN MỚI

    %% Bước 1: Nhập thông tin
    User->>UI: Nhập thông tin đăng ký
    Note right of UI: fullName, email,<br/>password, confirmPassword

    User->>UI: Nhấn nút "ĐĂNG KÝ"

    %% Bước 2: Validate dữ liệu
    UI->>UI: Kiểm tra thông tin hợp lệ
    alt Thiếu thông tin
        UI-->>User: ⚠️ Alert "Vui lòng điền đầy đủ thông tin"
    else Password không khớp
        UI-->>User: ⚠️ Alert "Mật khẩu không khớp"
    else Hợp lệ
        Note over UI: setLoading(true)

        %% Bước 3: Gọi API đăng ký
        UI->>Auth: signUp({fullName, email, password})
        Auth->>API: POST /auth/signup
        API->>Backend: HTTP Request

        alt Đăng ký thành công
            Backend-->>API: ✅ {userId, ...data}
            API-->>Auth: Response
            Auth-->>UI: response.data

            %% Bước 4: Lưu thông tin local
            UI->>Storage: setItem("userId", newUserId)
            UI->>Storage: setItem("fullName", fullName)

            %% Bước 5: Tạo Notification chào mừng
            UI->>Notify: createNotification(welcomePayload)
            Note right of Notify: title: "Chào mừng đến với Elisa!"<br/>type: "welcome"
            Notify->>API: POST /english-notification/create
            API->>Backend: HTTP Request
            Backend-->>API: ✅ Notification created
            API-->>Notify: Response
            Notify-->>UI: Success

            %% Bước 6: Tạo User Progress
            UI->>Progress: createUserProgress(newUserId)
            Progress->>API: POST /english-user-progress/create/{userId}
            API->>Backend: HTTP Request
            Backend-->>API: ✅ UserProgress created
            API-->>Progress: Response
            Progress-->>UI: Success

            %% Bước 7: Tạo Notification mở khóa level
            UI->>Notify: createNotification(levelPayload)
            Note right of Notify: title: "Mở khoá lộ trình!"<br/>type: "level"
            Notify->>API: POST /english-notification/create
            API->>Backend: HTTP Request
            Backend-->>API: ✅ Notification created
            API-->>Notify: Response
            Notify-->>UI: Success

            %% Bước 8: Tạo User XP
            UI->>XP: createUserXP(newUserId)
            XP->>API: POST /english-user-xp/create/{userId}
            API->>Backend: HTTP Request
            Backend-->>API: ✅ UserXP created
            API-->>XP: Response
            XP-->>UI: Success

            %% Bước 9: Hoàn thành
            Note over UI: setLoading(false)
            UI-->>User: ✅ Alert "Đăng ký thành công!"
            UI->>UI: navigation.navigate('CourseSelection')

        else Đăng ký thất bại
            Backend-->>API: ❌ Error response
            API-->>Auth: Error
            Auth-->>UI: Error (catch block)
            Note over UI: setLoading(false)
            UI-->>User: ⚠️ Alert "Đăng ký thất bại"
        end
    end
```

---

## Chi Tiết Các Bước

### 1️⃣ Nhập Thông Tin
Người dùng nhập các thông tin:
- **Họ và Tên** (`fullName`)
- **Email** (`email`)
- **Mật khẩu** (`password`)
- **Xác nhận mật khẩu** (`confirmPassword`)

### 2️⃣ Validate Dữ Liệu (Client-side)
Kiểm tra:
- Tất cả các trường không được để trống
- `password` và `confirmPassword` phải khớp

### 3️⃣ Gọi API Đăng Ký
- **Endpoint**: `POST /auth/signup`
- **Payload**: `{fullName, email, password}`

### 4️⃣ Lưu Thông Tin Local
Lưu vào `AsyncStorage`:
- `userId`: ID người dùng mới
- `fullName`: Họ tên người dùng

### 5️⃣ Tạo Notification Chào Mừng
- **Endpoint**: `POST /english-notification/create`
- **Type**: `"welcome"`

### 6️⃣ Tạo User Progress
- **Endpoint**: `POST /english-user-progress/create/{userId}`
- Khởi tạo tiến độ học tập cho user mới

### 7️⃣ Tạo Notification Mở Khóa Level
- **Type**: `"level"`
- Thông báo người dùng bắt đầu cấp độ "Tân Thủ"

### 8️⃣ Tạo User XP
- **Endpoint**: `POST /english-user-xp/create/{userId}`
- Khởi tạo điểm kinh nghiệm cho user mới

### 9️⃣ Điều Hướng
- Chuyển đến màn hình `CourseSelection` sau khi đăng ký thành công

---

## API Endpoints Liên Quan

| Service | Endpoint | Method | Mô tả |
|---------|----------|--------|-------|
| Auth | `/auth/signup` | POST | Đăng ký tài khoản |
| Notification | `/english-notification/create` | POST | Tạo thông báo |
| UserProgress | `/english-user-progress/create/{userId}` | POST | Tạo tiến độ user |
| UserXP | `/english-user-xp/create/{userId}` | POST | Tạo XP user |

---

## Files Liên Quan

| File | Đường dẫn | Mô tả |
|------|-----------|-------|
| RegisterScreen | `src/screens/AuthScreen/RegisterScreen.tsx` | Màn hình đăng ký |
| authService | `src/services/authService.ts` | Service xác thực |
| notificationService | `src/services/notificationService.ts` | Service thông báo |
| userProgressService | `src/services/userProgressService.ts` | Service tiến độ |
| userXPService | `src/services/userXPService.ts` | Service XP |
| apiService | `src/services/apiService.ts` | API service cơ sở |

---

## Ghi Chú

- Tất cả các request đều đi qua `apiService` (Axios) với timeout 10 giây
- Base URL: `http://localhost:8080/api` (dev) hoặc `https://api.your-production-domain.com/api` (prod)
- Dữ liệu được gửi dưới dạng JSON (`Content-Type: application/json`)

---

*Tài liệu được tạo tự động vào ngày 22/12/2025*
