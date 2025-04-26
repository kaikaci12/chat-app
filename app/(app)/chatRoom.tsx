import {
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
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
import { getRoomId } from "@/utils/common"; // Assuming you have this function to get the chatRoomId
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
  const item = useLocalSearchParams(); // user who is chatting with
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]); // Messages state
  const [textRef, setTextRef] = useState<string>(""); // Text input state
  const [chatRoomData, setChatRoomData] = useState<any>(null); // State to hold chat room data
  const inputRef = useRef<any | null>(null);
  const scrollViewRef = useRef<any | null>(null);

  const [isGroupChat, setIsGroupChat] = useState<boolean>(false); // State to track if it's a group chat

  useEffect(() => {
    // Check if it's a group chat or private chat
    checkChatType();

    // Create chat room if it doesn't exist
    createChatRoomIfNotExists();

    // Get chatRoom ID and messages collection
    let chatRoomId = getRoomId(user?.userId, item?.userId as string);
    const docRef = doc(db, "chatRooms", chatRoomId);
    const messagesRef = collection(docRef, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    // Set up real-time listener
    const unsub = onSnapshot(q, (snap) => {
      let allMessages = snap.docs.map((doc: any) => doc.data());
      setMessages(allMessages);
    });

    // Handle keyboard show event to scroll to end
    const keyBoardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      updateScrollView
    );

    // Cleanup on unmount
    return () => {
      keyBoardDidShowListener.remove();
      unsub(); // Unsubscribe from the snapshot listener
    };
  }, []);

  const checkChatType = async () => {
    // Fetch the chat room document to check if it's a group chat
    if (user?.userId) {
      let chatRoomId = getRoomId(user?.userId, item?.userId as string);
      const docRef = doc(db, "chatRooms", chatRoomId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const chatData = docSnap.data();
        setChatRoomData(chatData); // Set the chat room data to be used in the UI

        // Check if there are more than two members in the room for group chat
        if (chatData?.members && chatData?.members.length > 2) {
          setIsGroupChat(true);
        }
      }
    }
  };

  const createChatRoomIfNotExists = async () => {
    if (user?.userId) {
      let chatRoomId = getRoomId(user?.userId, item?.userId as string);
      const docRef = doc(db, "chatRooms", chatRoomId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // If the chat room doesn't exist, create it
        const participants = isGroupChat
          ? [...item?.participants] // For group chat, add all participants
          : [user?.userId, item?.userId]; // For private chat, only the two users

        await setDoc(docRef, {
          chatRoomId,
          createdAt: Timestamp.fromDate(new Date()),
          createdBy: user?.userId,
          members: participants,
          name: isGroupChat
            ? item?.name
            : `${user?.username} & ${item?.username}`, // Dynamic name for group or private
          type: isGroupChat ? "group" : "private", // Determine chat type
          groupImage: isGroupChat ? item?.groupImage : "",
        });
      }
    }
  };

  const updateScrollView = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendMessage = async () => {
    const message = textRef.trim();
    if (!message) return;

    try {
      if (user?.userId) {
        let chatRoomId = getRoomId(user?.userId, item?.userId as string);
        const docRef = doc(db, "chatRooms", chatRoomId);
        const messagesRef = collection(docRef, "messages");

        // Clear input and focus
        setTextRef("");
        inputRef.current?.clear();
        inputRef.current?.focus();

        // Add message to Firestore
        const newDoc = await addDoc(messagesRef, {
          userId: user?.userId,
          text: message,
          profileUrl: user?.profileUrl,
          senderName: user?.username,
          createdAt: Timestamp.fromDate(new Date()),
        });

        console.log("New message ID: ", newDoc.id);
      }
    } catch (error: any) {
      Alert.alert("Message", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ChatRoomHeader
        user={item}
        router={router}
        isGroupChat={isGroupChat}
        groupImage={chatRoomData?.groupImage} // Pass the group image if available
        chatRoomName={chatRoomData?.name} // Pass the group or private chat name
      />
      <View style={styles.headerBottom} />

      {/* Message container */}
      <View style={styles.messageContainer}>
        <MessageList
          scrollViewRef={scrollViewRef}
          messages={messages}
          currentUser={user}
        />
      </View>

      {/* Input container */}
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
