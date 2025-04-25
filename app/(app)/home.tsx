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
import { collection, getDocs, query, setDoc, where } from "firebase/firestore";
import { db, usersRef } from "@/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import uuid from "react-native-uuid";

const Home = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [selectedGroupUsers, setSelectedGroupUsers] = useState<any[]>([]);
  const [groupName, setGroupName] = useState("");
  const [groupImage, setGroupImage] = useState("");

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
      setFilteredUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Chat Rooms where the current user is a member
  const getChatRooms = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "chatRooms"),
        where("members", "array-contains", user?.userId)
      );
      const querySnapshot = await getDocs(q);
      let rooms: any[] = [];
      querySnapshot.forEach((doc) => {
        rooms.push(doc.data());
      });
      setChatRooms(rooms);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  // Create Private Room
  const createPrivateRoom = async (otherUser: any) => {
    const members = [user.userId, otherUser.userId].sort();
    const roomId = `${members[0]}_${members[1]}`;
    const roomRef = doc(db, "chatRooms", roomId);

    await setDoc(roomRef, {
      roomId,
      type: "private",
      members,
      createdAt: new Date(),
    });

    setContactModalVisible(false);
    getChatRooms(); // Fetch updated chat rooms
  };

  const createGroupRoom = async () => {
    if (!groupName.trim() || selectedGroupUsers.length === 0) return;

    const roomId = uuid.v4();
    const memberIds = [user.userId, ...selectedGroupUsers.map((u) => u.userId)];

    const roomRef = doc(db, "chatRooms", roomId);

    await setDoc(roomRef, {
      roomId,
      type: "group",
      name: groupName,
      groupImage: groupImage || "",
      members: memberIds,
      createdBy: user.userId,
      createdAt: new Date(),
    });

    setGroupName("");
    setGroupImage("");
    setSelectedGroupUsers([]);
    setGroupModalVisible(false);
    getChatRooms(); // Fetch updated chat rooms
  };

  // Toggle Group User Selection
  const toggleGroupUser = (userToAdd: any) => {
    if (selectedGroupUsers.find((u) => u.userId === userToAdd.userId)) {
      setSelectedGroupUsers((prev) =>
        prev.filter((u) => u.userId !== userToAdd.userId)
      );
    } else {
      setSelectedGroupUsers((prev) => [...prev, userToAdd]);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    if (user?.userId) {
      getUsers();
      getChatRooms(); // Fetch chat rooms where current user is a member
    }
  }, [user?.userId]);

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

      {/* Contact Modal */}
      <Modal visible={contactModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Start a Chat</Text>
            <TouchableOpacity onPress={() => setContactModalVisible(false)}>
              <Ionicons name="close" size={28} color="red" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={users}
            keyExtractor={(item) => item.userId}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.userItem}
                onPress={() => createPrivateRoom(item)}
              >
                <Text>{item.username}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      {/* Group Modal */}
      <Modal visible={groupModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Group</Text>
            <TouchableOpacity onPress={() => setGroupModalVisible(false)}>
              <Ionicons name="close" size={28} color="red" />
            </TouchableOpacity>
          </View>
          <TextInput
            placeholder="Group Name"
            value={groupName}
            onChangeText={setGroupName}
            style={styles.input}
          />
          <FlatList
            data={users}
            keyExtractor={(item) => item.userId}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.userItem,
                  selectedGroupUsers.find((u) => u.userId === item.userId) &&
                    styles.selectedUser,
                ]}
                onPress={() => toggleGroupUser(item)}
              >
                <Text>{item.username}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={styles.submitButton}
            onPress={createGroupRoom}
          >
            <Text style={{ color: "white" }}>Create Group</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
    padding: 20,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(2),
    justifyContent: "space-between",
  },
  modalTitle: {
    fontSize: hp(2.5),
    fontWeight: "bold",
  },
  userItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  selectedUser: {
    backgroundColor: "#d0f0c0",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: "green",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
});
