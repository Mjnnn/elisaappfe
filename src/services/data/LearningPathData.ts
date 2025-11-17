// Định nghĩa kiểu cho trạng thái của Node
export type NodeStatus = 'completed' | 'active' | 'locked' | 'unlocked';

// Định nghĩa kiểu cho loại Node (bài học, rương, thử thách)
export type NodeType = 'lesson' | 'treasure' | 'challenge';

// Định nghĩa kiểu cho một Node (Bài học/Cửa)
export type PathNode = {
    id: number;
    type: NodeType;
    status: NodeStatus;
    section: number; // 1: A1-A2, 2: B1-B2, 3: C1-C2
    title: string;
    subtitle: string; // Nội dung ngữ pháp/từ vựng chính
    levelTag: string; // Thẻ level cụ thể: A1, A2, B1, C1...
    level?: number; // Mới: Level của bài học (1-5)
};

// --- Dữ liệu Mẫu Chi tiết (45 Nodes) ---
export const learningPathData: PathNode[] = [
    // ===============================================
    // I. SECTION 1: CƠ BẢN (A1 - A2) - 15 NODES
    // ===============================================

    // --- A1: Căn bản ---
    { id: 1, type: 'lesson', status: 'completed', section: 1, title: 'Chào hỏi & Giới thiệu', subtitle: 'To Be, Đại từ', levelTag: 'A1', level: 1  },
    { id: 2, type: 'lesson', status: 'completed', section: 1, title: 'Gia đình & Bạn bè', subtitle: 'Tính từ sở hữu', levelTag: 'A1' , level: 1 },
    { id: 3, type: 'treasure', status: 'unlocked', section: 1, title: 'Rương A1/1', subtitle: 'Phần thưởng Từ vựng', levelTag: 'A1' ,level: 1 },
    { id: 4, type: 'lesson', status: 'completed', section: 1, title: 'Cuộc sống hàng ngày', subtitle: 'Hiện tại Đơn', levelTag: 'A1' ,level: 1 },
    { id: 5, type: 'lesson', status: 'active', section: 1, title: 'Địa điểm & Nơi chốn', subtitle: 'Giới từ vị trí', levelTag: 'A1' ,level: 1 }, 
    { id: 6, type: 'lesson', status: 'locked', section: 1, title: 'Mua sắm & Ăn uống', subtitle: 'Danh từ đếm/không đếm được', levelTag: 'A1',level: 1  },
    { id: 7, type: 'lesson', status: 'locked', section: 1, title: 'Thời gian & Lịch trình', subtitle: 'Hiện tại Tiếp diễn', levelTag: 'A1' ,level: 1 },
    
    // --- A2: Sơ cấp ---
    { id: 8, type: 'lesson', status: 'locked', section: 1, title: 'Kể chuyện Quá khứ', subtitle: 'Quá khứ Đơn', levelTag: 'A2' ,level: 1 },
    { id: 9, type: 'lesson', status: 'locked', section: 1, title: 'Kế hoạch Tương lai', subtitle: 'Will vs Be going to', levelTag: 'A2' ,level: 1 },
    { id: 10, type: 'treasure', status: 'locked', section: 1, title: 'Rương A2/1', subtitle: 'Phần thưởng Ngữ pháp', levelTag: 'A2',level: 1  },
    { id: 11, type: 'lesson', status: 'locked', section: 1, title: 'Sức khỏe & Cảm xúc', subtitle: 'Should/Had better', levelTag: 'A2',level: 1  },
    { id: 12, type: 'lesson', status: 'locked', section: 1, title: 'Miêu tả Đồ vật', subtitle: 'So sánh hơn/nhất', levelTag: 'A2' },
    { id: 13, type: 'lesson', status: 'locked', section: 1, title: 'Phương tiện & Di chuyển', subtitle: 'Giới từ chuyển động', levelTag: 'A2',level: 1 },
    { id: 14, type: 'lesson', status: 'locked', section: 1, title: 'Yêu cầu & Lời mời', subtitle: 'Câu hỏi đuôi', levelTag: 'A2',level: 1  },
    { id: 15, type: 'challenge', status: 'locked', section: 1, title: 'THỬ THÁCH A1-A2', subtitle: 'Đánh giá cấp độ', levelTag: 'A2',level: 1  },

    // ===============================================
    // II. SECTION 2: TRUNG CẤP (B1 - B2) - 15 NODES
    // ===============================================
    
    // --- B1: Trung cấp ---
    { id: 16, type: 'lesson', status: 'locked', section: 2, title: 'Quan điểm & Ý kiến', subtitle: 'Câu phức (Complex Sentences)', levelTag: 'B1',level: 1 },
    { id: 17, type: 'lesson', status: 'locked', section: 2, title: 'Môi trường & Thiên nhiên', subtitle: 'Bị động (Passive Voice)', levelTag: 'B1' ,level: 1 },
    { id: 18, type: 'treasure', status: 'locked', section: 2, title: 'Rương B1/1', subtitle: 'Thành ngữ thông dụng', levelTag: 'B1' ,level: 1 },
    { id: 19, type: 'lesson', status: 'locked', section: 2, title: 'Truyền thông & Công nghệ', subtitle: 'Hiện tại Hoàn thành', levelTag: 'B1',level: 1  },
    { id: 20, type: 'lesson', status: 'locked', section: 2, title: 'Du lịch & Văn hóa', subtitle: 'Mệnh đề quan hệ (Who, Which)', levelTag: 'B1',level: 1  }, 
    { id: 21, type: 'lesson', status: 'locked', section: 2, title: 'Giải quyết vấn đề', subtitle: 'Câu điều kiện loại 1 & 2', levelTag: 'B1' ,level: 1 },
    { id: 22, type: 'lesson', status: 'locked', section: 2, title: 'Kỹ năng mềm', subtitle: 'Gerunds & Infinitives', levelTag: 'B1' ,level: 1 },
    
    // --- B2: Trung cấp trên ---
    { id: 23, type: 'lesson', status: 'locked', section: 2, title: 'Tranh luận học thuật', subtitle: 'Quá khứ Hoàn thành', levelTag: 'B2',level: 1  },
    { id: 24, type: 'lesson', status: 'locked', section: 2, title: 'Kinh doanh & Tài chính', subtitle: 'Câu tường thuật', levelTag: 'B2',level: 1  },
    { id: 25, type: 'treasure', status: 'locked', section: 2, title: 'Rương B2/1', subtitle: 'Từ vựng chuyên ngành', levelTag: 'B2',level: 1  },
    { id: 26, type: 'lesson', status: 'locked', section: 2, title: 'Phân tích phim ảnh', subtitle: 'Mệnh đề quan hệ rút gọn', levelTag: 'B2' ,level: 1 },
    { id: 27, type: 'lesson', status: 'locked', section: 2, title: 'Viết báo cáo chuyên nghiệp', subtitle: 'Đảo ngữ (Inversions)', levelTag: 'B2' ,level: 1 },
    { id: 28, type: 'lesson', status: 'locked', section: 2, title: 'Thuyết trình hiệu quả', subtitle: 'Sử dụng Modal Verbs', levelTag: 'B2' ,level: 1 },
    { id: 29, type: 'lesson', status: 'locked', section: 2, title: 'Lịch sử & Xã hội', subtitle: 'Đại từ sở hữu', levelTag: 'B2' ,level: 1 },
    { id: 30, type: 'challenge', status: 'locked', section: 2, title: 'THỬ THÁCH B1-B2', subtitle: 'Đánh giá cấp độ', levelTag: 'B2',level: 1  },

    // ===============================================
    // III. SECTION 3: NÂNG CAO (C1 - C2) - 15 NODES
    // ===============================================

    // --- C1: Cao cấp ---
    { id: 31, type: 'lesson', status: 'locked', section: 3, title: 'Văn hóa học thuật', subtitle: 'Câu điều kiện hỗn hợp', levelTag: 'C1',level: 1  },
    { id: 32, type: 'lesson', status: 'locked', section: 3, title: 'Chính trị & Luật pháp', subtitle: 'Câu chẻ (Cleft Sentences)', levelTag: 'C1' ,level: 1 },
    { id: 33, type: 'treasure', status: 'locked', section: 3, title: 'Rương C1/1', subtitle: 'Thành ngữ nâng cao', levelTag: 'C1' },
    { id: 34, type: 'lesson', status: 'locked', section: 3, title: 'Nghệ thuật & Thiết kế', subtitle: 'Ngôn ngữ formal vs informal', levelTag: 'C1',level: 1  },
    { id: 35, type: 'lesson', status: 'locked', section: 3, title: 'Khoa học & Nghiên cứu', subtitle: 'Giả định (Subjunctive)', levelTag: 'C1',level: 1  }, 
    { id: 36, type: 'lesson', status: 'locked', section: 3, title: 'Phân tích triết học', subtitle: 'Liên từ phức tạp', levelTag: 'C1' ,level: 1 },
    { id: 37, type: 'lesson', status: 'locked', section: 3, title: 'Kỹ năng đàm phán', subtitle: 'Giảm mệnh đề (Reduction)', levelTag: 'C1',level: 1  },
    
    // --- C2: Thành thạo ---
    { id: 38, type: 'lesson', status: 'locked', section: 3, title: 'Sử dụng từ Hán Việt', subtitle: 'Phrasal Verbs nâng cao', levelTag: 'C2' ,level: 1 },
    { id: 39, type: 'lesson', status: 'locked', section: 3, title: 'Viết luận chuyên sâu', subtitle: 'Ngôn ngữ khách quan', levelTag: 'C2' ,level: 1 },
    { id: 40, type: 'treasure', status: 'locked', section: 3, title: 'Rương C2/1', subtitle: 'Kiểm tra độ trôi chảy', levelTag: 'C2' ,level: 1 },
    { id: 41, type: 'lesson', status: 'locked', section: 3, title: 'Ứng dụng tiếng lóng', subtitle: 'Slang và Colloquialisms', levelTag: 'C2',level: 1 },
    { id: 42, type: 'lesson', status: 'locked', section: 3, title: 'Phân tích ngữ nghĩa', subtitle: 'Tạo từ mới (Word Formation)', levelTag: 'C2' ,level: 1 },
    { id: 43, type: 'lesson', status: 'locked', section: 3, title: 'Đánh giá phê bình', subtitle: 'Tóm tắt & Tổng hợp', levelTag: 'C2' ,level: 1 },
    { id: 44, type: 'lesson', status: 'locked', section: 3, title: 'Đạt cấp độ C2', subtitle: 'Kiểm tra năng lực cuối cùng', levelTag: 'C2',level: 1  },
    { id: 45, type: 'challenge', status: 'locked', section: 3, title: 'THỬ THÁCH C1-C2', subtitle: 'Đánh giá cấp độ', levelTag: 'C2',level: 1  },
];
