import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Timestamp, doc, setDoc } from "firebase/firestore";
import uuid from "react-native-uuid";
import { db } from "@/firebaseConfig";
import { UserType } from "@/app/types";
import { useRouter } from "expo-router";

interface Props {
  visible: boolean;
  onClose: () => void;
  users: UserType[];
  currentUser: UserType;
}

const GroupModal = ({ visible, onClose, users, currentUser }: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupImage, setGroupImage] = useState("");
  const [selectedGroupUsers, setSelectedGroupUsers] = useState<UserType[]>([]);
  const router = useRouter();
  const filteredGroupUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleGroupUser = (userToAdd: UserType) => {
    if (selectedGroupUsers.find((u) => u.userId === userToAdd.userId)) {
      setSelectedGroupUsers((prev) =>
        prev.filter((u) => u.userId !== userToAdd.userId)
      );
    } else {
      setSelectedGroupUsers((prev) => [...prev, userToAdd]);
    }
  };

  const createGroupRoom = async () => {
    if (
      !groupName.trim() ||
      selectedGroupUsers.length === 0 ||
      !currentUser?.userId
    )
      return;

    const groupRoomId = uuid.v4();
    const memberIds = [
      currentUser.userId,
      ...selectedGroupUsers.map((u) => u.userId),
    ];

    const roomRef = doc(db, "chatRooms", groupRoomId as string);

    await setDoc(roomRef, {
      chatRoomId: groupRoomId,
      type: "group",
      name: groupName,
      imageUrl: groupImage,
      members: memberIds,
      createdBy: currentUser.userId,
      createdAt: Timestamp.fromDate(new Date()),
      lastMessage: {
        text: "",
        createdAt: Timestamp.fromDate(new Date()),
        userId: "",
        seenBy: [],
        profileUrl: "",
        senderName: "",
      },
    });

    // Reset state
    setGroupName("");
    setGroupImage("");
    setSelectedGroupUsers([]);
    setSearchQuery("");

    onClose(); // Close modal
    console.log("groupChat created successfully");
    router.push({
      pathname: "/chatRoom",
      params: {
        chatRoomId: groupRoomId.toString(),
        name: groupName,
        imageUrl: groupImage,
        type: "group",
        members: JSON.stringify(memberIds), // important!
        createdBy: currentUser.userId,
      },
    });
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Create Group</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#777"
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            placeholderTextColor="#777"
          />
        </View>

        <TextInput
          placeholder="Group Name"
          placeholderTextColor="#777"
          value={groupName}
          onChangeText={setGroupName}
          style={styles.input}
        />

        <Text style={styles.selectedCount}>
          {selectedGroupUsers.length}{" "}
          {selectedGroupUsers.length === 1 ? "member" : "members"} selected
        </Text>

        <FlatList
          data={filteredGroupUsers}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={styles.userList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.userItem,
                selectedGroupUsers.find((u) => u.userId === item.userId) &&
                  styles.selectedUser,
              ]}
              onPress={() => toggleGroupUser(item)}
            >
              <View style={styles.userInfo}>
                <Image
                  style={styles.avatar}
                  source={{ uri: item.profileUrl }}
                  placeholder={require("@/assets/images/placeholder.png")}
                  contentFit="cover"
                />
                <Text style={styles.username}>{item.username}</Text>
              </View>
              {selectedGroupUsers.find((u) => u.userId === item.userId) && (
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No users found</Text>
          }
        />

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!groupName.trim() || selectedGroupUsers.length === 0) &&
              styles.disabledButton,
          ]}
          onPress={createGroupRoom}
          disabled={!groupName.trim() || selectedGroupUsers.length === 0}
        >
          <Text style={styles.submitButtonText}>Create Group</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default GroupModal;

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: "#fff", padding: 16 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  closeButton: { padding: 4 },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eee",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  searchIcon: { marginRight: 6 },
  searchInput: { flex: 1, height: 40 },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  selectedCount: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "600",
  },
  userList: { paddingBottom: 20 },
  userItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  userInfo: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  username: { fontSize: 16 },
  selectedUser: { backgroundColor: "#e0f7e9" },
  emptyText: { textAlign: "center", marginTop: 20, color: "#777" },

  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: "#aaa",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
