export interface UserProgressResponse {
    progressId: number;
    lessonId: number;
    section: number; // Cấu trúc
    lastAccessed: string;   // Cách dùng thời gian ISO 8601
}