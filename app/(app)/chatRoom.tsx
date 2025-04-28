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
  arrayUnion,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";

const ChatRoom = () => {
  const item = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [messages, setMessages] = useState<any[]>([]);
  const [textRef, setTextRef] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const inputRef = useRef<any | null>(null);
  const scrollViewRef = useRef<any | null>(null);

  const isGroupChat = useMemo(() => item.type === "group", [item.type]);

  const chatRoomId = useMemo(() => {
    return isGroupChat
      ? (item.chatRoomId as string)
      : (item.chatRoomId as string) ||
          getRoomId(user?.userId, item?.userId as string);
  }, [isGroupChat, item.chatRoomId, user?.userId]);
  useEffect(() => {
    if (!chatRoomId || !user?.userId) return;
    createChatRoomIfNotExists();

    const docRef = doc(db, "chatRooms", chatRoomId);
    const messagesRef = collection(docRef, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsub = onSnapshot(q, (snap) => {
      const allMessages = snap.docs.map((docSnap) => {
        const data = docSnap.data();
        const id = docSnap.id; // Message ID

        // If current user hasn't seen it, mark as seen
        if (data?.seenBy && !data.seenBy.includes(user.userId)) {
          const messageRef = doc(db, "chatRooms", chatRoomId, "messages", id);
          updateDoc(messageRef, {
            seenBy: arrayUnion(user.userId),
          });
        }

        return { id, ...data };
      });

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

    try {
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        const chatRoomData: any = {
          chatRoomId,
          createdAt: Timestamp.fromDate(new Date()),
          members: item.members,
          name: item.name,
          imageUrl: item.imageUrl,
          createdBy: item.createdBy,
          type: item.type,
          lastMessage: {
            text: "",
            createdAt: Timestamp.fromDate(new Date()),
            userId: "",
            seenBy: [],
            profileUrl: "",
            senderName: "",
          },
        };

        await setDoc(docRef, chatRoomData);
        console.log("Chat room created successfully", chatRoomData);
      }
    } catch (error) {
      console.error("Error creating chat room:", error);
      Alert.alert("Error", "Failed to create chat room");
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
      const newMessage = {
        userId: user.userId,
        text: message,
        profileUrl: user.profileUrl,
        senderName: user.username,
        createdAt: Timestamp.fromDate(new Date()),
        seenBy: [user.userId],
      };

      await addDoc(messagesRef, newMessage);
      await updateDoc(docRef, {
        lastMessage: newMessage,
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
        item={item}
        setShowModal={setShowModal}
        showModal={showModal}
        isGroupChat={isGroupChat}
        chatRoomName={item.name}
        imageUrl={item.imageUrl}
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
