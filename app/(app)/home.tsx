import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import ChatList from "@/components/ChatList";
import { StatusBar } from "expo-status-bar";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  where,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import { Image } from "expo-image";
import { db, usersRef } from "@/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import uuid from "react-native-uuid";
import { useRouter } from "expo-router";
import { ChatRoomType, UserType } from "../types";

import ContactModal from "@/components/ContactModal";
import { Timestamp } from "firebase/firestore";
import GroupModal from "@/components/GroupModal";
const Home = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatRooms, setChatRooms] = useState<ChatRoomType[]>([]);

  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [selectedGroupUsers, setSelectedGroupUsers] = useState<any[]>([]);
  const [groupName, setGroupName] = useState("");
  const [groupImage, setGroupImage] = useState("");
  const router = useRouter();

  // Fetch Users
  const getUsers = async () => {
    try {
      setLoading(true);
      const q = query(usersRef, where("userId", "!=", user?.userId));
      const querySnapshot = await getDocs(q);
      let data: any = [];
      querySnapshot.forEach((doc) => {
        data.push({ ...doc.data() });
      });
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  //  const getChatRooms = async () => {
  //     try {
  //       setLoading(true);
  //       const q = query(
  //         collection(db, "chatRooms"),
  //         where("members", "array-contains", user?.userId),
  //         orderBy("lastMessage.createdAt", "desc")
  //       );
  //       const querySnapshot = await getDocs(q);
  //       let rooms: any[] = [];
  //       querySnapshot.forEach((doc) => {
  //         rooms.push(doc.data());
  //       });

  //       setChatRooms(rooms);
  //     } catch (error) {
  //       console.error("Error fetching chat rooms:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  useEffect(() => {
    if (!user?.userId) return;

    // Real-time listener for chat rooms
    const q = query(
      collection(db, "chatRooms"),
      where("members", "array-contains", user.userId),
      orderBy("lastMessage.createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const rooms: any[] = [];
      querySnapshot.forEach((doc) => {
        rooms.push(doc.data());
      });
      console.log("rooms: ", rooms);
      setChatRooms(rooms);
    });

    return () => unsubscribe();
  }, [user?.userId]);

  useEffect(() => {
    if (!user?.userId) return;
    getUsers(); // Only runs once when user logs in
  }, [user?.userId]);

  // // Fetch data on component mount
  // useEffect(() => {
  //   if (user?.userId) {
  //     getUsers();
  //     getChatRooms(); // Fetch chat rooms where current user is a member
  //   }
  // }, [user?.userId]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.headerButtons}>
        <TouchableOpacity onPress={() => setContactModalVisible(true)}>
          <Ionicons name="chatbox" size={28} color="green" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setGroupModalVisible(true)}>
          <Ionicons name="people" size={28} color="blue" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={"green"} />
        </View>
      ) : (
        <ChatList currentUser={user} chatRooms={chatRooms} /> // Pass chatRooms to ChatList
      )}
      <ContactModal
        currentUser={user}
        contactModalVisible={contactModalVisible}
        setContactModalVisible={setContactModalVisible}
        users={users}
      />

      <GroupModal
        visible={groupModalVisible}
        onClose={() => setGroupModalVisible(false)}
        users={users}
        currentUser={user}
      />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: hp(2),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    padding: hp(2),
    backgroundColor: "#f8f9fa",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: hp(2),
    paddingBottom: hp(1),
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: hp(2.5),
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    backgroundColor: "#ff4444",
    borderRadius: 20,
    padding: 5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: hp(2),
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: hp(5),
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: hp(2),
    fontSize: hp(1.8),
    color: "#333",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  selectedCount: {
    color: "#666",
    marginBottom: hp(1),
    fontSize: hp(1.6),
  },
  userList: {
    paddingBottom: hp(10),
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(3),
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: hp(1),
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  selectedUser: {
    backgroundColor: "#e8f5e9",
    borderLeftWidth: 3,
    borderLeftColor: "#4CAF50",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    marginRight: wp(3),
  },
  username: {
    fontSize: hp(1.8),
    color: "#333",
  },
  emptyText: {
    textAlign: "center",
    color: "#777",
    marginTop: hp(2),
    fontSize: hp(1.8),
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: hp(1.8),
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: hp(1),
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: hp(1.8),
    fontWeight: "bold",
  },
});
