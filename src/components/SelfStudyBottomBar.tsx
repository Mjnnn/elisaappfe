import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

interface SelfStudyBottomBarProps {
  activeTab?: string;
  onTabPress?: (tabName: string) => void;
}

const SelfStudyBottomBar: React.FC<SelfStudyBottomBarProps> = ({
  activeTab = "Home",
  onTabPress = () => {},
}) => {
  const navigation = useNavigation();

  const tabs = [
    { name: "Home", icon: "home-outline" },
    { name: "Create", icon: "add-outline" },
    { name: "Library", icon: "folder-outline" },
    { name: "Logout", icon: "log-out-outline" },
  ];

  const handlePress = (tabName: string) => {
    if (tabName === "Logout") {
      navigation.navigate("Login" as never); // 👉 điều hướng sang màn Login
    } else {
      onTabPress(tabName);
    }
  };

  return (
    <View style={styles.bottomNav}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.name;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.navItem}
            onPress={() => handlePress(tab.name)}
          >
            <Ionicons
              name={tab.icon as any}
              size={tab.name === "Create" ? 26 : 22}
              color={isActive ? "#3B82F6" : "#333"}
            />
            <Text
              style={[
                styles.navText,
                { color: isActive ? "#3B82F6" : "#333" },
              ]}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
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
  navItem: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
  },
});
