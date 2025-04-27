import {
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Text,
} from "react-native";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import ChatRoomHeader from "@/components/ChatRoomHeader";
import MessageList from "@/components/MessageList";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "../context/authContext";
import { getRoomId } from "@/utils/common";
import {
  setDoc,
  doc,
  Timestamp,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";

const ChatRoom = () => {
  const item = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [messages, setMessages] = useState<any[]>([]);
  const [textRef, setTextRef] = useState<string>("");
  const inputRef = useRef<any | null>(null);
  const scrollViewRef = useRef<any | null>(null);

  const isGroupChat = useMemo(() => item.type === "group", [item.type]);

  const chatRoomId = useMemo(() => {
    return isGroupChat
      ? (item.roomId as string)
      : (item.chatRoomId as string) ||
          getRoomId(user?.userId, item?.userId as string);
  }, [isGroupChat, item.roomId, item.chatRoomId, user?.userId, item?.userId]);

  useEffect(() => {
    if (!chatRoomId || !user?.userId) return;

    createChatRoomIfNotExists();

    const docRef = doc(db, "chatRooms", chatRoomId);
    const messagesRef = collection(docRef, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsub = onSnapshot(q, (snap) => {
      const allMessages = snap.docs.map((doc) => doc.data());
      setMessages(allMessages);
    });

    const keyBoardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      updateScrollView
    );

    return () => {
      unsub();
      keyBoardDidShowListener.remove();
    };
  }, [chatRoomId]);

  const createChatRoomIfNotExists = async () => {
    if (!user?.userId || !chatRoomId) return;

    const docRef = doc(db, "chatRooms", chatRoomId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      const participants = isGroupChat
        ? item.members
        : [user.userId, item.userId];

      await setDoc(docRef, {
        chatRoomId,
        createdAt: Timestamp.fromDate(new Date()),
        createdBy: user.userId,
        members: participants,
        name: isGroupChat ? item.name : `${item.username}`,
        type: item.type,
        groupImage: isGroupChat ? item.groupImage : "",
      });
    }
  };

  const updateScrollView = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendMessage = async () => {
    const message = textRef.trim();
    if (!message || !user?.userId || !chatRoomId) return;

    try {
      const docRef = doc(db, "chatRooms", chatRoomId);
      const messagesRef = collection(docRef, "messages");

      setTextRef("");
      inputRef.current?.clear();
      inputRef.current?.focus();

      await addDoc(messagesRef, {
        userId: user?.userId,
        text: message,
        profileUrl: user?.profileUrl,
        senderName: user?.username,
        createdAt: Timestamp.now(),
      });
    } catch (error: any) {
      Alert.alert("Message", error.message);
    }
  };

  if (!chatRoomId || !user?.userId) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <Text style={{ textAlign: "center", marginTop: 50 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ChatRoomHeader
        user={item}
        router={router}
        isGroupChat={isGroupChat}
        groupImage={item?.groupImage}
        chatRoomName={item?.name}
      />
      <View style={styles.headerBottom} />

      <View style={styles.messageContainer}>
        <MessageList
          scrollViewRef={scrollViewRef}
          messages={messages}
          currentUser={user}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.inputWrapper}
      >
        <View style={[styles.messageInput, { height: hp(6) }]}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            multiline
            value={textRef}
            ref={inputRef}
            onChangeText={setTextRef}
            textAlignVertical="center"
            numberOfLines={1}
            autoFocus={true}
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            style={styles.sendButton}
            disabled={!textRef.trim()}
          >
            <Ionicons
              name="send"
              size={hp(2.5)}
              color={textRef.trim() ? "green" : "#ccc"}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatRoom;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerBottom: {
    width: "100%",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ddd",
  },
  messageContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  inputWrapper: {
    padding: hp(1.7),
    paddingTop: 0,
  },
  messageInput: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: hp(4),
    backgroundColor: "#fff",
    paddingHorizontal: wp(4),
    minHeight: hp(6),
    maxHeight: hp(20),
  },
  input: {
    flex: 1,
    fontSize: hp(1.9),
    paddingVertical: 0,
    textAlignVertical: "center",
    includeFontPadding: false,
  },
  sendButton: {
    padding: hp(1),
    marginLeft: wp(2),
  },
});
