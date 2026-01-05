// src/services/documentReportService.ts
import apiService from "./apiService";

const BASE_URL = "/document-reports";

/**
 * (Optional) Types để bạn dùng cho đúng dữ liệu
 */
export type DocumentReportRequest = {
  userId: number;     // ID người báo cáo
  listId: number;     // ID tài liệu bị báo cáo
  reason: string;     // Lý do báo cáo
};

export type DocumentReportResponse = {
  reportId: number;
  userId: number;
  userName?: string;
  fullName?: string;
  listId: number;
  listTitle?: string;
  reason: string;
  reportDate?: string; // LocalDateTime -> FE thường nhận string ISO
};

const documentReportService = {
  // =========================
  // Non-paginated endpoints
  // =========================

  // GET /api/document-reports
  getAllReports: () =>
    apiService.get<DocumentReportResponse[]>(`${BASE_URL}`),

  // GET /api/document-reports/{id}
  getReportById: (id: number) =>
    apiService.get<DocumentReportResponse>(`${BASE_URL}/${id}`),

  // POST /api/document-reports
  createReport: (data: DocumentReportRequest) =>
    apiService.post<DocumentReportResponse>(`${BASE_URL}`, data),

  // DELETE /api/document-reports/{id}
  deleteReport: (id: number) =>
    apiService.delete<void>(`${BASE_URL}/${id}`),

  // GET /api/document-reports/user/{userId}
  getReportsByUserId: (userId: number) =>
    apiService.get<DocumentReportResponse[]>(`${BASE_URL}/user/${userId}`),

  // GET /api/document-reports/document/{listId}
  getReportsByListId: (listId: number) =>
    apiService.get<DocumentReportResponse[]>(`${BASE_URL}/document/${listId}`),

  // =========================
  // Paginated endpoints
  // =========================

  // GET /api/document-reports/paged?page=&size=
  getPagedReports: (page: number = 0, size: number = 10) =>
    apiService.get(`${BASE_URL}/paged`, { params: { page, size } }),

  // GET /api/document-reports/user/{userId}/paged?page=&size=
  getPagedReportsByUser: (userId: number, page: number = 0, size: number = 10) =>
    apiService.get(`${BASE_URL}/user/${userId}/paged`, { params: { page, size } }),

  // GET /api/document-reports/document/{listId}/paged?page=&size=
  getPagedReportsByDocument: (listId: number, page: number = 0, size: number = 10) =>
    apiService.get(`${BASE_URL}/document/${listId}/paged`, { params: { page, size } }),
};

export default documentReportService;
