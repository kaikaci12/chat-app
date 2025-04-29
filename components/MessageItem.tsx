import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Image } from "expo-image";
import { UserType, MessageType } from "@/app/types";
import { doc, getDoc, Timestamp } from "firebase/firestore"; // Make sure to import Timestamp
import { db } from "@/firebaseConfig";

interface MessageItemProps {
  message: MessageType;
  currentUser: UserType;
}

const MessageItem = ({ message, currentUser }: MessageItemProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [seenByNames, setSeenByNames] = useState<string[]>([]);

  const isMyMessage = currentUser?.userId === message?.userId;

  useEffect(() => {
    const fetchSeenByNames = async () => {
      const seenBy: string[] = [];
      for (const userId of message.seenBy) {
        const userRef = doc(db, "users", userId);
        const userSnapshot = await getDoc(userRef);
        if (userSnapshot.exists()) {
          seenBy.push(userSnapshot.data().username);
        }
      }
      setSeenByNames(seenBy);
    };

    fetchSeenByNames();
  }, [message.seenBy]);

  const getFormattedTime = () => {
    try {
      if (!message?.createdAt?.seconds) return "";

      const timestamp = message.createdAt;
      const date = new Date(
        timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000
      );

      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting message time:", error);
      return "";
    }
  };

  const getWhoHasSeenTheMessage = () => {
    return `Seen by ${seenByNames.join(", ")}`;
  };

  const formattedTime = getFormattedTime();

  const handlePress = () => {
    setShowDetails((prev) => !prev);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={
        isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
      }
      activeOpacity={0.7}
    >
      <View style={styles.messageContent}>
        {!isMyMessage && (
          <Image
            source={{ uri: message.profileUrl }}
            placeholder={require("@/assets/images/placeholder.png")}
            contentFit="cover"
            style={styles.messageProfile}
          />
        )}

        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.otherMessageText,
            ]}
          >
            {message.text}
          </Text>

          {showDetails && (
            <View
              style={{ flexDirection: "column", alignItems: "center", gap: 5 }}
            >
              <Text
                style={[
                  styles.timeText,
                  isMyMessage ? styles.myTimeText : styles.otherTimeText,
                ]}
              >
                {formattedTime}
              </Text>
              <Text
                style={[
                  styles.timeText,
                  isMyMessage ? styles.myTimeText : styles.otherTimeText,
                ]}
              >
                {getWhoHasSeenTheMessage()}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default MessageItem;

const styles = StyleSheet.create({
  myMessageContainer: {
    alignSelf: "flex-end",
    marginBottom: hp(1),
    marginRight: wp(2),
    maxWidth: wp(80),
  },
  otherMessageContainer: {
    alignSelf: "flex-start",
    marginBottom: hp(1),
    marginLeft: wp(2),
    maxWidth: wp(80),
  },
  messageContent: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  messageBubble: {
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(3.5),
    borderRadius: hp(2),
    marginHorizontal: wp(1.5),
    maxWidth: wp(70), // Added maxWidth to prevent very wide bubbles
  },
  myMessageBubble: {
    backgroundColor: "#66BB6A",
    borderBottomRightRadius: hp(0.5),
  },
  otherMessageBubble: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderBottomLeftRadius: hp(0.5),
  },
  messageText: {
    fontSize: hp(1.9),
    lineHeight: hp(2.2), // Better line spacing
  },
  myMessageText: {
    color: "#fff",
  },
  otherMessageText: {
    color: "#000",
  },
  messageProfile: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: "#ccc",
  },
  timeText: {
    fontSize: hp(1.5),
    marginTop: hp(0.5),
    alignSelf: "flex-end",
    opacity: 0.8, // Slightly transparent
  },
  myTimeText: {
    color: "#e8f5e9",
  },
  otherTimeText: {
    color: "#555",
  },
});
