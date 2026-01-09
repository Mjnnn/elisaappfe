import React from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import SelfStudyBottomBarItem from "../screens/selfstudy/SelfStudyBottomBarItem";
import { SELF_STUDY_TABS, SelfStudyTabName } from "../screens/selfstudy/selfStudyBottomTabs";

interface SelfStudyBottomBarProps {
  activeTab?: SelfStudyTabName;
  onTabPress?: (tabName: SelfStudyTabName) => void;
}

const SelfStudyBottomBar: React.FC<SelfStudyBottomBarProps> = ({
  activeTab = "Home",
  onTabPress = () => { },
}) => {
  const navigation = useNavigation<any>();

  const handlePress = (tabName: SelfStudyTabName) => {
    if (tabName === "Logout") {
      Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn thoát?", [
        { text: "Ở lại", style: "cancel" },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.clear();
            navigation.getParent()?.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "Login" }],
              })
            );
            navigation.navigate("Login" as never);
          },
        },
      ]);
      return;
    }

    if (tabName === "Library") {
      navigation.navigate("LibraryScreen" as never);
      return;
    }

    if (tabName === "Create") {
      navigation.navigate("CreateDocumentList" as never);
      return;
    }

    if (tabName === "Home") {
      navigation.navigate("SelfStudyScreen" as never);
      return;
    }

    if (tabName === "Class") {
      navigation.navigate("ClassScreen" as never);
      return;
    }

    onTabPress(tabName);
  };

  return (
    <View style={styles.bottomNav}>
      {SELF_STUDY_TABS.map((tab) => {
        const isActive = activeTab === tab.name;

        return (
          <SelfStudyBottomBarItem
            key={tab.name}
            label={tab.label}              // ✅ hiển thị tiếng Việt ở đây
            icon={tab.icon as any}
            isActive={isActive}
            onPress={() => handlePress(tab.name)}
          />
        );
      })}
    </View>
  );
};

export default SelfStudyBottomBar;

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
});
