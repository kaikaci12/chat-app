import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

import {
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
  getDoc,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { ChatRoomType, UserType } from "@/app/types";
interface ChatItemProps {
  item: ChatRoomType;
  currentUser: UserType;
}
const ChatItem = ({ item, currentUser }: ChatItemProps) => {
  const router = useRouter();
  const lastMessage = item.lastMessage;

  const isGroupChat = item.type === "group";

  const openChatRoom = () => {
    router.push({
      pathname: "/chatRoom",
      params: {
        chatRoomId: item.chatRoomId,
        name: item.name,
        imageUrl: item.imageUrl,
        type: item.type,
        members: JSON.stringify(item.members),

        createdBy: item.createdBy,
      },
    });
  };

  const renderLastMessage = () => {
    if (typeof lastMessage == "undefined") {
      return "Loading...";
    }
    if (!lastMessage || !lastMessage.text) {
      return "Say Hi 👋";
    }

    if (currentUser?.userId === lastMessage.userId) {
      return `You: ${lastMessage.text}`;
    }

    if (isGroupChat && lastMessage.senderName) {
      return `${lastMessage.senderName}: ${lastMessage.text}`;
    }

    return lastMessage.text;
  };
  const isUnseen = () => {
    if (!lastMessage?.seenBy) return false;
    return !lastMessage.seenBy.includes(currentUser?.userId);
  };

  const renderTime = () => {
    if (lastMessage) {
      const date = new Date(lastMessage?.createdAt?.seconds * 1000);
      const day = date.getDate();
      const month = date.toLocaleString("default", { month: "short" });
      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${day} ${month}, ${hours}:${minutes}`;
    }
  };

  return (
    <TouchableOpacity
      onPress={openChatRoom}
      style={styles.container}
      activeOpacity={0.85}
    >
      <View style={styles.row}>
        {/* Render Avatar */}
        <Image
          style={styles.avatar}
          source={{
            uri: item.imageUrl,
          }}
          placeholder={require("../assets/images/placeholder.png")}
          contentFit="cover"
        />
        <View style={styles.textContainer}>
          <View style={styles.topRow}>
            {/* Render Username */}
            <Text style={styles.username}>{item.name}</Text>
          </View>
          <Text
            style={[styles.preview, isUnseen() && styles.unseenPreview]}
            numberOfLines={1}
          >
            {renderLastMessage()?.length > 20
              ? `${renderLastMessage().substring(0, 30)}...`
              : renderLastMessage()}
          </Text>
        </View>
      </View>
      <Text style={styles.time} numberOfLines={1}>
        {renderTime()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e0f2f1",
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 14,
  },
  textContainer: {
    justifyContent: "center",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1B5E20",
  },
  time: {
    fontSize: 12,
    color: "#999",
    marginLeft: 10,
  },
  preview: {
    fontSize: 14,
    color: "#555",
  },
  unseenPreview: {
    color: "#000", // pure black
    fontWeight: "bold", // bold
  },
});

export default ChatItem;
