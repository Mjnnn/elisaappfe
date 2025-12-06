// Định nghĩa kiểu cho trạng thái của Node
export type NodeStatus = 'completed' | 'active' | 'locked' | 'unlocked';

// Định nghĩa kiểu cho loại Node (bài học, rương, thử thách)
export type NodeType = 'lesson' | 'treasure' | 'challenge';

// Định nghĩa kiểu cho một Node (Bài học/Cửa)
export type PathNode = {
    id: number;
    type: NodeType;
    title: string;
    levelTag: string; // Thẻ level cụ thể: A1, A2, B1, C1...
    level?: number; // Mới: Level của bài học (1-5)
};

export const getLessonTitleById = (id: number): string => {
    const foundNode = learningPathData.find((node) => node.id === id);
    return foundNode ? foundNode.title : `Bài học ${id}`;
};

// --- Dữ liệu Mẫu Chi tiết (45 Nodes) ---
export const learningPathData: PathNode[] = [
    // ===============================================
    // I. SECTION 1: CƠ BẢN (A1 - A2) - 15 NODES
    // ===============================================

    // --- A1: Căn bản ---
    { id: 1, type: 'lesson', title: 'Chào hỏi & Giới thiệu', levelTag: 'A1', level: 1  },
    { id: 2, type: 'lesson', title: 'Gia đình & Bạn bè', levelTag: 'A1' , level: 1 },
    { id: 3, type: 'treasure', title: 'Rương A1', levelTag: 'A1' ,level: 1 },
    { id: 4, type: 'lesson', title: 'Cuộc sống hàng ngày', levelTag: 'A1' ,level: 1 },
    { id: 5, type: 'lesson', title: 'Kể chuyện Quá khứ', levelTag: 'A1' ,level: 3 }, 
    { id: 6, type: 'lesson', title: 'Mua sắm & Ăn uống', levelTag: 'A1',level: 1  },
    { id: 7, type: 'lesson', title: 'Thời gian & Lịch trình', levelTag: 'A1' ,level: 1 },
    
    // --- A2: Sơ cấp ---
    { id: 8, type: 'lesson', title: 'Địa điểm & Nơi chốn', levelTag: 'A2' ,level: 1 },
    { id: 9, type: 'lesson', title: 'Kế hoạch Tương lai', levelTag: 'A2' ,level: 3 },
    { id: 10, type: 'treasure', title: 'Rương A2', levelTag: 'A2',level: 1  },
    { id: 11, type: 'lesson', title: 'Sức khỏe & Cảm xúc', levelTag: 'A2',level: 1  },
    { id: 12, type: 'lesson', title: 'Miêu tả Đồ vật', levelTag: 'A2' },
    { id: 13, type: 'lesson', title: 'Phương tiện & Di chuyển', levelTag: 'A2',level: 1 },
    { id: 14, type: 'lesson', title: 'Yêu cầu & Lời mời', levelTag: 'A2',level: 3  },
    { id: 15, type: 'challenge', title: 'THỬ THÁCH A1-A2',  levelTag: 'A2',level: 1  },

    // ===============================================
    // II. SECTION 2: TRUNG CẤP (B1 - B2) - 15 NODES
    // ===============================================
    
    // --- B1: Trung cấp ---
    { id: 16, type: 'lesson', title: 'Quan điểm & Ý kiến', levelTag: 'B1',level: 1 },
    { id: 17, type: 'lesson', title: 'Môi trường & Thiên nhiên', levelTag: 'B1' ,level: 1 },
    { id: 18, type: 'treasure', title: 'Rương B1', levelTag: 'B1' ,level: 1 },
    { id: 19, type: 'lesson', title: 'Truyền thông & Công nghệ', levelTag: 'B1',level: 1  },
    { id: 20, type: 'lesson', title: 'Du lịch & Văn hóa', levelTag: 'B1',level: 1  }, 
    { id: 21, type: 'lesson', title: 'Giải quyết vấn đề', levelTag: 'B1' ,level: 1 },
    { id: 22, type: 'lesson', title: 'Kỹ năng mềm', levelTag: 'B1' ,level: 3 },
    
    // --- B2: Trung cấp trên ---
    { id: 23, type: 'lesson', title: 'Tranh luận học thuật', levelTag: 'B2',level: 1  },
    { id: 24, type: 'lesson', title: 'Kinh doanh & Tài chính', levelTag: 'B2',level: 1  },
    { id: 25, type: 'treasure', title: 'Rương B2', levelTag: 'B2',level: 1  },
    { id: 26, type: 'lesson', title: 'Phân tích phim ảnh', levelTag: 'B2' ,level: 1 },
    { id: 27, type: 'lesson', title: 'Viết báo cáo chuyên nghiệp', levelTag: 'B2' ,level: 3 },
    { id: 28, type: 'lesson', title: 'Thuyết trình hiệu quả', levelTag: 'B2' ,level: 1 },
    { id: 29, type: 'lesson', title: 'Lịch sử & Xã hội', levelTag: 'B2' ,level: 1 },
    { id: 30, type: 'challenge', title: 'THỬ THÁCH B1-B2', levelTag: 'B2',level: 1  },

    // ===============================================
    // III. SECTION 3: NÂNG CAO (C1 - C2) - 15 NODES
    // ===============================================

    // --- C1: Cao cấp ---
    { id: 31, type: 'lesson', title: 'Văn hóa học thuật', levelTag: 'C1',level: 1  },
    { id: 32, type: 'lesson', title: 'Chính trị & Luật pháp', levelTag: 'C1' ,level: 1 },
    { id: 33, type: 'treasure', title: 'Rương C1', levelTag: 'C1' },
    { id: 34, type: 'lesson', title: 'Phân tích triết học', levelTag: 'C1',level: 3  },
    { id: 35, type: 'lesson', title: 'Khoa học & Nghiên cứu', levelTag: 'C1',level: 1  }, 
    { id: 36, type: 'lesson', title: 'Nghệ thuật & Thiết kế', levelTag: 'C1' ,level: 1 },
    { id: 37, type: 'lesson', title: 'Kỹ năng đàm phán', levelTag: 'C1',level: 1  },
    
    // --- C2: Thành thạo ---
    { id: 38, type: 'lesson', title: 'Sử dụng từ Hán Việt', levelTag: 'C2' ,level: 3 },
    { id: 39, type: 'lesson', title: 'Viết luận chuyên sâu', levelTag: 'C2' ,level: 1 },
    { id: 40, type: 'treasure', title: 'Rương C2', levelTag: 'C2' ,level: 1 },
    { id: 41, type: 'lesson', title: 'Ứng dụng tiếng lóng', levelTag: 'C2',level: 1 },
    { id: 42, type: 'lesson', title: 'Phân tích ngữ nghĩa', levelTag: 'C2' ,level: 3 },
    { id: 43, type: 'lesson', title: 'Đánh giá phê bình', levelTag: 'C2' ,level: 1 },
    { id: 44, type: 'lesson', title: 'Đạt cấp độ C2', levelTag: 'C2',level: 1  },
    { id: 45, type: 'challenge', title: 'THỬ THÁCH C1-C2', levelTag: 'C2',level: 1  },
];
