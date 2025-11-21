export type Ranking = {
    achievementID: number;
    min_xp: number;
    max_xp: number;
    title: string;
    icon_url: string;
}

export const rankingData: Ranking[] = [
    { achievementID: 1, min_xp: 0, max_xp: 899, title: 'Tân Thủ' , icon_url: 'https://res.cloudinary.com/dj4hbfwj9/image/upload/v1763707656/rank-TanThu.png'},
    { achievementID: 2, min_xp: 900, max_xp: 2099, title: 'Tập Sự' , icon_url: 'https://res.cloudinary.com/dj4hbfwj9/image/upload/v1763707656/rank-TapSu.png'},
    { achievementID: 3, min_xp: 2100, max_xp: 3599, title: 'Thám Hiểm', icon_url: 'https://res.cloudinary.com/dj4hbfwj9/image/upload/v1763707656/rank-ThamHiem.png' },
    { achievementID: 4, min_xp: 3600, max_xp: 5399, title: 'Chiến Binh', icon_url: 'https://res.cloudinary.com/dj4hbfwj9/image/upload/v1763707656/rank-ChienBinh.png' },
    { achievementID: 5, min_xp: 5400, max_xp: 7499, title: 'Tinh Anh' , icon_url: 'https://res.cloudinary.com/dj4hbfwj9/image/upload/v1763707656/rank-TinhAnh.png' },
    { achievementID: 6, min_xp: 7500, max_xp: 10199, title: 'Bậc Thầy' , icon_url: 'https://res.cloudinary.com/dj4hbfwj9/image/upload/v1763707656/rank-BacThay.png' },
    { achievementID: 7, min_xp: 10200, max_xp: 13499, title: 'Lão Làng' , icon_url: 'https://res.cloudinary.com/dj4hbfwj9/image/upload/v1763707656/rank-LaoLang.png' },
    { achievementID: 8, min_xp: 13500, max_xp: 99999, title: 'Huyền Thoại', icon_url: 'https://res.cloudinary.com/dj4hbfwj9/image/upload/v1763707656/rank-HuyenThoai.png' },
];

export const getAchievementID = (xp: number): number => {
    // Tìm rank tương ứng
    const rank = rankingData.find((r) => xp >= r.min_xp && xp <= r.max_xp);

    // Nếu tìm thấy: trả về ID
    if (rank) {
        return rank.achievementID;
    }

    // Nếu không tìm thấy (do XP quá cao vượt mốc 99999): Trả về cấp cuối cùng (Huyền Thoại)
    return rankingData[rankingData.length - 1].achievementID;
};