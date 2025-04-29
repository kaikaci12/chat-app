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
import React, { useEffect, useState } from "react";
import { Image } from "expo-image";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { UserType, ChatRoomType } from "@/app/types";

interface Props {
  visible: boolean;
  onClose: () => void;
  chatRoom: ChatRoomType;
  currentUser: UserType;
  allUsers: UserType[];
}

export default function ManageGroupModal({
  visible,
  onClose,
  chatRoom,
  currentUser,
  allUsers,
}: Props) {
  const [groupName, setGroupName] = useState(chatRoom.name);
  const [groupImage, setGroupImage] = useState(chatRoom.imageUrl);
  const [members, setMembers] = useState<UserType[]>([]);
  const [search, setSearch] = useState("");
  const [addingUsers, setAddingUsers] = useState<UserType[]>([]);

  useEffect(() => {
    const existing = allUsers.filter((u) =>
      chatRoom.members.includes(u.userId)
    );
    setMembers(existing);
  }, [chatRoom.members, allUsers]);

  const handleRemove = (userId: string) => {
    if (userId === currentUser.userId) return;
    setMembers((prev) => prev.filter((u) => u.userId !== userId));
  };

  const handleAddUser = (user: UserType) => {
    if (!members.some((m) => m.userId === user.userId)) {
      setMembers((prev) => [...prev, user]);
      setAddingUsers([]);
      setSearch("");
    }
  };

  const handleSave = async () => {
    const memberIds = members.map((u) => u.userId);
    const chatRoomRef = doc(db, "chatRooms", chatRoom.chatRoomId);

    await updateDoc(chatRoomRef, {
      name: groupName,
      imageUrl: groupImage,
      members: memberIds,
    });

    onClose();
  };

  const filteredUsers = allUsers.filter(
    (u) =>
      !members.some((m) => m.userId === u.userId) &&
      u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Manage Group</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <TextInput
          placeholder="Group Name"
          value={groupName}
          onChangeText={setGroupName}
          style={styles.input}
          placeholderTextColor="#777"
        />
        <TextInput
          placeholder="Group Image URL"
          value={groupImage}
          onChangeText={setGroupImage}
          style={styles.input}
          placeholderTextColor="#777"
        />

        <Text style={styles.subheading}>Members ({members.length})</Text>
        <FlatList
          data={members}
          keyExtractor={(item) => item.userId}
          renderItem={({ item }) => (
            <View style={styles.memberRow}>
              <View style={styles.memberInfo}>
                <Image
                  source={{ uri: item.profileUrl }}
                  style={styles.avatar}
                />
                <Text style={styles.username}>{item.username}</Text>
              </View>
              {item.userId !== currentUser.userId && (
                <TouchableOpacity onPress={() => handleRemove(item.userId)}>
                  <Ionicons name="remove-circle" size={24} color="red" />
                </TouchableOpacity>
              )}
            </View>
          )}
        />

        <TextInput
          placeholder="Add member..."
          value={search}
          onChangeText={setSearch}
          style={styles.input}
          placeholderTextColor="#777"
        />
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.userId}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.userRow}
              onPress={() => handleAddUser(item)}
            >
              <Image source={{ uri: item.profileUrl }} style={styles.avatar} />
              <Text style={styles.username}>{item.username}</Text>
              <Ionicons name="add-circle" size={20} color="#4CAF50" />
            </TouchableOpacity>
          )}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#111" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  input: {
    borderWidth: 1,
    borderColor: "#444",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    color: "#fff",
  },
  subheading: {
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 8,
    color: "#ccc",
  },
  memberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  memberInfo: { flexDirection: "row", alignItems: "center" },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    justifyContent: "space-between",
  },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  username: { color: "#fff", fontSize: 16 },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
