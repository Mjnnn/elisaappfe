export type SelfStudyTabName = "Home" | "Create" | "Class" | "Library" | "Logout";

export type SelfStudyTab = {
  name: SelfStudyTabName;      // key dùng cho logic + navigation
  label: string;              // text hiển thị tiếng Việt
  icon:
    | "home-outline"
    | "add-outline"
    | "people-outline"
    | "folder-outline"
    | "log-out-outline";
};

export const SELF_STUDY_TABS: SelfStudyTab[] = [
  { name: "Home",    label: "Trang chủ", icon: "home-outline" },
  { name: "Create",  label: "Tạo",       icon: "add-outline" },
  { name: "Class",   label: "Lớp học",   icon: "people-outline" },
  { name: "Library", label: "Thư viện",  icon: "folder-outline" },
  { name: "Logout",  label: "Đăng xuất", icon: "log-out-outline" },
];
