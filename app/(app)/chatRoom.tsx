import {
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  Platform,
  Alert,
  KeyboardAvoidingView,
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
import { getRoomId } from "@/utils/common";
import {
  setDoc,
  doc,
  Timestamp,
  collection,
  addDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { Keyboard } from "react-native";
import { onSnapshot } from "firebase/firestore";
const ChatRoom = () => {
  const item = useLocalSearchParams(); //user who is chatting with
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any>([]); // Assuming you have a messages state to hold chat messages
  const [textRef, setTextRef] = useState<string>("");
  const inputRef = useRef<any | null>(null);
  const scrollViewRef = useRef<any | null>(null);
  useEffect(() => {
    createRoomIfNotExists();
    let roomId = getRoomId(user?.userId, item?.userId as string);
    const docRef = doc(db, "rooms", roomId);
    const messagesRef = collection(docRef, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));
    let unsub = onSnapshot(q, (snap) => {
      let allMessages = snap.docs.map((doc: any) => {
        return doc.data();
      });
      setMessages([...allMessages]);
    });
    const keyBoardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      updateScrollView
    );
    return () => {
      keyBoardDidShowListener.remove();
      unsub(); // Unsubscribe from the snapshot listener when the component unmounts
    };
  }, []);
  const createRoomIfNotExists = async () => {
    if (user?.userId) {
      let roomId = getRoomId(user?.userId, item?.userId as string);
      await setDoc(doc(db, "rooms", roomId), {
        roomId,
        createdAt: Timestamp.fromDate(new Date()),
      });
    }
  };
  useEffect(() => {
    updateScrollView();
  }, [messages]);
  const updateScrollView = () => {
    setTimeout(() => {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendMessage = async () => {
    const message = textRef.trim();
    if (!message) {
      return;
    }
    try {
      if (user?.userId) {
        let roomId = getRoomId(user?.userId, item?.userId as string);
        const docRef = doc(db, "rooms", roomId);
        const messages = collection(docRef, "messages");
        setTextRef("");
        if (inputRef.current) {
          inputRef.current.clear();

          inputRef.current.focus();
        }
        const newDoc = await addDoc(messages, {
          userId: user?.userId,
          text: message,
          profileUrl: user?.profileUrl,
          senderName: user?.username,
          createdAt: Timestamp.fromDate(new Date()),
        });
        console.log("new message with ID: ", newDoc.id);
      }
    } catch (error: any) {
      Alert.alert("Message", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <ChatRoomHeader user={item} router={router} />
      <View style={styles.headerBottom} />
      <View style={styles.messageContainer}>
        <View style={{ flex: 1 }}>
          <MessageList
            scrollViewRef={scrollViewRef}
            messages={messages}
            currentUser={user}
          />
        </View>
        <View style={styles.inputWrapper}>
          <View style={[styles.messageInput, { height: hp(6) }]}>
            <TextInput
              style={styles.input}
              placeholder="Type message..."
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
                color={textRef.trim() == "" ? "#ccc" : "green"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    width: "100%",
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
    paddingVertical: 0, // Let the container handle height
    textAlignVertical: "center",
    includeFontPadding: false,
  },
  sendButton: {
    padding: hp(1),
    marginLeft: wp(2),
  },
});
