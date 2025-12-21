export type SelfStudyTab = {
    name: "Home" | "Create" | "Class" | "Library" | "Logout";
    icon:
      | "home-outline"
      | "add-outline"
      | "people-outline"
      | "folder-outline"
      | "log-out-outline";
  };
  
  export const SELF_STUDY_TABS: SelfStudyTab[] = [
    { name: "Home", icon: "home-outline" },
    { name: "Create", icon: "add-outline" },
    { name: "Class", icon: "people-outline" },
    { name: "Library", icon: "folder-outline" },
    { name: "Logout", icon: "log-out-outline" },
  ];
  