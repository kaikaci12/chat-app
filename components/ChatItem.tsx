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

const ChatItem = ({ item, currentUser }: any) => {
  const router = useRouter();
  const [lastMessage, setLastMessage] = useState<any | null>(null);
  const [otherUser, setOtherUser] = useState<any | null>(null); // For private chat

  // Determine if this is a group or private chat
  const isGroupChat = item.type === "group";
  const roomId = item.roomId; // Since we're using chatRooms collection, item.roomId is directly available

  const openChatRoom = () => {
    router.push({ pathname: "/chatRoom", params: item });
  };

  // Get the other user's data for private chat
  const getOtherUser = async () => {
    if (item?.members?.length === 2) {
      const otherUserId = item?.members.find(
        (userId: string) => userId !== currentUser?.userId
      );
      if (otherUserId) {
        const userRef = doc(db, "users", otherUserId);
        const userSnapshot = await getDoc(userRef);
        setOtherUser(userSnapshot.data());
      }
    }
  };

  // Fetch the last message
  useEffect(() => {
    if (isGroupChat) {
      const q = query(
        collection(doc(db, "chatRooms", roomId), "messages"),
        orderBy("createdAt", "desc")
      );
      const unsub = onSnapshot(q, (snap) => {
        const allMessages = snap.docs.map((d) => d.data());
        setLastMessage(allMessages?.[0] || null);
      });
      return unsub;
    } else {
      getOtherUser(); // For private chat, fetch other user info
      const q = query(
        collection(doc(db, "chatRooms", roomId), "messages"),
        orderBy("createdAt", "desc")
      );
      const unsub = onSnapshot(q, (snap) => {
        const allMessages = snap.docs.map((d) => d.data());
        setLastMessage(allMessages?.[0] || null);
      });
      return unsub;
    }
  }, []);

  const renderLastMessage = () => {
    if (typeof lastMessage === "undefined") {
      return "Loading...";
    }
    if (lastMessage) {
      if (currentUser?.userId === lastMessage.userId) {
        return `You: ${lastMessage?.text}`;
      }
      return lastMessage?.text;
    } else {
      return "Say Hi 👋";
    }
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
            uri: isGroupChat
              ? item.groupImage || "default_group_image_url" // Default group image if none
              : otherUser?.profileUrl, // Private chat: use the other user's profile
          }}
          placeholder={require("../assets/images/placeholder.png")}
          contentFit="cover"
        />
        <View style={styles.textContainer}>
          <View style={styles.topRow}>
            {/* Render Username */}
            <Text style={styles.username}>
              {isGroupChat ? item.name : otherUser?.username || "Unknown User"}
            </Text>
          </View>
          <Text style={styles.preview} numberOfLines={1}>
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
});

export default ChatItem;
