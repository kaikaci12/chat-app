import { StyleSheet, Text, View } from "react-native";
import React, { useRef, useState, useEffect } from "react";
import { UserType } from "@/app/types";
import { Image } from "expo-image";
import { TouchableOpacity, FlatList, Modal, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import UserUI from "./UserUI";
import { getRoomId } from "@/utils/common";

interface ContactModalProps {
  contactModalVisible: boolean;
  setContactModalVisible: (visible: boolean) => void;
  users: UserType[];
  currentUser: UserType;
}

const ContactModal = ({
  contactModalVisible,
  setContactModalVisible,
  users,
  currentUser,
}: ContactModalProps) => {
  const router = useRouter();

  const originalUsersRef = useRef<UserType[]>(users);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>(users);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(originalUsersRef.current);
    } else {
      const filtered = originalUsersRef.current.filter((user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery]);

  useEffect(() => {
    originalUsersRef.current = users;
    setFilteredUsers(users);
  }, [users]);
  const handleContactPress = (user: UserType) => {
    const chatRoomId = getRoomId(currentUser.userId, user.userId);

    router.push({
      pathname: "/chatRoom",
      params: {
        imageUrl: user.profileUrl || "",
        chatRoomId: chatRoomId,
        type: "private",
        name: user.username,
        members: [currentUser.userId, user.userId],
        createdBy: currentUser.userId,
      },
    });

    setContactModalVisible(false);
  };

  return (
    <Modal visible={contactModalVisible} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Start a Chat</Text>
          <TouchableOpacity onPress={() => setContactModalVisible(false)}>
            <Ionicons name="close" size={28} color="red" />
          </TouchableOpacity>
        </View>

        <TextInput
          placeholder="Search Contacts with username"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.input}
        />

        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.userId}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleContactPress(item)}
            >
              <UserUI item={item} />
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );
};

export default ContactModal;

const styles = StyleSheet.create({
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
