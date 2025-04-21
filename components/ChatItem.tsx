import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { getRoomId } from "@/utils/common";
import {
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";

const ChatItem = ({ item, currentUser }: any) => {
  const username = item.username || "Unknown User";
  const router = useRouter();

  const [lastMessage, setLastMessage] = useState<any | null>(null);

  const openChatRoom = () => {
    router.push({ pathname: "/chatRoom", params: item });
  };

  useEffect(() => {
    const roomId = getRoomId(currentUser?.userId, item?.userId);
    const q = query(
      collection(doc(db, "rooms", roomId), "messages"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const allMessages = snap.docs.map((d) => d.data());
      setLastMessage(allMessages?.[0] || null);
    });

    return unsub;
  }, []);
  const renderLastMessage = () => {
    if (typeof lastMessage === "undefined") {
      return "Loading...";
    }
    if (lastMessage) {
      if (currentUser?.userId == lastMessage.userId) {
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
      return `${date.getHours()}:${date.getMinutes()}`;
    } else {
      return "Time";
    }
  };
  return (
    <TouchableOpacity
      onPress={openChatRoom}
      style={styles.container}
      activeOpacity={0.85}
    >
      <View style={styles.row}>
        <Image
          style={styles.avatar}
          source={{ uri: item.profileUrl }}
          placeholder={require("../assets/images/placeholder.png")}
          contentFit="cover"
        />
        <View style={styles.textContainer}>
          <View style={styles.topRow}>
            <Text style={styles.username}>{username}</Text>
          </View>

          <Text style={styles.preview} numberOfLines={1}>
            {renderLastMessage()}
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
