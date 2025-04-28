import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import { UserType } from "@/app/types";
import { Image } from "expo-image";
interface UserUIProps {
  item: UserType;
}

const UserUI = ({ item }: UserUIProps) => {
  return (
    <View style={styles.container}>
      <Image
        placeholder={require("@/assets/images/placeholder.png")}
        source={{ uri: item.profileUrl }}
        style={styles.avatar}
      />
      <View style={styles.info}>
        <Text style={styles.username}>{item.username}</Text>
      </View>
    </View>
  );
};

export default UserUI;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    marginVertical: 6,
    marginHorizontal: 12,
    borderRadius: 12,

    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3, // Android shadow
    marginBottom: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ddd",
  },
  info: {
    marginLeft: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  userId: {
    fontSize: 14,
    color: "#666",
  },
});
