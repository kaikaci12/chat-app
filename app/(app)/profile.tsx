import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Image } from "expo-image";

const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string>(user.profileUrl);
  const [newUsername, setNewUsername] = useState<string | undefined>(
    user.username || undefined
  );

  const handleUpdateProfile = async (newProfileUrl: string) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, "users", user.userId), {
        profileUrl: newProfileUrl,
        username: newUsername, // Update username as well
      });
      await updateUserProfile(newProfileUrl, user.userId);
      setImage(newProfileUrl);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow access to your photos");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      handleUpdateProfile(result.assets[0].uri);
    }
  };

  const handleSaveChanges = () => {
    if (loading) return; // Prevent saving if loading
    handleUpdateProfile(image); // Call the function to save profile
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        {/* Profile Picture Section */}
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: image,
            }}
            placeholder={require("../../assets/images/placeholder.png")}
            style={styles.avatar}
          />
          <TouchableOpacity
            style={styles.editButton}
            onPress={pickImage}
            disabled={loading}
          >
            <Ionicons name="camera" size={hp(2.5)} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* User Info Section */}
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Ionicons
              name="person"
              size={hp(2.5)}
              color="#666"
              style={styles.icon}
            />
            <View>
              <Text style={styles.label}>Username</Text>
              <Text
                style={styles.value}
                onPress={() => {
                  // Allow user to update the username
                  const updatedUsername = prompt(
                    "Enter new username:",
                    newUsername || ""
                  );
                  if (updatedUsername !== null) setNewUsername(updatedUsername);
                }}
              >
                {newUsername || "Not set"}
              </Text>
            </View>
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#0000ff" />
              <Text style={styles.loadingText}>Updating profile...</Text>
            </View>
          )}
        </View>

        {/* Save Changes Button */}
        <TouchableOpacity
          style={[styles.saveButton, loading && { backgroundColor: "#ccc" }]}
          onPress={handleSaveChanges}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: hp(2),
  },
  profileContainer: {
    backgroundColor: "#fff",
    borderRadius: hp(2),
    padding: hp(3),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: hp(3),
  },
  avatar: {
    width: hp(15),
    height: hp(15),
    borderRadius: hp(7.5),
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  editButton: {
    position: "absolute",
    right: wp(2),
    bottom: hp(1),
    backgroundColor: "#4CAF50",
    borderRadius: hp(3),
    padding: hp(1.5),
  },
  infoContainer: {
    marginTop: hp(2),
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  icon: {
    marginRight: wp(4),
    width: wp(8),
  },
  label: {
    fontSize: hp(1.8),
    color: "#888",
    marginBottom: hp(0.5),
  },
  value: {
    fontSize: hp(2),
    color: "#333",
    fontWeight: "500",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: hp(2),
  },
  loadingText: {
    marginLeft: wp(2),
    color: "#666",
    fontSize: hp(1.8),
  },
  saveButton: {
    marginTop: hp(3),
    backgroundColor: "#4CAF50",
    paddingVertical: hp(1.5),
    borderRadius: hp(2),
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontSize: hp(2),
    color: "#fff",
    fontWeight: "600",
  },
});
