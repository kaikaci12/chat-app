import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const ChatItem = ({ item }: any) => {
  const username = item.username || "Unknown User";
  const lastMessage = item.lastMessage || "No message yet";

  const lastMessageTime = item.lastMessageTime || "Just now";
  const router = useRouter();
  const openChatRoom = () => {
    router.push({ pathname: "/chatRoom", params: item });
  };
  return (
    <TouchableOpacity
      onPress={openChatRoom}
      style={styles.container}
      activeOpacity={0.8}
    >
      <View style={styles.avatarContainer}>
        <Image
          style={styles.avatar}
          source={{ uri: item.profileUrl }}
          placeholder={require("../assets/images/placeholder.png")}
          contentFit="cover"
        />
        {item?.isOnline && <View style={styles.onlineIndicator} />}
      </View>

      {/* Chat content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.username} numberOfLines={1}>
            {username}
          </Text>
          <Text style={styles.time}>{lastMessageTime}</Text>
        </View>

        <View style={styles.messagePreview}>
          <Ionicons
            name={item.unreadCount ? "checkmark-done" : "checkmark"}
            size={14}
            color={item.unreadCount ? "#1B9C6E" : "#A0D6B4"}
            style={styles.icon}
          />
          <Text
            numberOfLines={1}
            style={[
              styles.messageText,
              item.unreadCount && styles.unreadMessage,
            ]}
          >
            {lastMessage}
          </Text>
        </View>
      </View>

      {/* Unread count badge */}
      {item.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadCount}>{item.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,

    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#C8E6C9",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#66BB6A",
    borderWidth: 2,
    borderColor: "#E8F5E9",
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  username: {
    fontWeight: "600",
    fontSize: 16,
    color: "#1B5E20",
    maxWidth: "70%",
  },
  time: {
    color: "#81C784",
    fontSize: 12,
  },
  messagePreview: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 6,
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    color: "#4CAF50",
  },
  unreadMessage: {
    color: "#2E7D32",
    fontWeight: "500",
  },
  unreadBadge: {
    backgroundColor: "#43A047",
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default ChatItem;
