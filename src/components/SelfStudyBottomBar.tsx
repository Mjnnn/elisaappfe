import React from "react";
import { View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

import SelfStudyBottomBarItem from "../screens/selfstudy/SelfStudyBottomBarItem";
import { SELF_STUDY_TABS } from "../screens/selfstudy/selfStudyBottomTabs";

interface SelfStudyBottomBarProps {
  activeTab?: string;
  onTabPress?: (tabName: string) => void;
}

const SelfStudyBottomBar: React.FC<SelfStudyBottomBarProps> = ({
  activeTab = "Home",
  onTabPress = () => {},
}) => {
  const navigation = useNavigation<any>();

  const handlePress = (tabName: string) => {
    if (tabName === "Logout") {
      navigation.navigate("Login" as never);
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
      navigation.navigate("ClassScreen");
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
            label={tab.name}
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
