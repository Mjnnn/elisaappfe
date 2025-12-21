import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

interface Props {
  label: string;
  icon: IoniconName;
  isActive: boolean;
  onPress: () => void;
}

const SelfStudyBottomBarItem: React.FC<Props> = ({
  label,
  icon,
  isActive,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <Ionicons
        name={icon}
        size={label === "Create" ? 26 : 22}
        color={isActive ? "#3B82F6" : "#333"}
      />
      <Text
        style={[
          styles.navText,
          { color: isActive ? "#3B82F6" : "#333" },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default SelfStudyBottomBarItem;

const styles = StyleSheet.create({
  navItem: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
  },
});
