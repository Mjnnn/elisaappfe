export interface EnglishVocabularyTheoryResponse {
    vocabId: number;
    word: string;
    meaning: string;
    type: string;        // Loại từ (N, V, Adj, etc.)
    example: string | null;     // Câu ví dụ minh họa
    image: string | null; // URL hoặc đường dẫn hình ảnh (có thể là null)
    // Thêm các thuộc tính khác nếu cần
}

// Định nghĩa kiểu dữ liệu cho cấu trúc Phân trang của Spring Data
// Đây là kiểu dữ liệu mà Controller của bạn (ResponseEntity<Page<...>>) trả về
export interface PageResponse<T> {
    content: T[];                   // Mảng dữ liệu thực tế (dữ liệu từ vựng)
    totalElements: number;          // Tổng số phần tử trong toàn bộ dataset
    totalPages: number;             // Tổng số trang có thể có
    size: number;                   // Kích thước trang hiện tại
    number: number;                 // Số trang hiện tại (bắt đầu từ 0)
    numberOfElements: number;       // Số phần tử trong trang hiện tại
    last: boolean;                  // Có phải trang cuối cùng không
    first: boolean;                 // Có phải trang đầu tiên không
    empty: boolean;                 // Có rỗng không
    // Có thể bỏ qua các thuộc tính phức tạp như sort, pageable
}

export type VocabularyPageResponse = PageResponse<EnglishVocabularyTheoryResponse>;