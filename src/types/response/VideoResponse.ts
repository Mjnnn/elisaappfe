export interface VideoSummaryResponse {
  id: number;
  title: string;
  youtubeId: string;
  level: string;
  type: string;
  thumbnailUrl: string;
}

export interface SubtitleResponse {
  id: number;
  startTime: number; // Mili-giây (VD: 1500)
  endTime: number;   // Mili-giây
  content: string;   // Nội dung câu thoại
}

export interface EnglishVideoResponse {
  id: number;            // ID video trong DB
  youtubeId: string;     // ID Youtube (VD: dQw4w9WgXcQ)
  title: string;         // Tiêu đề video
  level: string;         // Có thể đổi thành Union Type nếu có các level cố định (VD: 'Basic' | 'Advanced')
  type: string;
  subtitles: SubtitleResponse[]; // Danh sách sub đã sort
}