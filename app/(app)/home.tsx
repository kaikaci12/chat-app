import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import ChatList from "@/components/ChatList";
import { StatusBar } from "expo-status-bar";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { getDocs, query, where } from "firebase/firestore";
import { usersRef } from "@/firebaseConfig";
const Home = () => {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const getUser = async () => {
    const q = query(usersRef, where("userId", "!=", user?.uid));
    const querySnapshot = await getDocs(q);
    let data: any = [];
    querySnapshot.forEach((doc) => {
      data.push({ ...doc.data() });
    });
    setUsers(data);
  };
  useEffect(() => {
    if (user?.uid) {
      getUser();
    }
  }, []);
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {users.length > 0 ? (
        <ChatList users={users} />
      ) : (
        <View style={{ flex: 1, alignItems: "center", top: hp(13) }}>
          <ActivityIndicator size="large" color={"green"} />
        </View>
      )}
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
