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
  where,
  arrayUnion,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db, usersRef } from "@/firebaseConfig";
import ManageGroupModal from "@/components/ManageGroupModal";
import { UserType } from "../types";

const ChatRoom = () => {
  const item = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [messages, setMessages] = useState<any[]>([]);
  const [textRef, setTextRef] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const inputRef = useRef<any | null>(null);
  const scrollViewRef = useRef<any | null>(null);

  const isGroupChat = useMemo(() => item.type === "group", [item.type]);
  const [chatRoom, setChatRoom] = useState<any>(item);

  const chatRoomId = useMemo(() => {
    return isGroupChat
      ? (item.chatRoomId as string)
      : (item.chatRoomId as string) ||
          getRoomId(user?.userId, item?.userId as string);
  }, [isGroupChat, item.chatRoomId, user?.userId]);

  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  useEffect(() => {
    if (!chatRoomId || !user?.userId) return;

    const docRef = doc(db, "chatRooms", chatRoomId);
    const messagesRef = collection(docRef, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const messagesUnsub = onSnapshot(q, (snap) => {
      const allMessages = snap.docs.map((docSnap) => {
        const data = docSnap.data();
        const id = docSnap.id;

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

    // ✅ Listen to chatRoom changes
    const chatRoomUnsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const updatedRoom = docSnap.data();
        updatedRoom.members = parseMembers(updatedRoom.members);
        setChatRoom(updatedRoom);
        console.log("chatRoom updated", updatedRoom);
      }
    });

    const keyBoardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      updateScrollView
    );

    getAllUsers();

    return () => {
      messagesUnsub();
      chatRoomUnsub();
      keyBoardDidShowListener.remove();
    };
  }, [chatRoomId]);

  function parseMembers(members: string | string[]): string[] {
    if (Array.isArray(members)) return members;
    return JSON.parse(members);
  }

  const getAllUsers = async () => {
    try {
      const q = query(usersRef, where("userId", "!=", user?.userId));
      const querySnapshot = await getDocs(q);
      let data: any = [];
      querySnapshot.forEach((doc) => {
        data.push({ ...doc.data() });
      });
      setAllUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
    }
  };
  const createChatRoomIfNotExists = async () => {
    if (!user?.userId || !chatRoomId) return;

    const docRef = doc(db, "chatRooms", chatRoomId);

    try {
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        const chatRoomData: any = {
          chatRoomId,
          createdAt: Timestamp.fromDate(new Date()),
          members: parseMembers(item.members),

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
      setTextRef("");
      inputRef.current?.clear();
      inputRef.current?.focus();

      await createChatRoomIfNotExists();
      const docRef = doc(db, "chatRooms", chatRoomId);
      const messagesRef = collection(docRef, "messages");

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
        item={chatRoom} // Use chatRoom state here
        setShowModal={setShowModal}
        showModal={showModal}
        isGroupChat={isGroupChat}
        chatRoomName={chatRoom.name} // Dynamically render updated name
        imageUrl={chatRoom.imageUrl} // Dynamically render updated image
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
      <ManageGroupModal
        visible={showModal}
        chatRoom={item}
        allUsers={allUsers}
        currentUser={user}
        onClose={() => setShowModal(false)}
      />
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
